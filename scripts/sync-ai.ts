import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
import { buildDocuments } from "./ai-content";
const config = JSON.parse(await readFile("distribution/config.json", "utf8"));
const guidance = JSON.parse(
  await readFile("distribution/guidance.json", "utf8"),
);
const files = buildDocuments();
const hash = (s: string | Buffer) =>
  createHash("sha256").update(s).digest("hex");
const releaseInputs = [
  "distribution/config.json",
  "distribution/guidance.json",
  "scripts/sync-ai.ts",
  "scripts/ai-content.ts",
  "scripts/package-skill.py",
  "scripts/package-check.py",
  "mcp/src/server.ts",
  "mcp/src/index.ts",
  "mcp/cloudflare.config.ts",
  "mcp/pnpm-lock.yaml",
  "src/AISetup.tsx",
  "scripts/release_policy.py",
  "scripts/publish-ai.py",
  "scripts/verify-mcp.ts",
  "scripts/mcp-verification.ts",
  ".github/workflows/pages.yml",
];
const releaseInputsVersion = hash(
  JSON.stringify(
    await Promise.all(
      releaseInputs.map(async (path) => [path, await readFile(path, "utf8")]),
    ),
  ),
);
const identity = {
  releaseInputsVersion,
  name: config.name,
  version: config.version,
  contentVersion: hash(JSON.stringify(files)),
  guidanceVersion: hash(JSON.stringify(guidance)),
  iconSha256: hash(await readFile(config.icon)),
};
const fingerprint = hash(JSON.stringify(identity));
const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";
const skill = `---
name: talksprout
description: Practice English with TalkSprout conversation coaches, role-play and interview scenarios, conversation reviews, and source-grounded listening, reading and writing tasks. Use when the learner requests TalkSprout or these English practice workflows.
---
# TalkSprout

## Retrieve only the selected task
If TalkSprout MCP tools are already connected, call get_guide and keep its returned content identity and sourceRevision for this task, then use read_document with an exact returned path. Installing a release-pinned Skill does not pin the connected MCP deployment: choosing MCP explicitly chooses the server's identity. Do not silently combine that route with release-pinned web documents. If the learner explicitly requires the package revision, compare the server sourceRevision with references/release.md and use the pinned web route when they differ; explain if neither matching route is accessible. Otherwise read ${config.contentBase}en/index.md or ${config.contentBase}zh/index.md with the host's public URL reader. Choose the index for the learner's language. Follow its relative links using the same content base and revision. Read only the selected prompt, scenario or guide, and retain that document throughout the task. Do not retrieve the whole library.

If raw GitHub cannot be read, try the same path and revision once through https://github.com/OctopusGarage/talksprout/blob/main/content/. If neither route works, explain the limitation and ask for pasted material. Do not install runtimes or run shell commands to read learning content. Installing this skill does not connect MCP automatically.

## Choose the workflow
Offer actual index choices when the request is broad. For conversations select a coach and optional compatible scenario; mock interview documents explicitly defer feedback. Reviews use the current accessible chat or the speaker-labeled transcript template. Listening, reading and writing documents specify required source material. Guides explain methods and provide reusable configurations. Follow explicit help, review and stop requests.

## Learning boundaries
${guidance.instructions}
`;
const manifest = {
  name: config.name,
  version: config.version,
  description: config.description,
  author: { name: config.publisher, url: "https://github.com/OctopusGarage" },
  homepage: config.repository,
  repository: config.repository,
  license: "MIT",
  keywords: ["english", "learning", "coaching", "talksprout"],
};
const outputs: Record<string, string | Buffer> = {
  ...Object.fromEntries(
    Object.entries(files).map(([path, body]) => ["content/" + path, body]),
  ),
  "distribution/identity.json": json({ ...identity, fingerprint }),
  "mcp/package.json": json({
    ...JSON.parse(await readFile("mcp/package.json", "utf8")),
    version: config.version,
  }),
  "mcp/generated/library.json": json({
    endpoint: config.mcpEndpoint,
    ...identity,
    fingerprint,
    sourceRevision:
      process.env.AI_SOURCE_REVISION || process.env.GITHUB_SHA || "local",
    iconBase64: (await readFile(config.icon)).toString("base64"),
    guidance: guidance.instructions,
    files,
  }),
  "skills/talksprout/SKILL.md": skill,
  "skills/talksprout/LICENSE": await readFile("LICENSE"),
  "skills/talksprout/assets/icon.png": await readFile(config.icon),
  "skills/talksprout/agents/openai.yaml": `interface:\n  display_name: "TalkSprout"\n  short_description: "English practice and review"\n  default_prompt: "Use $talksprout to help me practice English."\n  icon_small: "./assets/icon.png"\n  icon_large: "./assets/icon.png"\n`,
  "distribution/plugins/talksprout/claude-plugin.json": json(manifest),
  "distribution/plugins/talksprout/plugin.json": json({
    $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    ...manifest,
    extensions: {
      "com.openai": {
        interface: {
          displayName: config.displayName,
          shortDescription: "English practice and review",
          longDescription: config.description,
          developerName: config.publisher,
          category: "Productivity",
          capabilities: ["Read"],
          websiteURL: config.repository,
          defaultPrompt: [
            "Use TalkSprout to practice a workplace conversation.",
          ],
          composerIcon: "./assets/icon.png",
          logo: "./assets/icon.png",
        },
      },
    },
  }),
  "distribution/plugins/talksprout/README.md":
    "# TalkSprout plugin\n\nInstall through a supported host plugin flow and enable the TalkSprout skill. Requires public URL reading or an already connected TalkSprout MCP. This package does not connect MCP or access private app data. Host availability depends on account and workspace controls.\n",
};
let stale = false;
for (const [path, data] of Object.entries(outputs)) {
  if (process.argv.includes("--check")) {
    const current = await readFile(path).catch(() => Buffer.alloc(0));
    if (!current.equals(Buffer.from(data))) {
      console.error("Stale: " + path);
      stale = true;
    }
  } else {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);
  }
}
async function checkExtras(dir: string) {
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(
    () => [],
  )) {
    const path = dir + "/" + entry.name;
    if (entry.isDirectory()) await checkExtras(path);
    else if (!(path in outputs)) {
      console.error("Unexpected generated file: " + path);
      stale = true;
    }
  }
}
await checkExtras("content");
if (stale) process.exitCode = 1;
console.log(`${Object.keys(files).length} documents; identity ${fingerprint}`);
