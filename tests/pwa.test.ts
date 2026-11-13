import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { build } from "vite";

test("public manifest and icon bytes invalidate the production worker", async () => {
  const root = resolve(import.meta.dirname, "..");
  const temp = await mkdtemp(join(tmpdir(), "talksprout-pwa-"));
  try {
    const publicDir = join(temp, "public");
    await cp(join(root, "public"), publicDir, { recursive: true });
    async function worker() {
      await build({
        root,
        configFile: join(root, "vite.config.ts"),
        publicDir,
        logLevel: "silent",
        build: { outDir: join(temp, "dist"), emptyOutDir: true },
      });
      return readFile(join(temp, "dist/sw.js"), "utf8");
    }
    const first = await worker();
    const manifestPath = join(publicDir, "manifest.webmanifest");
    const original = await readFile(manifestPath, "utf8");
    const manifest = JSON.parse(original);
    manifest.description = "Public-only regression change";
    await writeFile(manifestPath, JSON.stringify(manifest));
    assert.notEqual(
      await worker(),
      first,
      "manifest-only release must update worker",
    );
    await writeFile(manifestPath, original);
    const icon = join(publicDir, "icons/icon.svg");
    await writeFile(
      icon,
      (await readFile(icon, "utf8")) + "\n<!-- public-only change -->",
    );
    assert.notEqual(
      await worker(),
      first,
      "icon-only release must update worker",
    );
    assert.ok(
      first.includes('"./recover.html"'),
      "recovery page must work offline",
    );
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
