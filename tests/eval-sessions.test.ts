import assert from 'node:assert/strict';
import test from 'node:test';
import { createSessionCases, createEnglishCases } from '../evals/session-cases';

test('end-to-end suite supplies learner turns without seeded assistant messages', () => {
  const cases = createSessionCases();
  assert.equal(cases.length, 8);
  for (const c of cases) {
    assert.equal(c.turns?.length, 4);
    assert.ok(c.messages.every(m => m.role === 'user'));
    assert.ok(c.turns?.every(t => t.input && t.criterion));
  }
  assert.ok(cases.some(c => c.purpose === 'heldout-source-review'));
});
test('English suite renders 34 full/compact review and helper cases with 22 stable prompt IDs', () => {
  const cases = createEnglishCases();
  assert.equal(cases.length, 34);
  assert.equal(cases.filter(c => c.variant === 'spoken').length, 12);
  assert.equal(new Set(cases.map(c => c.id)).size, 34);
  assert.ok(cases.every(c => c.locale === 'en'));
  assert.equal(new Set(cases.map(c => c.promptId)).size, 22);
  assert.ok(cases.find(c => c.promptId === 'writing-intent')?.messages.at(-1)?.content.includes('周五'));
});

import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('runner uses actual replies, reuses sealed cache, and rejects tampered cache (mock transport)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'talksprout-session-'));
  try {
    // Local transport simulation, never a real provider execution.
    writeFileSync(join(dir, 'curl'), `#!/usr/bin/env python3
import json,sys
from pathlib import Path
args=sys.argv
body=json.loads(Path(args[args.index('--data-binary')+1][1:]).read_text())
messages=body['messages']
if body.get('response_format'):
    content=json.dumps({'verdicts':[{'id':'session-test','judgment':'pass','reason':'mock only'}]})
else:
    n=sum(m['role']=='assistant' for m in messages)
    assert all(m['content'].startswith('actual-') for m in messages if m['role']=='assistant')
    content='actual-'+str(n)
print(json.dumps({'id':'mock-'+str(len(messages)),'model':body['model'],'choices':[{'finish_reason':'stop','message':{'content':content}}]}))
print('200',end='')
`, { mode: 0o755 });
    const caseFile = join(dir, 'cases.json');
    const output = join(dir, 'output.json');
    writeFileSync(caseFile, JSON.stringify([{ ...createSessionCases()[0], id: 'session-test' }]));
    const run = (...flags: string[]) => spawnSync('python3', ['evals/live.py', '--cases', caseFile, '--output', output, ...flags], {
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, OPENAI_API_KEY: 'local-mock-only' }, encoding: 'utf8',
    });
    let result = run();
    assert.equal(result.status, 0, result.stderr);
    const archive = JSON.parse(readFileSync(output, 'utf8'));
    assert.deepEqual(archive.cases[0].turnResults.map((t: {target: {content: string}}) => t.target.content), ['actual-0','actual-1','actual-2','actual-3']);
    assert.equal(archive.cases[0].executedMessages.filter((m: {role: string}) => m.role === 'assistant').length, 4);
    assert.equal(archive.sessionJudgeMethod, 'isolated-turn-prefix-v1');
    assert.equal(archive.cases[0].turnJudgments.length, 4);
    const original = archive.cases[0].target;
    result = run('--resume');
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(readFileSync(output, 'utf8')).cases[0].target, original);
    const revisedCase = { ...archive.cases[0].case, criterion: 'A revised judge criterion only; target inputs unchanged.' };
    writeFileSync(caseFile, JSON.stringify([revisedCase]));
    result = run('--resume');
    assert.equal(result.status, 0, result.stderr);
    const rejudged = JSON.parse(readFileSync(output, 'utf8'));
    assert.deepEqual(rejudged.targetReuseSummary, { reusedCases: 1, executedCases: 0 });
    assert.deepEqual(rejudged.cases[0].target, original);
    archive.cases[0].target.content = 'tampered';
    writeFileSync(output, JSON.stringify(archive));
    result = run('--resume');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(readFileSync(output, 'utf8')).cases[0].target.content, 'actual-3');
    result = run('--changed-from', output, '--report-only');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).selected, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

import { validateLiveArchive } from '../evals/live-validate';
import { evidenceDigest } from '../evals/validate';
import policy from '../evals/live-policy.json';

test('refreshed per-row policy and snapshot cannot be swapped even with a new seal', () => {
  const initial = JSON.parse(readFileSync('evals/results/2026-11-14-optimization-initial.json', 'utf8'));
  const archived = initial.english.cases.find((r: {case: {promptId: string}}) => r.case.promptId === 'reading-guide');
  const expected = createEnglishCases().find(c => c.promptId === 'reading-guide')!;
  const row = { ...archived, case: expected, requestedModel: 'gpt-4.1-2025-04-14', judgePolicySha256: evidenceDigest({model:'gpt-4.1-2025-04-14', ...policy}) };
  row.evidenceSha256 = evidenceDigest(row);
  const archive = { ...initial.english, cases: [row], summary: {pass:1,fail:0,uncertain:0}, rawJudgeSummary: {pass:1,fail:0,uncertain:0} };
  assert.deepEqual(validateLiveArchive(archive, [expected]).issues, []);
  row.judgePolicySha256 = 'wrong';
  row.evidenceSha256 = evidenceDigest(row);
  assert.ok(validateLiveArchive(archive, [expected]).issues.some(i => i.includes('per-case judge policy')));
  row.judgePolicySha256 = evidenceDigest({model:row.requestedModel, ...policy});
  row.target = { ...row.target, model: 'another-snapshot' };
  row.evidenceSha256 = evidenceDigest(row);
  assert.ok(validateLiveArchive(archive, [expected]).issues.some(i => i.includes('snapshot mismatch')));
});

test('accepted session evidence requires the actual history and worst-turn gate after resealing', () => {
  const archive = JSON.parse(readFileSync('evals/fixtures/session-live-api.json', 'utf8'));
  assert.deepEqual(validateLiveArchive(archive, createSessionCases()).issues, []);
  const row = archive.cases[0];
  row.turnJudgments[0].judge.judgment = 'fail';
  row.evidenceSha256 = evidenceDigest(row);
  assert.ok(validateLiveArchive(archive, createSessionCases()).issues.some(i => i.includes('worst turn')));
  row.executedMessages[2].content = 'Authored replacement rather than the actual target reply';
  row.evidenceSha256 = evidenceDigest(row);
  assert.ok(validateLiveArchive(archive, createSessionCases()).issues.some(i => i.includes('actual target replies')));
});

test('each isolated turn uses a unique judge execution even after resealing', () => {
  const archive = JSON.parse(readFileSync('evals/fixtures/session-live-api.json', 'utf8'));
  archive.cases[0].turnJudgments[1].execution = archive.cases[0].turnJudgments[0].execution;
  archive.cases[0].evidenceSha256 = evidenceDigest(archive.cases[0]);
  assert.ok(validateLiveArchive(archive, createSessionCases()).issues.some(i => i.includes('unique across all turns')));
});
