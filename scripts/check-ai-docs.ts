import { readFile } from "node:fs/promises";
const paths = [
  "docs/README.md",
  "docs/ai-installation.md",
  "docs/mcp-server.md",
  "docs/distribution-maintenance.md",
  "docs/ai-infrastructure-parity.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
];
for (const path of paths) {
  const text = await readFile(path, "utf8");
  if (/TODO|TBD/.test(text)) throw Error("Unfinished documentation: " + path);
  for (const match of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g))
    if (!/^(https?:|mailto:)/.test(match[1]))
      await readFile(new URL(match[1], new URL("../" + path, import.meta.url)));
}
console.log("AI documentation entry points checked");
