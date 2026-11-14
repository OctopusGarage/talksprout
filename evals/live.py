#!/usr/bin/env python3
"""Opt-in real API evaluation; credentials stay in curl stdin, never in artifacts."""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time

parser = argparse.ArgumentParser()
parser.add_argument('--model', default=os.environ.get('TALKSPROUT_EVAL_MODEL', 'gpt-4.1'))
parser.add_argument('--workers', type=int, default=6)
parser.add_argument('--limit', type=int)
parser.add_argument('--output', default='.superpowers/model-run/live-current.json')
parser.add_argument('--resume', action='store_true')
args = parser.parse_args()
key = os.environ.get('OPENAI_API_KEY')
if not key:
    raise SystemExit('OPENAI_API_KEY is required. No live requests were made.')
if not 1 <= args.workers <= 12:
    raise SystemExit('workers must be between 1 and 12')
root = Path('.superpowers/model-run')
root.mkdir(parents=True, exist_ok=True)
cases = json.loads((root / 'cases.json').read_text())
if args.limit:
    cases = cases[:args.limit]
output = Path(args.output)
output.parent.mkdir(parents=True, exist_ok=True)
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
judge_policy = json.loads(Path('evals/live-policy.json').read_text())
judge_system = judge_policy['system']
judge_policy_sha = digest({'model':args.model, **judge_policy})
archive = dict(method='live-openai-chat-completions', requestedModel=args.model,
               endpoint='https://api.openai.com/v1/chat/completions', startedAt=now(),
               judgePolicySha256=judge_policy_sha, sampling='One target response per case, temperature 0; separate same-model judge calls, not an independent model or audio test.', cases=[])
prior = {}
if args.resume and output.exists():
    old = json.loads(output.read_text())
    if old.get('requestedModel') == args.model:
        prior = {r['case']['id']: r for r in old.get('cases', [])}
        if old.get('judgePolicySha256') != judge_policy_sha:
            for row in prior.values():
                row.pop('judge',None)
                row.pop('judgeExecution',None)
        archive['startedAt'] = old['startedAt']

def save():
    archive['updatedAt'] = now()
    temporary = output.with_suffix('.tmp')
    temporary.write_text(json.dumps(archive, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(output)

def api(body):
    for attempt in range(3):
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', dir=root, delete=False) as file:
            json.dump(body, file, ensure_ascii=False)
            filename = file.name
        config = 'url = "https://api.openai.com/v1/chat/completions"\nheader = ' + json.dumps('Authorization: Bearer ' + key) + '\nheader = "Content-Type: application/json"\n'
        started = time.monotonic()
        try:
            result = subprocess.run(['curl', '--silent', '--show-error', '--max-time', '75', '--request', 'POST', '--write-out', '\n%{http_code}', '--data-binary', '@' + filename, '--config', '-'], input=config, text=True, capture_output=True)
        finally:
            Path(filename).unlink(missing_ok=True)
        raw, _, status = result.stdout.rpartition('\n')
        if result.returncode:
            error = {'kind': 'transport', 'curlExit': result.returncode}
        else:
            try:
                data = json.loads(raw)
            except ValueError:
                data = {}
            if status == '200' and data.get('choices'):
                return dict(responseId=data.get('id'), model=data.get('model'), created=data.get('created'),
                            usage=data.get('usage'), finishReason=data['choices'][0].get('finish_reason'),
                            content=data['choices'][0]['message'].get('content'), latencyMs=int((time.monotonic() - started)*1000))
            provider_error = data.get('error') or {}
            # Never log provider error messages, which can include credential fragments.
            error = {'kind': 'provider', 'status': status, 'type': provider_error.get('type'), 'code': provider_error.get('code')}
            if status not in ['429', '500', '502', '503', '504']:
                return {'executionError': error}
        time.sleep(attempt + 1)
    return {'executionError': error}

def target(case):
    previous = prior.get(case['id'])
    if previous and previous.get('case') == case and previous.get('target', {}).get('content'):
        return previous
    body = dict(model=args.model, temperature=0, max_tokens=case['maxTokens'], messages=case['messages'])
    return {'case': case, 'target': api(body)}

print(f'Executing {len(cases)} isolated target cases with {args.model}; workers={args.workers}.', flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
    futures = [pool.submit(target, case) for case in cases]
    for future in concurrent.futures.as_completed(futures):
        archive['cases'].append(future.result())
        if len(archive['cases']) % 20 == 0:
            print(f'Target responses: {len(archive["cases"])}/{len(cases)}', flush=True)
            save()
archive['cases'].sort(key=lambda row: row['case']['id'])
save()



def judge_batch(rows):
    data = [{'id': r['case']['id'], 'criterion': r['case']['criterion'], 'messages': r['case']['messages'], 'reply': r['target'].get('content'), 'contractChecks': r.get('contractChecks')} for r in rows]
    result = api(dict(model=args.model, temperature=judge_policy['temperature'], max_tokens=judge_policy['max_tokens'], response_format=judge_policy['response_format'], messages=[{'role':'system','content':judge_system},{'role':'user','content':json.dumps(data, ensure_ascii=False)}]))
    try:
        verdicts = json.loads(result.get('content') or '{}').get('verdicts', [])
    except (ValueError, TypeError):
        verdicts = []
    by_id = {v.get('id'): v for v in verdicts if isinstance(v,dict)}
    assessments = []
    for row in rows:
        verdict = by_id.get(row['case']['id'])
        assessments.append({'row':row, 'judge':verdict if verdict and verdict.get('judgment') in ['pass','fail','uncertain'] else {'id':row['case']['id'],'judgment':'uncertain','reason':'Judge response missing or invalid.'}, 'execution':{k:v for k,v in result.items() if k != 'content'}})
    return assessments

valid = []
for row in archive['cases']:
    opening = row['case']['purpose'] in ['scene-opening','mock-opening','base-opening','technical-coaching','adapted-topic','mock-follow-up']
    count = (row['target'].get('content') or '').count('?')
    row['contractChecks'] = {'questionMarks':count,'oneQuestionOpening':not opening or count <= 1}
    if not row['target'].get('content') or row['target'].get('finishReason') != 'stop':
        row['judge'] = {'id':row['case']['id'],'judgment':'fail','reason':'Target execution failed, returned no text or was truncated.'}
    elif 'judge' not in row:
        valid.append(row)
batches = [valid[i:i+6] for i in range(0,len(valid),6)]
print(f'Judging {len(valid)} target replies in {len(batches)} independent requests to the same model.', flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
    futures = [pool.submit(judge_batch, batch) for batch in batches]
    for index, future in enumerate(concurrent.futures.as_completed(futures), 1):
        for assessment in future.result():
            assessment['row']['judge'] = assessment['judge']
            assessment['row']['judgeExecution'] = assessment['execution']
        if index % 10 == 0:
            print(f'Judge batches: {index}/{len(batches)}', flush=True)
            save()
for row in archive['cases']:
    row['gateJudgment'] = row['judge']['judgment'] if row['contractChecks']['oneQuestionOpening'] else 'fail'
    row['evidenceSha256'] = digest({k:v for k,v in row.items() if k != 'evidenceSha256'})
archive['completedAt'] = now()
archive['summary'] = {kind:sum(r.get('gateJudgment') == kind for r in archive['cases']) for kind in ['pass','fail','uncertain']}
save()
print(json.dumps(archive['summary']), flush=True)
if archive['summary']['fail'] or archive['summary']['uncertain']:
    raise SystemExit(1)
