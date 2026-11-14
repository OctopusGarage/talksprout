import { test } from "node:test";
import assert from "node:assert/strict";
import { createClipboardWriter } from "../src/clipboard-writer";

test("one writer serializes both libraries and starts the API synchronously", async () => {
  let finish!: () => void;
  const writes: string[] = [];
  const writer = createClipboardWriter((text) => { writes.push(text); return new Promise<void>((resolve) => { finish = resolve; }); }, () => "same");
  const first = writer.write({ text: "first" });
  assert.deepEqual(writes, ["first"]);
  assert.equal(await writer.write({ text: "second" }), false);
  finish();
  assert.equal(await first, true);
});
test("delivered data is recorded but stale feedback is suppressed after navigation or invalidation", async () => {
  let finish!: () => void;
  let context = "sheet-a";
  let delivered = 0;
  let feedback = 0;
  const writer = createClipboardWriter(() => new Promise<void>((resolve) => { finish = resolve; }), () => context);
  const pending = writer.write({ text: "payload", onDelivered: () => { delivered++; }, onSuccess: () => { feedback++; } });
  context = "sheet-b";
  finish();
  await pending;
  assert.equal(delivered, 1);
  assert.equal(feedback, 0);
  const next = writer.write({ text: "payload", onSuccess: () => { feedback++; } });
  writer.invalidate();
  finish();
  await next;
  assert.equal(feedback, 0);
});
