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
  assert.ok(metadata.documentCount > 900);
  assert.match(getGuide(), /en\/start.md/);
  assert.match(readDocument("en/prompts/roleplay-coach.md"), /Full prompt/);
  for (const path of [
    "__proto__",
    "../distribution/config.json",
    "https://example.com",
    "en/../en/index.md",
  ])
    assert.throws(() => readDocument(path));
  assert.ok(searchDocuments("interview").length > 0);
  assert.ok(searchDocuments("coach").length <= 20);
  assert.deepEqual(searchDocuments("   "), []);
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

test("task names outrank incidental body mentions before search truncation", () => {
  assert.equal(
    searchDocuments("vocabulary")[0]?.path,
    "en/prompts/vocabulary-ipa-review.md",
  );
  for (const query of ["writing", "listening"])
    assert.ok(
      searchDocuments(query)[0]?.path.startsWith(`en/prompts/${query}-`),
    );
  for (const id of [
    "writing-messages",
    "writing-email",
    "listening-dictation",
    "listening-expressions",
  ])
    assert.ok(
      searchDocuments(id.split("-")[0]).some(
        (result) => result.path === `en/prompts/${id}.md`,
      ),
    );
  assert.equal(
    searchDocuments("complete study notes")[0]?.path,
    "en/prompts/complete-study-notes.md",
  );
  const results = searchDocuments("project deep dive mock");
  assert.equal(
    results[0]?.path,
    "en/scenarios/roleplay-coach/project-deep-dive-mock.md",
  );
  assert.ok(results.every((result) => result.path.startsWith("en/")));
});

test("bootstrap routes to shared current remote entry rather than embedding learning rules", () => {
  assert.match(getGuide(), /en\/start.md/);
  assert.doesNotMatch(
    getGuide(),
    /Intent and context|A requested structured review artifact/,
  );
  assert.match(readDocument("en/start.md"), /## Intent and context/);
  assert.equal(readDocument("zh/start.md"), readDocument("en/start.md"));
});
