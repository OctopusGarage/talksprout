import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateGuidedSelectionArchive,
  validateGuidedTarget,
  completeGuidedWebDocument,
} from "../evals/guided-selection";
test("thin-bootstrap actual guided histories and two isolated same-model judges retain explicit source-inspection limits", () => {
  const checked = validateGuidedSelectionArchive();
  assert.deepEqual(checked.issues, []);
  assert.equal(checked.outcomes.length, 2);
  assert.ok(
    checked.outcomes.every((r) => r.targetTurns === 11 && r.verdict === "pass"),
  );
  assert.ok(
    checked.outcomes.find((r) => r.route === "mcp").sourceInspectionNotes
      .length > 0,
  );
});
test("guided target validation rejects changed request, unknown native wrapper and altered current bootstrap", () => {
  const original = JSON.parse(
    readFileSync("evals/results/guided-selection-0.1.3/skill-web.json", "utf8"),
  );
  for (const mutate of [
    (r: any) => (r.turns[0].request += "changed"),
    (r: any) => (r.skillManifest += "changed"),
    (r: any) =>
      r.turns[0].nativeTrace.push({
        type: "custom_tool_call",
        name: "exec",
        status: "completed",
        call_id: "foreign",
        input: "text(await tools.other_service({}));",
      }),
  ]) {
    const changed = structuredClone(original);
    mutate(changed);
    assert.ok(validateGuidedTarget(changed, "skill-web").issues.length);
  }
});
test("individual forwarded viewer source body cannot be borrowed from metadata or another document", () => {
  const url =
    "https://raw.githubusercontent.com/OctopusGarage/talksprout/main/content/zh/start.md";
  const viewer = (u: string, body: string) =>
    ` (${u})\nViewer; Source: open(${JSON.stringify({ ref_id: u })}); Total lines: 1\nL0: ${body}`;
  const execution = (metadata: string, web: string) => ({
    nativeTrace: [
      {
        type: "custom_tool_call",
        name: "exec",
        status: "completed",
        call_id: "source",
        input: `text(ALL_TOOLS.filter(x=>/talksprout/.test(x.name)));text(await tools.web__run({open:[{ref_id:${JSON.stringify(url)}}]}));`,
      },
      {
        type: "custom_tool_call_output",
        call_id: "source",
        output: [
          {
            type: "input_text",
            text: "Script completed\nWall time 1 seconds\nOutput:\n",
          },
          { type: "input_text", text: metadata },
          { type: "input_text", text: web },
        ],
      },
    ],
  });
  assert.equal(
    completeGuidedWebDocument(
      [
        execution(
          viewer(url, "Complete instructions"),
          viewer(url, "truncated"),
        ),
      ],
      "zh/start.md",
      "Complete instructions",
    ),
    false,
  );
  assert.equal(
    completeGuidedWebDocument(
      [execution("[]", viewer(url, "Complete instructions"))],
      "zh/start.md",
      "Complete instructions",
    ),
    true,
  );
});

import { hasCompleteRetrievedTemplate } from "../evals/behavior-validate";
test("legacy complete-source checking accepts separate genuine viewers and rejects cross-document content", () => {
  const first =
      "https://raw.githubusercontent.com/OctopusGarage/talksprout/main/content/en/prompts/first.md",
    second = first.replace("first.md", "second.md");
  const viewer = (url: string, body: string) =>
    ` (${url})\nViewer; Source: open(${JSON.stringify({ ref_id: url })}); Total lines: 1\nL0: ${body}`;
  const execution = (one: string, two: string) =>
    ({
      events: [],
      nativeTrace: [
        {
          type: "custom_tool_call",
          name: "exec",
          status: "completed",
          call_id: "source",
          input: `text(await tools.web__run({open:[{ref_id:${JSON.stringify(first)}},{ref_id:${JSON.stringify(second)}}]}));`,
        },
        {
          type: "custom_tool_call_output",
          call_id: "source",
          output: [
            {
              type: "input_text",
              text:
                viewer(first, one) +
                "\n\n" +
                "-".repeat(80) +
                "\n\n" +
                viewer(second, two),
            },
          ],
        },
      ],
    }) as any;
  assert.equal(
    hasCompleteRetrievedTemplate(
      [execution("complete first", "complete second")],
      "complete first",
    ),
    true,
  );
  assert.equal(
    hasCompleteRetrievedTemplate(
      [execution("first half", "second half")],
      "first half second half",
    ),
    false,
  );
});

test("historical guided MCP rejects complete wire data when the wrapper discards it", () => {
  const run = JSON.parse(
    readFileSync("evals/results/guided-selection-0.1.3/mcp.json", "utf8"),
  );
  assert.deepEqual(validateGuidedTarget(run, "mcp").issues, []);
  for (const turn of run.turns)
    for (const record of turn.nativeTrace)
      if (
        record.type === "custom_tool_call" &&
        record.input.includes("tools.mcp__talksprout__read_document")
      )
        record.input =
          'const discarded = await tools.mcp__talksprout__read_document({path:"zh/start.md"});';
  assert.ok(
    validateGuidedTarget(run, "mcp").issues.some((s) =>
      s.includes("source not observed"),
    ),
  );
});
