import { mkdir, writeFile } from "node:fs/promises";
import {
  createBehaviorPilotCases,
  createBehaviorExpansionCases,
  createBehaviorControlCases,
  canonicalBehaviorPrompt,
  behaviorDigest,
} from "./behavior-cases";
import { allPrompts } from "../src/prompts";
import { promptText } from "../src/prompt-text";
const selected = process.argv.includes("--all")
  ? [...createBehaviorPilotCases(), ...createBehaviorExpansionCases()]
  : process.argv.includes("--control")
    ? createBehaviorControlCases()
    : process.argv.includes("--expansion")
      ? createBehaviorExpansionCases()
      : createBehaviorPilotCases();
const cases = selected.map((item) => ({
  ...item,
  turns: item.turns.map((turn) => {
    const phase = turn.phase;
    const canonical = phase ? canonicalBehaviorPrompt(phase) : undefined;
    const original = phase
      ? allPrompts.find((p) => p.id === phase.promptId)
      : undefined;
    const sourceTemplate =
      phase?.source === "transcript" && original
        ? promptText(
            original,
            phase.variant ?? "full",
            "transcript",
            phase.locale ?? "en",
          )
        : canonical;
    return {
      ...turn,
      manualInput: canonical ?? turn.learner!,
      directInput: turn.intent ?? turn.learner!,
      canonicalPrompt: canonical,
      canonicalSha256: canonical ? behaviorDigest(canonical) : undefined,
      sourceTemplate,
    };
  }),
}));
await mkdir(".superpowers/model-run", { recursive: true });
await writeFile(
  process.argv.includes("--all")
    ? ".superpowers/model-run/behavior-all-cases.json"
    : process.argv.includes("--control")
      ? ".superpowers/model-run/behavior-control-cases.json"
      : process.argv.includes("--expansion")
        ? ".superpowers/model-run/behavior-expansion-cases.json"
        : ".superpowers/model-run/behavior-pilot-cases.json",
  JSON.stringify(
    {
      schemaVersion: 1,
      kind: "authored learner scripts with real native Codex assistant histories",
      cases,
    },
    null,
    2,
  ) + "\n",
);
console.log(`Exported ${cases.length} actual-history behavior pilot cases`);
