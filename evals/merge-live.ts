import { createEnglishCases } from './session-cases';
import { createFrozenCases } from './frozen-cases';
import { verificationProvenance, validateFrozenArchive } from './frozen-validate';
// Explicit acceptance step: validates the complete combined archive before writing.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createLiveCases } from './live-cases';
import { createLearningLiveCases } from './learning-live-cases';
import { validateLiveArchive } from './live-validate';
const [baselinePath, refreshPath, outputPath, suite] = process.argv.slice(2);
if (!baselinePath || !refreshPath || !outputPath || !['base', 'learning', 'english', 'frozen'].includes(suite)) throw new Error('Usage: merge-live.ts baseline refresh output base|learning|english|frozen');
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const raw = readFileSync(refreshPath, 'utf8');
const refresh = JSON.parse(raw);
const expected = suite === 'base' ? createLiveCases() : suite === 'english' ? createEnglishCases() : suite === 'frozen' ? createFrozenCases() : createLearningLiveCases();
const replacements = new Map<string, Record<string, unknown>>(refresh.cases.map((r: {case: {id: string}}) => [r.case.id, r]));
for (const row of replacements.values()) {
  if (row.requestedModel !== refresh.requestedModel || row.judgePolicySha256 !== refresh.judgePolicySha256) throw new Error('Refresh rows require explicit snapshot/policy provenance');
}
const combined = { ...baseline, completedAt: refresh.completedAt, updatedAt: refresh.updatedAt,
  cases: baseline.cases.map((r: {case: {id: string}}) => replacements.get(r.case.id) ?? r),
  refreshes: [...(baseline.refreshes ?? []), { completedAt: refresh.completedAt, requestedModel: refresh.requestedModel,
    judgePolicySha256: refresh.judgePolicySha256, sourceSha256: createHash('sha256').update(raw).digest('hex'),
    refreshedCases: replacements.size, retainedCases: baseline.cases.length - replacements.size, targetReuseSummary: refresh.targetReuseSummary,
    refreshedIds: [...replacements.keys()], note: 'Only these exact cases were newly executed. Other rows retain their previous accepted evidence.' }],
};
for (const row of replacements.values()) if (!combined.cases.some((r: {case: {id: string}}) => r.case.id === (row.case as {id: string}).id)) combined.cases.push(row);
combined.summary = Object.fromEntries(['pass','fail','uncertain'].map(k => [k, combined.cases.filter((r: {gateJudgment: string}) => r.gateJudgment === k).length]));
combined.rawJudgeSummary = Object.fromEntries(['pass','fail','uncertain'].map(k => [k, combined.cases.filter((r: {judge: {judgment: string}}) => r.judge.judgment === k).length]));
combined.adjudications = combined.cases.filter((r: {adjudication?: unknown}) => r.adjudication).length;
if (suite === 'frozen') Object.assign(combined, {verificationProvenance});
const result = suite === 'frozen' ? validateFrozenArchive(combined) : validateLiveArchive(combined, expected);
if (result.issues.length) throw new Error(result.issues.join('\n'));
writeFileSync(outputPath, JSON.stringify(combined, null, 2) + '\n');
console.log(`Accepted ${replacements.size} refreshed rows; retained ${combined.cases.length - replacements.size} baseline rows.`);
