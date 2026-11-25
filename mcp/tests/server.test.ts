import test from "node:test";
import assert from "node:assert/strict";
import {
  getGuide,
  readDocument,
  searchDocuments,
  metadata,
} from "../src/server";
import worker from "../src/index";
test("complete documents, bounded search and exact-path isolation", () => {
  assert.ok(metadata.documentCount > 1900);
  assert.match(getGuide("zh"), /zh\/index.md/);
  assert.match(readDocument("en/prompts/roleplay-coach.md"), /Full prompt/);
  for (const path of [
    "__proto__",
    "../distribution/config.json",
    "https://example.com",
    "en/../en/index.md",
  ])
    assert.throws(() => readDocument(path));
  assert.ok(searchDocuments("interview", "en").length > 0);
  assert.ok(searchDocuments("coach", "en").length <= 20);
  assert.deepEqual(searchDocuments("   ", "en"), []);
});
test("worker health identity, unknown routes and streamed size limits", async () => {
  const health = await worker.fetch(new Request("http://localhost/health"));
  assert.deepEqual(await health.json(), metadata);
  assert.equal(
    (await worker.fetch(new Request("http://localhost/nope"))).status,
    404,
  );
  assert.equal(
    (
      await worker.fetch(
        new Request("http://localhost/mcp", {
          method: "POST",
          body: "x".repeat(17000),
        }),
      )
    ).status,
    413,
  );
});
