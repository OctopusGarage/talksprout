import test from "node:test";
import assert from "node:assert/strict";
import {
  assertCompleteDocument,
  waitForDeploymentIdentity,
} from "../scripts/mcp-verification";
test("deployment verification waits for the complete expected identity", async () => {
  let reads = 0;
  const waits: number[] = [];
  const expected = {
    version: "new",
    fingerprint: "content",
    sourceRevision: "source",
  };
  await waitForDeploymentIdentity(
    async () => (++reads < 3 ? { ...expected, version: "old" } : expected),
    expected,
    async (ms) => {
      waits.push(ms);
    },
  );
  assert.equal(reads, 3);
  assert.deepEqual(waits, [2000, 4000]);
});
test("permanent identity differences never pass and waiting is bounded", async () => {
  for (const key of ["version", "fingerprint", "sourceRevision"]) {
    let reads = 0;
    const waits: number[] = [];
    const expected = {
      version: "new",
      fingerprint: "content",
      sourceRevision: "source",
    };
    await assert.rejects(
      waitForDeploymentIdentity(
        async () => {
          reads++;
          return { ...expected, [key]: "wrong" };
        },
        expected,
        async (ms) => {
          waits.push(ms);
        },
      ),
      /not ready after five checks/,
    );
    assert.equal(reads, 5);
    assert.deepEqual(waits, [2000, 4000, 8000, 16000]);
  }
});
test("health API errors remain failures rather than propagation delay", async () => {
  let reads = 0,
    waits = 0;
  await assert.rejects(
    waitForDeploymentIdentity(
      async () => {
        reads++;
        throw Error("Health failed: 403");
      },
      { version: "new" },
      async () => {
        waits++;
      },
    ),
    /403/,
  );
  assert.equal(reads, 1);
  assert.equal(waits, 0);
});
test("remote verification requires the exact complete document, not its heading", () => {
  const expected = "# Coach\n\n## Full prompt\nComplete instructions.\n";
  assert.doesNotThrow(() =>
    assertCompleteDocument(
      { content: [{ type: "text", text: expected }] },
      expected,
    ),
  );
  for (const text of [
    "## Full prompt",
    expected.slice(0, -2),
    expected + "extra",
    "wrong locale",
  ])
    assert.throws(() =>
      assertCompleteDocument({ content: [{ type: "text", text }] }, expected),
    );
  for (const response of [
    null,
    {},
    { content: [] },
    { content: [{ type: "image", text: expected }] },
  ])
    assert.throws(() => assertCompleteDocument(response, expected));
});
