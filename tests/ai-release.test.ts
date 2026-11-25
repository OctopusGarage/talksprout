import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
test("immutable release decisions reject changed identities and tampered artifacts", () => {
  const output = execFileSync("python3", ["scripts/test_release_policy.py"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  assert.equal(output, "");
});
test("publication waits for tested Pages and MCP deployments and uses prebuilt output", () => {
  const workflow = readFileSync(".github/workflows/pages.yml", "utf8");
  assert.match(workflow, /needs: \[deploy, deploy-mcp\]/);
  assert.match(workflow, /name: mcp-build/);
  assert.match(workflow, /pnpm mcp:smoke/);
  assert.match(workflow, /pnpm release:preflight/);
  const pkg = JSON.parse(readFileSync("mcp/package.json", "utf8"));
  assert.equal(pkg.scripts.deploy, "cf deploy --prebuilt");
});
