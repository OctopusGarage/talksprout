import { mkdirSync, writeFileSync } from "node:fs";
import { createLiveCases } from "./live-cases";
mkdirSync(".superpowers/model-run", { recursive: true });
const cases = createLiveCases();
writeFileSync(
  ".superpowers/model-run/cases.json",
  JSON.stringify(cases, null, 2) + "\n",
);
console.log(`Exported ${cases.length} isolated live evaluation cases.`);
