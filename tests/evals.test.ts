import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { allPrompts, prompts, reviewPrompts } from "../src/prompts";
import { promptText } from "../src/prompt-text";
import { evidenceDigest, suiteNames, validateArchive } from "../evals/validate";

type Case = Record<string, any>;
function seal(row: Case) {
  row.evidenceSha256 = evidenceDigest(row);
  return row;
}
function row(
  id: string,
  promptId: string,
  variant = "full",
  source = "current",
): Case {
  const prompt = allPrompts.find((p) => p.id === promptId)!;
  return seal({
    id,
    promptId,
    variant,
    source,
    promptSha256: createHash("sha256")
      .update(promptText(prompt, variant as "full", source as "current"))
      .digest("hex"),
    judgment: "pass",
    criterion: "Authored sample criterion",
    rationale: "Authored sample rationale",
    turns: [
      { role: "assistant", content: "Start" },
      { role: "user", content: "Practice" },
      { role: "assistant", content: "Response" },
    ],
  });
}
function valid() {
  const archives = Object.fromEntries(
    suiteNames.map((suite) => [suite, { scenarios: [] as Case[] }]),
  ) as Record<(typeof suiteNames)[number], { scenarios: Case[] }>;
  for (const suite of ["openings", "scenarios", "spoken"] as const)
    for (const p of prompts) {
      const r = row(
        `${suite}-${p.id}`,
        p.id,
        suite === "spoken" ? "spoken" : "full",
      );
      if (suite === "openings")
        r.turns = [{ role: "assistant", content: "Start" }];
      archives[suite].scenarios.push(seal(r));
    }
  for (const p of reviewPrompts)
    for (const variant of ["full", "spoken"])
      archives.review.scenarios.push(row(`${p.id}-${variant}`, p.id, variant));
  for (const id of ["transcript-isolation", "missing-transcript"]) {
    const r = row(id, reviewPrompts[0].id, "full", "transcript");
    r.inputConstruction = "Use the runtime template with the documented source";
    if (id === "transcript-isolation")
      r.transcript = "Learner: I live here.\nAI: Tell me more.";
    archives.review.scenarios.push(seal(r));
  }
  return archives;
}
test("valid synthetic archive and stable canonical evidence digest", () => {
  assert.deepEqual(validateArchive(valid()).issues, []);
  assert.equal(
    evidenceDigest({ b: { z: 1, a: 2 }, a: [1, 2] }),
    evidenceDigest({ a: [1, 2], b: { a: 2, z: 1 }, evidenceSha256: "ignored" }),
  );
  assert.notEqual(evidenceDigest({ a: [1, 2] }), evidenceDigest({ a: [2, 1] }));
});
const mutations: Record<string, (a: ReturnType<typeof valid>) => void> = {
  emptyTeaching: (a) => {
    a.scenarios.scenarios = [];
  },
  emptyResponseContent: (a) => {
    a.spoken.scenarios[0].turns[2].content = "";
  },
  reviewReplacesCoachOpening: (a) => {
    const r = row("replacement", reviewPrompts[0].id);
    r.turns = [{ role: "assistant", content: "Start" }];
    a.openings.scenarios[0] = r;
  },
  fullReplacesSpoken: (a) => {
    for (const r of a.spoken.scenarios) {
      r.variant = "full";
      r.promptSha256 = row("x", r.promptId).promptSha256;
    }
  },
  allPartial: (a) => {
    for (const s of suiteNames)
      for (const r of a[s].scenarios) r.judgment = "partial";
  },
  missingIsolation: (a) => {
    a.review.scenarios = a.review.scenarios.filter(
      (r) => r.id !== "transcript-isolation",
    );
  },
};
for (const [name, mutate] of Object.entries(mutations))
  test(`${name} is rejected before and after resealing`, () => {
    const a = valid();
    mutate(a);
    assert.ok(validateArchive(a).issues.length);
    for (const suite of suiteNames) a[suite].scenarios.forEach(seal);
    const issues = validateArchive(a).issues;
    assert.ok(
      issues.some((issue) => !issue.includes("evidence digest")),
      issues.join("\n"),
    );
  });
