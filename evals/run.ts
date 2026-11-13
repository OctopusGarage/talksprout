import { readFileSync } from "node:fs";
import { prompts, categories } from "../src/prompts";
import { suiteNames, validateArchive, type SuiteName } from "./validate";
const issues: string[] = [];
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
        "Contract and sealed authored archive validation; no fresh AI inference or independent semantic judgment",
      results: validated.results,
      issues,
    },
    null,
    2,
  ),
);
if (issues.length) process.exitCode = 1;
