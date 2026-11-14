import { mkdirSync, writeFileSync } from "node:fs";
import { createLearningLiveCases } from "./learning-live-cases";
import { createLiveCases } from "./live-cases";
mkdirSync(".superpowers/model-run", { recursive: true });
const learning = process.argv.includes("--learning");
const cases = learning ? createLearningLiveCases() : createLiveCases();
writeFileSync(
  learning ? ".superpowers/model-run/learning-cases.json" : ".superpowers/model-run/cases.json",
  JSON.stringify(cases, null, 2) + "\n",
);
console.log(`Exported ${cases.length} isolated live evaluation cases.`);
