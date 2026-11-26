import {
  assertCompleteDocument,
  waitForDeploymentIdentity,
} from "./mcp-verification";
import { readFile } from "node:fs/promises";
const endpoint = process.argv[2];
if (!endpoint || !endpoint.startsWith("https://") || !endpoint.endsWith("/mcp"))
  throw Error("Pass the deployed HTTPS /mcp endpoint");
const identity = JSON.parse(
  await readFile(process.argv[3] || "distribution/identity.json", "utf8"),
);
const identityKeys = [
  "name",
  "version",
  "contentVersion",
  "guidanceVersion",
  "fingerprint",
  "iconSha256",
];
const revision =
  identity.sourceRevision ||
  process.env.AI_SOURCE_REVISION ||
  process.env.GITHUB_SHA;
await waitForDeploymentIdentity(
  async () => {
    const response = await fetch(new URL("/health", endpoint), {
      cache: "no-store",
    });
    if (!response.ok) throw Error("Health failed: " + response.status);
    return response.json();
  },
  {
    ...Object.fromEntries(identityKeys.map((key) => [key, identity[key]])),
    ...(revision ? { sourceRevision: revision } : {}),
  },
);
for (const { id, method, params } of [
  {
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "talksprout-smoke", version: "1.0" },
    },
  },
  { id: 2, method: "tools/list", params: {} },
  {
    id: 3,
    method: "tools/call",
    params: {
      name: "read_document",
      arguments: { path: "en/prompts/roleplay-coach.md" },
    },
  },
  {
    id: 4,
    method: "tools/call",
    params: {
      name: "search_documents",
      arguments: { query: "vocabulary" },
    },
  },
]) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": "2025-03-26",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const text = await res.text();
  if (!res.ok) throw Error(`Protocol ${method}: ${res.status}`);
  const result = res.headers.get("content-type")?.includes("text/event-stream")
    ? text
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => JSON.parse(l.slice(5)))
        .find((p) => p.id === id)
    : JSON.parse(text);
  if (!result?.result || result.error || result.result.isError)
    throw Error("Protocol failure: " + method);
  if (
    method === "tools/list" &&
    !["get_guide", "read_document", "search_documents"].every((name) =>
      result.result.tools.some((t: { name: string }) => t.name === name),
    )
  )
    throw Error("Missing tools");
  if (id === 3)
    assertCompleteDocument(
      result.result,
      await readFile("content/en/prompts/roleplay-coach.md", "utf8"),
    );
  if (id === 4) {
    const matches = JSON.parse(result.result.content?.[0]?.text ?? "null");
    if (
      !Array.isArray(matches) ||
      matches.length > 20 ||
      matches[0]?.path !== "en/prompts/vocabulary-ipa-review.md"
    )
      throw Error("Deployed search does not prioritize the requested task");
  }
}
const iconResponse = await fetch(
  new URL(`/icons/${identity.iconSha256}.png`, endpoint),
);
if (!iconResponse.ok) throw Error("Icon unavailable");
const { createHash } = await import("node:crypto");
if (
  createHash("sha256")
    .update(new Uint8Array(await iconResponse.arrayBuffer()))
    .digest("hex") !== identity.iconSha256
)
  throw Error("Deployed icon mismatch");
console.log(
  "Deployed health identity, MCP protocol and search ranking verified",
);
