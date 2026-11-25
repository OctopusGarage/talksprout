import { evidenceDigest } from "./validate";
import type { LiveCase } from "./live-cases";
import type { CodexArchive } from "./codex-validate";
export interface CodexStatus {
  method: "codex-cli-source-review-status";
  schemaVersion: 1;
  observations: Record<
    string,
    {
      status: "pending" | "failed" | "accepted";
      observedAt: string;
      evidenceSha256?: string;
    }
  >;
}
export const codexCaseKey = (item: LiveCase) =>
  item.id + ":" + evidenceDigest(item as unknown as Record<string, unknown>);
/** A tracked invalidation is separate from accepted raw evidence and survives scratch deletion/CI checkout. */
export function validateCodexStatus(
  value: unknown,
  archive: Partial<CodexArchive>,
  expected: LiveCase[],
) {
  const status = value as CodexStatus | null;
  const issues: string[] = [];
  if (
    !status ||
    status.method !== "codex-cli-source-review-status" ||
    status.schemaVersion !== 1 ||
    !status.observations ||
    typeof status.observations !== "object"
  )
    return ["codex: missing review invalidation/status provenance"];
  for (const item of expected) {
    const observed = status.observations[codexCaseKey(item)];
    const row = archive.cases?.find((r) => r.case.id === item.id);
    if (
      !observed ||
      observed.status !== "accepted" ||
      !Number.isFinite(Date.parse(observed.observedAt)) ||
      !row?.evidenceSha256 ||
      observed.evidenceSha256 !== row.evidenceSha256
    )
      issues.push(
        `${item.id}: latest review is pending, failed or not accepted`,
      );
  }
  return issues;
}
