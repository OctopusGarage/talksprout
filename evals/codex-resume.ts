import { evidenceDigest } from "./validate";
import type { LiveCase } from "./live-cases";
import type { CodexRow } from "./codex-validate";
/** Histories are append-preserved; the latest exact-input observation wins, even if pending or failed. */
export function latestCodexObservation(
  rows: CodexRow[],
  item: LiveCase,
): CodexRow | undefined {
  const digest = evidenceDigest(item as unknown as Record<string, unknown>);
  return rows
    .filter(
      (row) =>
        row.case?.id === item.id &&
        evidenceDigest(row.case as unknown as Record<string, unknown>) ===
          digest,
    )
    .sort((a, b) => observationTime(b) - observationTime(a))[0];
}
function observationTime(row: CodexRow): number {
  return (
    Date.parse(
      row.observedAt ?? row.judge?.completedAt ?? row.target?.completedAt ?? "",
    ) || 0
  );
}
/** Preserve all other cases when a worker starts or finishes a replacement. */
export function recordCodexObservation(
  rows: CodexRow[],
  row: CodexRow,
): CodexRow[] {
  return [...rows.filter((old) => old.case.id !== row.case.id), row];
}
