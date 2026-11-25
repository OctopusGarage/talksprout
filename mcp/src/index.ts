import { createMcpHandler } from "agents/mcp/server";
import { createServer, metadata, iconBytes, iconSha256 } from "./server";
const handler = createMcpHandler(createServer, {
  route: "/mcp",
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
export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    if (
      request.method === "GET" &&
      (url.pathname === "/icon.png" ||
        url.pathname === `/icons/${iconSha256}.png`)
    )
      return new Response(iconBytes.slice().buffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": url.pathname.startsWith("/icons/")
            ? "public, max-age=31536000, immutable"
            : "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    if (url.pathname === "/health" && request.method === "GET")
      return Response.json(metadata);
    if (url.pathname === "/" && request.method === "GET")
      return Response.json({
        name: "TalkSprout MCP",
        endpoint: new URL("/mcp", url).href,
        description: "Public read-only English learning library",
        tools: ["get_guide", "read_document", "search_documents"],
      });
    if (url.pathname !== "/mcp")
      return new Response("Not found / 未找到", { status: 404 });
    if (Number(request.headers.get("content-length") || 0) > 16384)
      return new Response("Request too large / 请求过大", { status: 413 });
    if (request.method === "POST" && request.body) {
      const reader = request.body.getReader();
      const chunks: Uint8Array[] = [];
      let length = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 16384) {
          await reader.cancel();
          return new Response("Request too large / 请求过大", { status: 413 });
        }
        chunks.push(value);
      }
      const body = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
      }
      request = new Request(request, { body });
    }
    return handler.fetch(request);
  },
} satisfies ExportedHandler;
