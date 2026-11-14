import { createFrozenCases } from './frozen-cases';
import { validateLiveArchive } from './live-validate';
import { evidenceDigest } from './validate';

export const verificationProvenance = {
  method: 'agent-authored-scripts-not-blind-validation',
  untunedRetainedIds: ['frozen-verification-roleplay-coach', 'frozen-verification-review-cards', 'frozen-verification-listening-shadowing'],
  tunedRegressionIds: ['frozen-verification-listening-check', 'frozen-verification-listening-check-fresh-detail', 'frozen-verification-listening-check-fresh-help'],
  freshAfterRemediationIds: ['frozen-verification-listening-check-fresh-station'],
  freshInputProvenance: 'reviewer-authored after prior failure review; not blind independent validation',
  originalFindings: 'evals/results/2026-11-14-frozen-verification-static-finding.json',
};
export function validateFrozenArchive(value: unknown) {
  const result = validateLiveArchive(value, createFrozenCases());
  const provenance = value && typeof value === 'object' ? (value as Record<string, unknown>).verificationProvenance : undefined;
  if (evidenceDigest({provenance}) !== evidenceDigest({provenance:verificationProvenance})) result.issues.push('frozen: missing or incorrect tuned/untuned provenance');
  return result;
}

// Integrity of retained findings is separate from current release acceptance.
export function validateOriginalFinding(archive: unknown, finding: unknown): string[] {
  if (!archive || typeof archive !== 'object' || !finding || typeof finding !== 'object') return ['frozen: missing original finding'];
  const original = archive as {cases?: Array<Record<string, unknown>>};
  const review = finding as Record<string, unknown>;
  const row = original.cases?.find(r => (r.case as {id?:string})?.id === review.caseId);
  if (!row) return ['frozen: original case missing'];
  const turns = row.turnResults as Array<{target:{content:string}}>;
  const judges = row.turnJudgments as Array<{judge:unknown}>;
  if (review.method !== 'static-semantic-review-not-model-execution' || review.judgment !== 'fail' || review.rawEvidenceSha256 !== row.evidenceSha256 || row.evidenceSha256 !== evidenceDigest(row) || review.turnIndex !== 2 || review.observedReply !== turns?.[2]?.target.content || evidenceDigest({judge:review.rawJudge}) !== evidenceDigest({judge:judges?.[2]?.judge})) return ['frozen: static failure is not bound to original raw evidence'];
  return [];
}

export function validateHelpFinding(archive: unknown, finding: unknown): string[] {
  if (!archive || typeof archive !== 'object' || !finding || typeof finding !== 'object') return ['listening-help: missing original finding'];
  const original = archive as {cases?: Array<Record<string, unknown>>};
  const review = finding as Record<string, unknown>;
  const row = original.cases?.find(r => (r.case as {id?:string})?.id === review.caseId);
  if (!row) return ['listening-help: original case missing'];
  if (review.method !== 'static-semantic-review-not-model-execution' || review.judgment !== 'fail' || review.rawEvidenceSha256 !== row.evidenceSha256 || row.evidenceSha256 !== evidenceDigest(row) || review.observedReply !== (row.target as {content?:string})?.content || evidenceDigest({judge:review.rawJudge}) !== evidenceDigest({judge:row.judge})) return ['listening-help: static failure is not bound to original raw evidence'];
  return [];
}

export function validateSessionReviews(archive: unknown, reviews: unknown): string[] {
  if (!archive || typeof archive !== 'object' || !Array.isArray(reviews)) return ['session-review: missing evidence'];
  const original = archive as {cases?: Array<Record<string, unknown>>};
  const issues: string[] = [];
  for (const item of reviews) {
    if (!item || typeof item !== 'object') {issues.push('session-review: malformed review'); continue;}
    const review = item as Record<string, unknown>;
    const row = original.cases?.find(r => (r.case as {id?:string})?.id === review.caseId);
    const index = review.turnIndex;
    const turns = row?.turnResults as Array<{target:{content:string}}> | undefined;
    const judgments = row?.turnJudgments as Array<{judge:unknown}> | undefined;
    if (!row || !Number.isInteger(index) || typeof index !== 'number' || index < 0 || review.method !== 'static-semantic-review-not-model-execution' || !['pass','fail'].includes(String(review.judgment)) || typeof review.reason !== 'string' || review.reason.length < 50 || review.rawEvidenceSha256 !== row.evidenceSha256 || row.evidenceSha256 !== evidenceDigest(row) || review.observedReply !== turns?.[index]?.target.content || evidenceDigest({judge:review.rawJudge}) !== evidenceDigest({judge:judgments?.[index]?.judge})) issues.push('session-review: review is not bound to original reply and raw judge');
  }
  return issues;
}
