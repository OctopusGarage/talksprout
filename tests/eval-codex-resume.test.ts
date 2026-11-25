import test from "node:test";
import assert from "node:assert/strict";
import {
  latestCodexObservation,
  recordCodexObservation,
} from "../evals/codex-resume";
import type { CodexRow } from "../evals/codex-validate";
import type { LiveCase } from "../evals/live-cases";
const item = (id: string): LiveCase => ({
  id,
  promptId: id,
  variant: "full",
  source: "current",
  purpose: "codex-source-review",
  criterion: "source",
  payloadSha256: "test",
  messages: [],
  maxTokens: 1,
});
test("concurrent saves and interrupted reruns cannot resurrect an older accepted pass", () => {
  const x = item("x"),
    y = item("y");
  const older = {
    case: x,
    observedAt: "2026-11-25T01:00:00Z",
    observationStatus: "complete",
  } as CodexRow;
  const failed = {
    case: x,
    observedAt: "2026-11-25T02:00:00Z",
    observationStatus: "failed",
  } as CodexRow;
  let rows = [failed];
  const pending = {
    case: x,
    observedAt: "2026-11-25T03:00:00Z",
    observationStatus: "pending",
  } as CodexRow;
  rows = recordCodexObservation(rows, pending);
  rows = recordCodexObservation(rows, {
    case: y,
    observedAt: "2026-11-25T03:01:00Z",
    observationStatus: "complete",
  } as CodexRow);
  // Simulate serialized save and process termination before x completes.
  const saved = JSON.parse(JSON.stringify(rows)) as CodexRow[];
  assert.equal(
    latestCodexObservation([...saved, older, failed], x)?.observationStatus,
    "pending",
  );
  // Even a subsequent partial current file cannot hide the preserved newer history.
  assert.equal(
    latestCodexObservation(
      [older, ...saved.filter((r) => r.case.id === "y"), pending],
      x,
    )?.observationStatus,
    "pending",
  );
  assert.equal(
    latestCodexObservation([older, failed], x)?.observationStatus,
    "failed",
  );
  const changed = { ...x, criterion: "changed source" };
  assert.equal(latestCodexObservation([older, pending], changed), undefined);
});

import {
  codexCaseKey,
  validateCodexStatus,
  type CodexStatus,
} from "../evals/codex-status";
import type { CodexArchive } from "../evals/codex-validate";
test("release rejects newer pending/failed exact-source observations while retaining accepted raw evidence", () => {
  const x = item("x");
  const archive = {
    cases: [{ case: x, evidenceSha256: "accepted-seal" }],
  } as Partial<CodexArchive>;
  const status: CodexStatus = {
    method: "codex-cli-source-review-status",
    schemaVersion: 1,
    observations: {
      [codexCaseKey(x)]: {
        status: "accepted",
        observedAt: "2026-11-25T01:00:00Z",
        evidenceSha256: "accepted-seal",
      },
    },
  };
  assert.deepEqual(validateCodexStatus(status, archive, [x]), []);
  for (const phase of ["pending", "failed"] as const) {
    status.observations[codexCaseKey(x)] = {
      status: phase,
      observedAt: "2026-11-25T02:00:00Z",
    };
    assert.ok(validateCodexStatus(status, archive, [x]).length);
    assert.equal(archive.cases?.[0].evidenceSha256, "accepted-seal");
  }
});

import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { acquireCodexLock } from "../evals/codex-lock";
test("exclusive invocation lock prevents interleaved runs from losing a newer invalidation", () => {
  const directory = mkdtempSync(join(tmpdir(), "codex-eval-lock-test-"));
  try {
    const lock = join(directory, "review.lock"),
      status = join(directory, "status.json");
    const first = acquireCodexLock(lock);
    writeFileSync(status, "accepted");
    assert.throws(() => acquireCodexLock(lock), /Another Codex evaluation/);
    assert.equal(readFileSync(status, "utf8"), "accepted");
    first();
    const second = acquireCodexLock(lock);
    writeFileSync(status, "pending");
    assert.throws(() => acquireCodexLock(lock), /Another Codex evaluation/);
    // Calling an old release callback cannot remove the newer owner's lock.
    first();
    assert.throws(() => acquireCodexLock(lock), /Another Codex evaluation/);
    assert.equal(readFileSync(status, "utf8"), "pending");
    second();
    const third = acquireCodexLock(lock);
    third();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
