import type { LiveCase } from "./live-cases";
import { validateLiveArchive } from "./live-validate";

/** Validate recorded, explicitly non-accepted observations without changing their verdicts. */
export function validateGuideObservations(archive: unknown, cases: LiveCase[]) {
  const checked = validateLiveArchive(archive, cases);
  const knownOutcomeFailures = new Set([
    ...cases.map(item => `${item.id}: unresolved live finding`),
    "live: inconsistent release summary",
  ]);
  const issues = checked.issues.filter(issue => !knownOutcomeFailures.has(issue));
  const data = archive as { cases?: { gateJudgment?: string }[]; summary?: Record<string, number> };
  const summary = { pass: 0, fail: 0, uncertain: 0 };
  if (Array.isArray(data?.cases)) {
    for (const row of data.cases) {
      if (row.gateJudgment === "pass" || row.gateJudgment === "fail" || row.gateJudgment === "uncertain") summary[row.gateJudgment]++;
      else issues.push("guide observations: invalid recorded outcome");
    }
  }
  if (Object.entries(summary).some(([key, count]) => data?.summary?.[key] !== count)) issues.push("guide observations: inconsistent recorded summary");
  return { issues, summary, accepted: false, note: "Recorded observed outcomes only. Failures remain failures; this is not release acceptance or adjudication." };
}
