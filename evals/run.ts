import { readFileSync } from "node:fs";
import { prompts, categories } from "../src/prompts";
import { suiteNames, validateArchive, type SuiteName } from "./validate";
import { validateSceneArchive } from "./scene-validate";
import {
  validateLiveArchive,
  validateCompositionMatrix,
} from "./live-validate";
const matrix = validateCompositionMatrix();
const live = validateLiveArchive(
  JSON.parse(readFileSync("evals/fixtures/live-api.json", "utf8")),
);
const issues: string[] = [
  ...matrix.issues,
  ...live.issues,
  ...validateSceneArchive(
    JSON.parse(readFileSync("evals/fixtures/scene-presets.json", "utf8")),
  ),
];
for (const p of prompts) {
  if (
    !categories.includes(p.category) ||
    !/^\d+–\d+$/.test(p.minutes) ||
    !/^[AB][12]–[AB][12]$/.test(p.level)
  )
    issues.push(p.id + ": invalid metadata");
  if (
    p.prompt.length < 250 ||
    !/Start /.test(p.prompt) ||
    !/counts are maximums/.test(p.prompt) ||
    !/not when they appear inside/.test(p.prompt) ||
    !/no new question/.test(p.prompt)
  )
    issues.push(p.id + ": incomplete interaction contract");
}

const archives = Object.fromEntries(
  suiteNames.map((name) => [
    name,
    JSON.parse(readFileSync(`evals/fixtures/${name}.json`, "utf8")),
  ]),
) as Record<SuiteName, unknown>;
const validated = validateArchive(archives);
issues.push(...validated.issues);
console.log(
  JSON.stringify(
    {
      method:
        "Static contracts, sealed authored archives, and recorded live API evidence; this invocation makes no new API calls",
      results: validated.results,
      scenePresetCases: JSON.parse(
        readFileSync("evals/fixtures/scene-presets.json", "utf8"),
      ).cases.length,
      compositionMatrix: matrix,
      liveApi: {
        cases: live.cases,
        adjudications: live.adjudications,
        recordedScenes: live.recordedScenes,
        pendingScenes: live.pendingScenes,
        pendingSceneIds: live.pendingSceneIds,
        pendingStatus: live.pendingScenes
          ? "Pending scenes have no recorded API executions; this invocation makes no new API calls"
          : "All current scenes have recorded API executions; this invocation makes no new API calls",
      },
      issues,
    },
    null,
    2,
  ),
);
if (issues.length) process.exitCode = 1;
