import test from "node:test";
import assert from "node:assert/strict";
import { shouldBlockZoom } from "../src/pwa-zoom";
test("only installed apps block multi-touch, browser gesture and trackpad zoom", () => {
  for (const installed of [false, true]) {
    assert.equal(
      shouldBlockZoom(installed, { type: "touchmove", touches: 2 }),
      installed,
    );
    assert.equal(
      shouldBlockZoom(installed, { type: "gesturestart" }),
      installed,
    );
    assert.equal(
      shouldBlockZoom(installed, { type: "wheel", ctrlKey: true }),
      installed,
    );
    assert.equal(
      shouldBlockZoom(installed, { type: "touchmove", touches: 1 }),
      false,
    );
    assert.equal(
      shouldBlockZoom(installed, { type: "wheel", ctrlKey: false }),
      false,
    );
  }
});

test("installed app blocks zoom shortcuts but preserves typing and other shortcuts", () => {
  for (const installed of [false, true]) {
    for (const key of ["+", "=", "-", "0"])
      for (const modifier of ["ctrlKey", "metaKey"]) {
        const input = { type: "keydown", key, [modifier]: true };
        assert.equal(shouldBlockZoom(installed, input), installed);
      }
    for (const input of [
      { type: "keydown", key: "-", ctrlKey: false },
      { type: "keydown", key: "c", ctrlKey: true },
      { type: "keydown", key: "+", ctrlKey: true, altKey: true },
    ])
      assert.equal(shouldBlockZoom(installed, input), false);
  }
});
