import { URL } from "node:url";
import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { createMcpHandler } from "agents/mcp/server";
import { createServer } from "../src/server";

const handler = createMcpHandler(createServer, {
  responseMode: "json",
  legacy: "stateless",
  allowedOriginHostnames: [
    "chatgpt.com",
    "claude.ai",
    "gemini.google.com",
    "www.doubao.com",
    "doubao.com",
  ],
});
async function rpc(
  id: number,
  method: string,
  params: Record<string, unknown>,
  version = "2025-03-26",
) {
  const modern = version === "2026-07-28";
  const body = {
    jsonrpc: "2.0",
    id,
    method,
    params: modern
      ? {
          ...params,
          _meta: {
            "io.modelcontextprotocol/protocolVersion": version,
            "io.modelcontextprotocol/clientInfo": {
              name: "talksprout-test",
              version: "1.0.0",
            },
            "io.modelcontextprotocol/clientCapabilities": {},
          },
        }
      : params,
  };
  const headers: Record<string, string> = {
    Host: "localhost",
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": version,
  };
  if (modern) {
    headers["Mcp-Method"] = method;
    if (method === "tools/call") headers["Mcp-Name"] = String(params.name);
  }
  const response = await handler.fetch(
    new Request("http://localhost/mcp", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }),
  );
  assert.equal(response.status, 200, await response.clone().text());
  const text = await response.text();
  const payload = response.headers
    .get("content-type")
    ?.includes("text/event-stream")
    ? text
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => JSON.parse(line.slice(5)))
        .find((message) => message.id === id)
    : JSON.parse(text);
  const result = payload as {
    id: number;
    result: {
      tools?: { name: string }[];
      content?: { text: string }[];
      isError?: boolean;
      structuredContent?: Record<string, unknown>;
    };
    error?: unknown;
  };
  assert.equal(result.id, id);
  assert.ok(!result.error, JSON.stringify(result.error));
  return result.result;
}
test("wire protocol lists tools, retrieves full documents and rejects traversal", async () => {
  const init = await rpc(1, "initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "test", version: "1.0" },
  });
  assert.ok(init);
  const listed = await rpc(2, "tools/list", {});
  assert.equal(listed.tools?.length, 3);
  const read = await rpc(3, "tools/call", {
    name: "read_document",
    arguments: { path: "en/prompts/roleplay-coach.md" },
  });
  assert.equal(
    read.content?.[0].text,
    readFileSync(
      new URL("../../content/en/prompts/roleplay-coach.md", import.meta.url),
      "utf8",
    ),
  );
  const bad = await rpc(4, "tools/call", {
    name: "read_document",
    arguments: { path: "../secret" },
  });
  assert.equal(bad.isError, true);
});

test("modern stateless protocol reads guide without initialization", async () => {
  const guide = await rpc(
    10,
    "tools/call",
    { name: "get_guide", arguments: { language: "zh" } },
    "2026-07-28",
  );
  assert.match(guide.content?.[0].text ?? "", /zh\/index.md/);
});
