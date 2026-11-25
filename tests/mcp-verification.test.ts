import test from "node:test";
import assert from "node:assert/strict";
import { assertCompleteDocument } from "../scripts/mcp-verification";
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
