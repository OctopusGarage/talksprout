import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("release editions retain their complete Skill content and provenance", () => {
  const directory = mkdtempSync(join(tmpdir(), "talksprout-bootstrap-"));
  const revision = "a".repeat(40);
  try {
    for (const format of ["skill", "plugin", "claude", "full"]) {
      const output = join(directory, format + ".zip");
      let script = "scripts/package-skill.py";
      const isolated = join(directory, "clean-project");
      if (format === "full") {
        mkdirSync(join(isolated, "scripts"), { recursive: true });
        cpSync("distribution", join(isolated, "distribution"), {
          recursive: true,
        });
        mkdirSync(join(isolated, "skills"), { recursive: true });
        cpSync("skills/talksprout", join(isolated, "skills/talksprout"), {
          recursive: true,
        });
        script = join(isolated, "scripts/package-skill.py");
        cpSync("scripts/package-skill.py", script);
      }
      execFileSync(
        "python3",
        [script, "--format", format, "--output", output],
        {
          env: { ...process.env, AI_SOURCE_REVISION: revision },
        },
      );
      if (format === "full")
        assert.equal(
          existsSync(join(isolated, "public/downloads")),
          false,
          "custom output must not write to the default download directory",
        );
      const result = execFileSync(
        "python3",
        [
          "-c",
          `
import sys,zipfile,pathlib
with zipfile.ZipFile(sys.argv[1]) as z:
 p='talksprout/' if sys.argv[2] in ('skill','full') else 'skills/talksprout/'
 source='distribution/full/talksprout/SKILL.md' if sys.argv[2]=='full' else 'skills/talksprout/SKILL.md'
 assert z.read(p+'SKILL.md') == pathlib.Path(source).read_bytes()
 assert sys.argv[3] in z.read(p+'references/release.md').decode()
 print('latest bootstrap retained')
`,
          output,
          format,
          revision,
        ],
        { encoding: "utf8" },
      );
      assert.match(result, /latest bootstrap retained/);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("package validation rejects release metadata from another revision or content generation", () => {
  const directory = mkdtempSync(join(tmpdir(), "talksprout-release-check-"));
  const revision = "a".repeat(40);
  try {
    for (const folder of [
      "scripts",
      "distribution",
      "skills/talksprout",
      "public/downloads",
    ])
      mkdirSync(join(directory, folder), { recursive: true });
    for (const file of [
      "scripts/package-check.py",
      "distribution/identity.json",
      "skills/talksprout/SKILL.md",
    ])
      cpSync(file, join(directory, file));
    const config = JSON.parse(readFileSync("distribution/config.json", "utf8"));
    config.packages = {
      skill: "skill.zip",
      plugin: "plugin.zip",
      claudePlugin: "claude.zip",
    };
    writeFileSync(
      join(directory, "distribution/config.json"),
      JSON.stringify(config),
    );
    for (const format of ["skill", "plugin", "claude"])
      execFileSync(
        "python3",
        [
          "scripts/package-skill.py",
          "--format",
          format,
          "--output",
          join(directory, "public/downloads", format + ".zip"),
        ],
        { env: { ...process.env, AI_SOURCE_REVISION: revision } },
      );
    const check = (source: string) =>
      spawnSync("python3", [join(directory, "scripts/package-check.py")], {
        env: { ...process.env, AI_SOURCE_REVISION: source },
        encoding: "utf8",
      });
    assert.equal(check(revision).status, 0);
    assert.notEqual(check("b".repeat(40)).status, 0);
    const identityPath = join(directory, "distribution/identity.json");
    const identity = JSON.parse(readFileSync(identityPath, "utf8"));
    writeFileSync(
      identityPath,
      JSON.stringify({ ...identity, contentVersion: "f".repeat(64) }),
    );
    assert.notEqual(check(revision).status, 0);
    writeFileSync(
      identityPath,
      JSON.stringify({ ...identity, guidanceVersion: "f".repeat(64) }),
    );
    assert.notEqual(check(revision).status, 0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