for (const field of [
  "transcript",
  "inputConstruction",
  "rationale",
  "judgment",
  "turns",
  "source",
])
  test(`evidence covers ${field}`, () => {
    const a = valid();
    const r = a.review.scenarios.find((r) => r.id === "transcript-isolation")!;
    if (field === "turns") r.turns[2].content = "Changed response";
    else r[field] = `${r[field]} changed`;
    assert.ok(
      validateArchive(a).issues.some((i) =>
        i.includes("stale evidence digest"),
      ),
    );
  });
for (const mutate of [
  (r: Case) => {
    r.variant = "garbage";
  },
  (r: Case) => {
    r.source = "garbage";
  },
  (r: Case) => {
    r.turns[1].role = "system";
  },
  (r: Case) => {
    r.turns[1].content = null;
  },
  (r: Case) => {
    r.learnerTurns = ["Wrong"];
  },
  (r: Case) => {
    r.assistantTurns = ["Wrong"];
  },
  (r: Case) => {
    r.turns.pop();
  },
])
  test("resealed malformed row is rejected", () => {
    const a = valid();
    const r = a.scenarios.scenarios[0];
    mutate(r);
    seal(r);
    assert.ok(validateArchive(a).issues.length);
  });
test("resealed transcript cases require distinct real and missing source evidence", () => {
  const a = valid();
  const isolation = a.review.scenarios.find(
    (r) => r.id === "transcript-isolation",
  )!;
  isolation.transcript =
    "[Paste the conversation here, including speaker labels]";
  seal(isolation);
  assert.ok(
    validateArchive(a).issues.some((i) =>
      i.includes("real labeled transcript"),
    ),
  );
  const missing = a.review.scenarios.find(
    (r) => r.id === "missing-transcript",
  )!;
  missing.transcript = "Learner: usable source";
  seal(missing);
  assert.ok(
    validateArchive(a).issues.some((i) => i.includes("must not supply")),
  );
});
test("duplicate IDs and duplicate prompt coverage are rejected even when sealed", () => {
  const a = valid();
  a.openings.scenarios[1] = structuredClone(a.openings.scenarios[0]);
  assert.ok(
    validateArchive(a).issues.some((i) => i.includes("duplicate case ID")),
  );
  a.openings.scenarios[1].id = "unique-id";
  seal(a.openings.scenarios[1]);
  assert.ok(
    validateArchive(a).issues.some((i) => i.includes("expected exactly one")),
  );
});
test("undefined duplicated fields and non-JSON evidence return issues without throwing", () => {
  for (const field of ["learnerTurns", "assistantTurns", "extra"]) {
    const a = valid();
    a.scenarios.scenarios[0][field] = undefined;
    assert.ok(
      validateArchive(a).issues.some((i) => i.includes("JSON values only")),
    );
  }
});
test("missing turn content and malformed duplicate arrays return issues without throwing", () => {
  const a = valid();
  const r = a.scenarios.scenarios[0];
  delete r.turns[1].content;
  r.learnerTurns = [null];
  seal(r);
  assert.ok(
    validateArchive(a).issues.some((i) =>
      i.includes("invalid turn role/content"),
    ),
  );
  assert.ok(
    validateArchive(a).issues.some((i) => i.includes("learnerTurns disagrees")),
  );
});
test("literal backslash-n does not substitute for transcript speaker lines", () => {
  const a = valid();
  const r = a.review.scenarios.find((r) => r.id === "transcript-isolation")!;
  r.transcript = "Learner: Hello.\\nAI: Hello.";
  seal(r);
  assert.ok(
    validateArchive(a).issues.some((i) =>
      i.includes("real labeled transcript"),
    ),
  );
});
