import examples from './calibration-cases.json';
import policy from './live-policy.json';
import { evidenceDigest } from './validate';

type Row = Record<string, unknown>;
const object = (v: unknown): v is Row => !!v && typeof v === 'object' && !Array.isArray(v);
const nonempty = (v: unknown): v is string => typeof v === 'string' && !!v.trim();
export function validateCalibration(value: unknown) {
  const issues: string[] = [];
  if (!object(value) || !Array.isArray(value.cases)) return {cases: 0, issues:['calibration: missing cases']};
  if (value.method !== 'authored-pairs-real-openai-judge' || value.labelProvenance !== 'agent-authored-labeled-pairs' ||
      value.requestedModel !== 'gpt-4.1-2025-04-14' || value.endpoint !== 'https://api.openai.com/v1/chat/completions' || !nonempty(value.completedAt)) issues.push('calibration: missing real judge/authored label provenance');
  if (value.judgePolicySha256 !== evidenceDigest({model:'gpt-4.1-2025-04-14', ...policy})) issues.push('calibration: stale judge policy');
  const expected = new Map(examples.cases.map(c => [c.id, c]));
  const seen = new Set<string>();
  const executions = new Set<string>();
  let agree = 0;
  for (const row of value.cases) {
    if (!object(row) || !object(row.example)) {issues.push('calibration: malformed example'); continue;}
    const id = String(row.example.id);
    const fail = (reason: string) => issues.push(`${id}: ${reason}`);
    const original = expected.get(id);
    if (!original || evidenceDigest(row.example) !== evidenceDigest(original)) fail('unexpected or changed authored example/label');
    if (seen.has(id)) fail('duplicate example');
    seen.add(id);
    if (row.evidenceSha256 !== evidenceDigest(row)) fail('stale evidence');
    const execution = row.judgeExecution;
    const judge = row.judge;
    if (!object(execution) || !nonempty(execution.responseId) || execution.model !== 'gpt-4.1-2025-04-14' || execution.finishReason !== 'stop' || !object(execution.usage) || !nonempty(execution.content) || execution.executionError) fail('missing complete real judge execution');
    else {
      if (executions.has(execution.responseId)) fail('judge execution must be isolated and unique');
      executions.add(execution.responseId);
      try {
        const parsed: unknown = JSON.parse(execution.content);
        if (!object(parsed) || !Array.isArray(parsed.verdicts) || parsed.verdicts.length !== 1 || evidenceDigest({judge:parsed.verdicts[0]}) !== evidenceDigest({judge})) fail('raw judge response does not match verdict');
      } catch {fail('invalid raw judge JSON');}
    }
    const agrees = !!(object(judge) && judge.id === id && nonempty(judge.reason) && judge.judgment === original?.expectedJudgment);
    if (agrees) agree++;
    else fail('judge disagrees with authored label or verdict is missing');
    if (row.agrees !== agrees) fail('incorrect agreement flag');
  }
  for (const id of expected.keys()) if (!seen.has(id)) issues.push(`calibration: missing ${id}`);
  if (!object(value.summary) || value.summary.agree !== agree || value.summary.disagree !== value.cases.length - agree) issues.push('calibration: inconsistent agreement summary');
  return {cases:value.cases.length, issues};
}
