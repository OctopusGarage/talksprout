import { readFile, readdir, stat } from "node:fs/promises";
async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = `${directory}/${entry.name}`;
      return entry.isDirectory()
        ? markdownFiles(path)
        : Promise.resolve(path.endsWith(".md") ? [path] : []);
    }),
  );
  return nested.flat();
}
const paths = [
  "README.md",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "distribution/plugins/talksprout/README.md",
  ...(await markdownFiles("docs")),
];
await Promise.all(
  paths.map(async (path) => {
    const text = await readFile(path, "utf8");
    if (/\b(?:TODO|TBD)\b/.test(text))
      throw Error("Unfinished documentation: " + path);
    for (const match of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
      if (/^(https?:|mailto:)/.test(match[1])) continue;
      await stat(
        new URL(match[1], new URL("../" + path, import.meta.url)),
      ).catch(() => {
        throw Error(`Broken documentation link in ${path}: ${match[1]}`);
      });
    }
  }),
);
console.log(
  `Checked local links and placeholders in ${paths.length} maintained documents`,
);
