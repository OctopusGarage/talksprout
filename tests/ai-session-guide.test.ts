import test from "node:test";
import assert from "node:assert/strict";
import { posix } from "node:path";
import { buildDocuments } from "../scripts/ai-content";

test("stable session entry reaches every task, scenario and method without broken links", () => {
  const documents = buildDocuments();
  for (const language of ["en", "zh"]) {
    const visited = new Set<string>();
    const pending = [`${language}/start.md`];
    while (pending.length) {
      const path = pending.shift()!;
      if (visited.has(path)) continue;
      visited.add(path);
      const body = documents[path];
      assert.ok(body, `Missing linked document: ${path}`);
      for (const match of body.matchAll(/\]\(([^)]+)\)/g)) {
        if (!match[1].startsWith("http"))
          pending.push(
            posix.normalize(posix.join(posix.dirname(path), match[1])),
          );
      }
    }
    for (const path of Object.keys(documents).filter(
      (path) =>
        path.startsWith(`${language}/`) && path !== `${language}/index.md`,
    ))
      assert.ok(visited.has(path), `Unreachable learning document: ${path}`);
  }
});
