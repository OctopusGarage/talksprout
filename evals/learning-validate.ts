import { createHash } from "node:crypto";
import { learningPrompts } from "../src/content/learning";

export interface LearningReviewArchive {
  method: "static-editorial-review";
  cases: { id: string; promptSha256: string; rationale: string }[];
}
export function validateLearningArchive(archive: LearningReviewArchive): string[] {
  const issues: string[] = [];
  if (archive.method !== "static-editorial-review") issues.push("Learning archive must identify static editorial review");
  if (archive.cases.length !== learningPrompts.length || new Set(archive.cases.map((c) => c.id)).size !== learningPrompts.length)
    issues.push("Learning archive must cover each supplementary prompt exactly once");
  for (const p of learningPrompts) {
    const record = archive.cases.find((c) => c.id === p.id);
    if (!record || record.promptSha256 !== createHash("sha256").update(p.prompt).digest("hex") || !record.rationale.trim())
      issues.push(`${p.id}: missing or stale static editorial review`);
  }
  return issues;
}
