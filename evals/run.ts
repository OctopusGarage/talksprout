import { createEnglishCases, createSessionCases } from "./session-cases";
import { createLearningLiveCases } from "./learning-live-cases";
import { learningPrompts } from "../src/content/learning";
import { validateLearningArchive } from "./learning-validate";
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
const learningLive = validateLiveArchive(
  JSON.parse(readFileSync("evals/fixtures/learning-live-api.json", "utf8")),
  createLearningLiveCases(),
);
const englishLive = validateLiveArchive(JSON.parse(readFileSync("evals/fixtures/english-live-api.json", "utf8")), createEnglishCases());
const sessionLive = validateLiveArchive(JSON.parse(readFileSync("evals/fixtures/session-live-api.json", "utf8")), createSessionCases());
const issues: string[] = [
  ...englishLive.issues,
  ...sessionLive.issues,
  ...validateLearningArchive(JSON.parse(readFileSync("evals/fixtures/learning-static.json", "utf8"))),
  ...matrix.issues,
  ...live.issues,
  ...learningLive.issues,
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
      supplementaryPrompts: { count: learningPrompts.length, method: "Static editorial review and recorded real text API execution; no audio tests", liveCases: learningLive.cases, adjudications: learningLive.adjudications },
      scenePresetCases: JSON.parse(
        readFileSync("evals/fixtures/scene-presets.json", "utf8"),
      ).cases.length,
      compositionMatrix: matrix,
      focusedTextApi: { englishCases: englishLive.cases, sessions: sessionLive.cases, sessionTargetTurns: 32, method: "Recorded real text API evidence; sessions use actual preceding replies and isolated turn-prefix same-model judges; no new requests in this command" },
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
