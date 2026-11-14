import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { validateCalibration } from '../evals/calibration-validate';
import { evidenceDigest } from '../evals/validate';
import { validateFrozenArchive, validateOriginalFinding, validateHelpFinding, validateSessionReviews } from '../evals/frozen-validate';
import { createFrozenCases } from '../evals/frozen-cases';
import { createSessionCases } from '../evals/session-cases';
import { validateLiveArchive } from '../evals/live-validate';
const calibration = () => JSON.parse(readFileSync('evals/fixtures/judge-calibration.json', 'utf8'));

test('real calibration evidence agrees with all authored labels, including four negative examples', () => {
  const archive = calibration();
  assert.deepEqual(validateCalibration(archive), {cases:8,issues:[]});
  assert.equal(archive.cases.filter((r: {example:{expectedJudgment:string}}) => r.example.expectedJudgment === 'fail').length, 4);
});
test('calibration rejects resealed disagreements, changed labels, and forged provenance', () => {
  const archive = calibration();
  const row = archive.cases[0];
  row.judge.judgment = 'fail';
  row.judgeExecution.content = JSON.stringify({verdicts:[row.judge]});
  row.agrees = true;
  row.evidenceSha256 = evidenceDigest(row);
  assert.ok(validateCalibration(archive).issues.some(i => i.includes('disagrees')));
  row.example.expectedJudgment = 'fail';
  row.evidenceSha256 = evidenceDigest(row);
  assert.ok(validateCalibration(archive).issues.some(i => i.includes('changed authored example/label')));
  archive.method = 'static-review';
  assert.ok(validateCalibration(archive).issues.some(i => i.includes('provenance')));
});
test('calibration requires isolated execution, exact coverage, current policy and raw verdict integrity', () => {
  for (const mutation of ['duplicate-execution','missing','policy','raw-verdict','truncated']) {
    const archive = calibration();
    const row = archive.cases[0];
    if (mutation === 'duplicate-execution') row.judgeExecution.responseId = archive.cases[1].judgeExecution.responseId;
    if (mutation === 'missing') archive.cases.pop();
    if (mutation === 'policy') archive.judgePolicySha256 = 'obsolete';
    if (mutation === 'raw-verdict') row.judgeExecution.content = '{"verdicts":[]}';
    if (mutation === 'truncated') row.judgeExecution.finishReason = 'length';
    row.evidenceSha256 = evidenceDigest(row);
    assert.ok(validateCalibration(archive).issues.length > 0, mutation);
  }
});
test('frozen authored scripts are distinct from tuned regression and contain only actual target history', () => {
  const cases = createFrozenCases();
  const regressionInputs = new Set(createSessionCases().flatMap(c => c.turns!.map(t => t.input)));
  assert.equal(cases.length, 7);
  assert.ok(cases.every(c => c.messages.every(m => m.role === 'user') && c.turns?.length === 4));
  assert.ok(cases.flatMap(c => c.turns!).every(t => !regressionInputs.has(t.input)));
  const archive = JSON.parse(readFileSync('evals/fixtures/frozen-live-api.json', 'utf8'));
  assert.deepEqual(validateFrozenArchive(archive).issues, []);
  const badProvenance = structuredClone(archive);
  badProvenance.verificationProvenance.tunedRegressionIds = [];
  assert.ok(validateFrozenArchive(badProvenance).issues.some(i => i.includes("provenance")));
  archive.cases[0].executedMessages[2].content = 'A seeded replacement';
  archive.cases[0].evidenceSha256 = evidenceDigest(archive.cases[0]);
  assert.ok(validateLiveArchive(archive, cases).issues.some(i => i.includes('actual target replies')));
});

import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('calibration runner hides authored labels and preserves disagreement as failed gate (mock transport)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'talksprout-calibration-'));
  try {
    writeFileSync(join(dir, 'curl'), `#!/usr/bin/env python3
import json,sys
from pathlib import Path
args=sys.argv
body=json.loads(Path(args[args.index('--data-binary')+1][1:]).read_text())
probe=json.loads(body['messages'][1]['content'])[0]
assert set(probe)=={'id','criterion','messages','reply'}
assert body['model']=='gpt-4.1-2025-04-14'
content=json.dumps({'verdicts':[{'id':probe['id'],'judgment':'uncertain','reason':'Mock deliberately disagrees.'}]})
print(json.dumps({'id':'mock-'+probe['id'],'model':body['model'],'usage':{'total_tokens':1},'choices':[{'finish_reason':'stop','message':{'content':content}}]}))
print('200',end='')
`, {mode:0o755});
    const output = join(dir, 'output.json');
    const result = spawnSync('python3', ['evals/calibrate.py','--output',output], {encoding:'utf8', env:{...process.env, PATH:`${dir}:${process.env.PATH}`, OPENAI_API_KEY:'mock-only'}});
    assert.equal(result.status, 1, result.stderr);
    const archive = JSON.parse(readFileSync(output, 'utf8'));
    assert.deepEqual(archive.summary, {agree:0,disagree:8});
    assert.equal(archive.cases.length, 8);
    assert.ok(archive.cases.every((r:{judge:{judgment:string}}) => r.judge.judgment === 'uncertain'));
    assert.ok(validateCalibration(archive).issues.some(i => i.includes('disagrees')));
  } finally {rmSync(dir, {recursive:true,force:true});}
});


test('initial false-pass finding stays bound to original raw reply and judge', () => {
  const archive = JSON.parse(readFileSync('evals/results/2026-11-14-frozen-verification-initial.json', 'utf8'));
  const finding = JSON.parse(readFileSync('evals/results/2026-11-14-frozen-verification-static-finding.json', 'utf8'));
  assert.deepEqual(validateOriginalFinding(archive, finding), []);
  finding.observedReply = 'A replacement reply';
  assert.ok(validateOriginalFinding(archive, finding).length > 0);
});


test('hint leakage false-pass finding stays bound to original evidence and exact judge', () => {
  const archive = JSON.parse(readFileSync('evals/results/2026-11-14-listening-followup-first.json', 'utf8'));
  const finding = JSON.parse(readFileSync('evals/results/2026-11-14-listening-help-static-finding.json', 'utf8'));
  assert.deepEqual(validateHelpFinding(archive, finding), []);
  finding.rawJudge.reason = 'Invented review';
  assert.ok(validateHelpFinding(archive, finding).length > 0);
});


test('session semantic reviews preserve original outcomes and cannot drift from the observed turn', () => {
  const archive = JSON.parse(readFileSync('evals/fixtures/frozen-live-api.json', 'utf8'));
  const review = JSON.parse(readFileSync('evals/results/2026-11-14-station-semantic-review.json', 'utf8'));
  assert.deepEqual(validateSessionReviews(archive, [review]), []);
  review.turnIndex = 0;
  assert.ok(validateSessionReviews(archive, [review]).length > 0);
});
