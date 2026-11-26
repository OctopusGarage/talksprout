import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import library from "../generated/library.json" with { type: "json" };
const documents: Readonly<Record<string, string>> = library.files;
export const iconBytes = Uint8Array.from(atob(library.iconBase64), (c) =>
  c.charCodeAt(0),
);
export const iconSha256 = library.iconSha256;
export const metadata = {
  name: library.name,
  version: library.version,
  contentVersion: library.contentVersion,
  guidanceVersion: library.guidanceVersion,
  fingerprint: library.fingerprint,
  iconSha256: library.iconSha256,
  sourceRevision: library.sourceRevision,
  documentCount: Object.keys(documents).length,
};
export function readDocument(path: string): string {
  if (!Object.hasOwn(documents, path))
    throw new Error(
      "Unknown document. Use an exact index path; URLs and traversal are not accepted.",
    );
  return documents[path];
}
export function getGuide(language: "zh" | "en") {
  return `# TalkSprout\n\nRead ${language}/start.md with read_document before handling this learning request. It contains the current guided entry and learning rules. Resolve relative links against that document directory and keep this returned content identity during the task. Read only the selected catalogs and material; do not retrieve the entire library.`;
}
export function searchDocuments(query: string, language: "zh" | "en") {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return Object.entries(documents)
    .filter(
      ([p, text]) =>
        p.startsWith(language + "/") &&
        terms.every((t) => (p + " " + text).toLowerCase().includes(t)),
    )
    .map(([path, text]) => {
      const title = text.split("\n")[0].replace(/^# /, "");
      const lowerTitle = title.toLowerCase();
      const score = terms.reduce(
        (total, term) =>
          total +
          (lowerTitle.includes(term) ? 20 : 0) +
          (path.toLowerCase().includes(term) ? 5 : 0),
        path.includes("/prompts/") && !path.endsWith("/index.md") ? 2 : 0,
      );
      return { path, title, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(({ path, title }) => ({ path, title }));
}
export function createServer() {
  const server = new McpServer(
    {
      name: library.name,
      version: library.version,
      ...(library.endpoint
        ? {
            icons: [
              {
                src: new URL(`/icons/${iconSha256}.png`, library.endpoint).href,
                mimeType: "image/png",
                sizes: ["512x512"],
              },
            ],
          }
        : {}),
    },
    { instructions: library.guidance },
  );
  const annotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  };
  server.registerTool(
    "get_guide",
    {
      description:
        "Get the English learning library guide and content identity.",
      inputSchema: z.object({ language: z.enum(["zh", "en"]).default("en") }),
      annotations,
    },
    async ({ language }) => ({
      content: [{ type: "text", text: getGuide(language) }],
      structuredContent: metadata,
    }),
  );
  server.registerTool(
    "read_document",
    {
      description:
        "Read a complete coach, review, scenario, learning prompt or guide by exact path.",
      inputSchema: z.object({ path: z.string().min(1).max(240) }),
      annotations,
    },
    async ({ path }) => {
      try {
        return {
          content: [{ type: "text", text: readDocument(path) }],
          structuredContent: { path, ...metadata },
        };
      } catch {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "Unknown document. Use an exact index path; no URLs or traversal.",
            },
          ],
        };
      }
    },
  );
  server.registerTool(
    "search_documents",
    {
      description:
        "Search public English learning documents. Returns at most 20 paths; read the selected document before coaching.",
      inputSchema: z.object({
        query: z.string().min(1).max(160),
        language: z.enum(["zh", "en"]).default("en"),
      }),
      annotations,
    },
    async ({ query, language }) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(searchDocuments(query, language)),
        },
      ],
    }),
  );
  return server;
}
