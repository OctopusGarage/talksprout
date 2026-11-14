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
parser.add_argument('--model', default=os.environ.get('TALKSPROUT_EVAL_MODEL', 'gpt-4.1-2025-04-14'))
parser.add_argument('--workers', type=int, default=6)
parser.add_argument('--limit', type=int)
parser.add_argument('--cases', default='.superpowers/model-run/cases.json')
parser.add_argument('--output', default='.superpowers/model-run/live-current.json')
parser.add_argument('--resume', action='store_true')
parser.add_argument('--select', action='append', default=[], help='Case ID or prompt ID; repeat to select multiple')
parser.add_argument('--changed-from', help='Compare exact cases with a prior result archive; execute only changed/new cases')
parser.add_argument('--report-only', action='store_true', help='Write selection report without API requests')
args = parser.parse_args()
key = os.environ.get('OPENAI_API_KEY')
if not key and not args.report_only:
    raise SystemExit('OPENAI_API_KEY is required. No live requests were made.')
if not 1 <= args.workers <= 12:
    raise SystemExit('workers must be between 1 and 12')
root = Path('.superpowers/model-run')
root.mkdir(parents=True, exist_ok=True)
cases = json.loads(Path(args.cases).read_text())
total_cases = len(cases)
if args.select:
    cases = [c for c in cases if c['id'] in args.select or c['promptId'] in args.select]
    matched = {v for c in cases for v in [c['id'], c['promptId']]}
    if set(args.select) - matched:
        raise SystemExit('Unknown selection: ' + ', '.join(sorted(set(args.select) - matched)))
unchanged = []
if args.changed_from:
    baseline = json.loads(Path(args.changed_from).read_text())
    previous_cases = {r['case']['id']: r['case'] for r in baseline.get('cases', [])}
    unchanged = [c['id'] for c in cases if previous_cases.get(c['id']) == c]
    cases = [c for c in cases if c['id'] not in unchanged]
if args.limit:
    cases = cases[:args.limit]
selection_report = dict(totalGenerated=total_cases, selected=len(cases), selectedIds=[c['id'] for c in cases],
                        unchangedIds=unchanged, baseline=args.changed_from, model=args.model,
                        note='Selection report only; retained historical evidence is not a new execution.')
report = Path(args.output).with_suffix('.selection.json')
report.parent.mkdir(parents=True, exist_ok=True)
report.write_text(json.dumps(selection_report, indent=2) + '\n')
if args.report_only:
    print(json.dumps({k:v for k,v in selection_report.items() if k not in ['selectedIds','unchangedIds']} | {'unchanged':len(unchanged), 'report':str(report)}))
    raise SystemExit(0)
output = Path(args.output)
output.parent.mkdir(parents=True, exist_ok=True)
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
judge_policy = json.loads(Path('evals/live-policy.json').read_text())
judge_system = judge_policy['system']
session_policy = {'sessionJudgeMethod':'isolated-turn-prefix-v1'} if any(c.get('turns') for c in cases) else {}
judge_policy_sha = digest({'model':args.model, **judge_policy, **session_policy})
archive = dict(**session_policy, method='live-openai-chat-completions', requestedModel=args.model,
               endpoint='https://api.openai.com/v1/chat/completions', startedAt=now(),
               judgePolicySha256=judge_policy_sha, sampling=('Sequential target turns per session using actual preceding replies; each turn has an isolated same-model judge call; temperature 0, no independent model or audio test.' if session_policy else 'One target response per case, temperature 0; one isolated case per same-model judge call, not an independent model or audio test.'), cases=[])
prior = {}
if args.resume and output.exists():
    old_raw = output.read_text()
    history = output.with_name(output.stem + '-history-' + hashlib.sha256(old_raw.encode()).hexdigest()[:16] + '.json')
    if not history.exists():
        history.write_text(old_raw)
    old = json.loads(old_raw)
    if old.get('requestedModel') == args.model:
        prior = {r['case']['id']: r for r in old.get('cases', [])}
        prior_policy_matches = old.get('judgePolicySha256') == judge_policy_sha
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

def valid_execution(result):
    return (isinstance(result, dict) and result.get('responseId') and result.get('model') == args.model
            and result.get('finishReason') == 'stop' and isinstance(result.get('content'), str)
            and bool(result['content'].strip()) and not result.get('executionError'))

def valid_session(case, row):
    if not case.get('turns'):
        return True
    results = row.get('turnResults', [])
    if len(results) != len(case['turns']):
        return False
    messages = list(case['messages'])
    for expected, actual in zip(case['turns'], results):
        if (actual.get('input') != expected['input'] or actual.get('criterion') != expected['criterion']
                or not valid_execution(actual.get('target'))):
            return False
        messages.extend([{'role':'user','content':expected['input']},
                         {'role':'assistant','content':actual['target']['content']}])
    return messages == row.get('executedMessages') and row.get('target') == results[-1]['target']

def target_signature(case):
    return {'messages':case.get('messages'), 'maxTokens':case.get('maxTokens'),
            'inputs':[t['input'] for t in case.get('turns', [])]}

cache_stats = {'reusedCases':0, 'executedCases':0}

def target(case):
    previous = prior.get(case['id'])
    if previous and target_signature(previous.get('case', {})) == target_signature(case) and valid_execution(previous.get('target')):
        # Cached evidence must still match its content digest, not only its case ID.
        seal = previous.get('evidenceSha256')
        sealed = seal == digest({k:v for k,v in previous.items() if k != 'evidenceSha256'})
        if sealed and valid_session(previous['case'], previous):
            cache_stats['reusedCases'] += 1
            same_case = previous['case'] == case
            previous['case'] = case
            previous['requestedModel'] = args.model
            previous['judgePolicySha256'] = judge_policy_sha
            for expected, actual in zip(case.get('turns', []), previous.get('turnResults', [])):
                actual['criterion'] = expected['criterion']
            if not same_case or not prior_policy_matches or not valid_execution(previous.get('judgeExecution', {}) | {'content':'cached'}):
                previous.pop('judge', None)
                previous.pop('judgeExecution', None)
            return previous
    cache_stats['executedCases'] += 1
    messages = list(case['messages'])
    row = {'case': case, 'requestedModel': args.model, 'judgePolicySha256': judge_policy_sha}
    if case.get('turns'):
        row['turnResults'] = []
        for turn in case['turns']:
            messages.append({'role':'user', 'content':turn['input']})
            reply = api(dict(model=args.model, temperature=0, max_tokens=case['maxTokens'], messages=messages))
            row['turnResults'].append({'input':turn['input'], 'criterion':turn['criterion'], 'target':reply})
            if not valid_execution(reply):
                row['target'] = reply
                row['executedMessages'] = messages
                return row
            messages.append({'role':'assistant', 'content':reply['content']})
        row['executedMessages'] = messages
        row['target'] = reply
        return row
    row['target'] = api(dict(model=args.model, temperature=0, max_tokens=case['maxTokens'], messages=messages))
    return row

print(f'Executing {len(cases)} target cases/sessions with {args.model}; workers={args.workers}.', flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
    futures = [pool.submit(target, case) for case in cases]
    for future in concurrent.futures.as_completed(futures):
        archive['cases'].append(future.result())
        if len(archive['cases']) % 20 == 0:
            print(f'Target responses: {len(archive["cases"])}/{len(cases)}', flush=True)
            save()
archive['cases'].sort(key=lambda row: row['case']['id'])
archive['targetReuseSummary'] = cache_stats
save()



def judge_batch(rows):
    if len(rows) == 1 and rows[0].get('turnResults'):
        row = rows[0]
        messages = list(row['case']['messages'])
        assessments = []
        for turn in row['turnResults']:
            messages.append({'role':'user','content':turn['input']})
            probe = {'case':dict(row['case'], criterion=turn['criterion'], messages=list(messages)), 'target':turn['target']}
            assessment = judge_batch([probe])[0]
            assessments.append({'judge':assessment['judge'], 'execution':assessment['execution']})
            messages.append({'role':'assistant','content':turn['target']['content']})
        row['turnJudgments'] = assessments
        verdict = next((a['judge'] for a in assessments if a['judge']['judgment'] == 'fail'),
                       next((a['judge'] for a in assessments if a['judge']['judgment'] == 'uncertain'), assessments[-1]['judge']))
        aggregate = dict(verdict, reason='Per-turn isolated judgments: ' + ' | '.join(a['judge']['reason'] for a in assessments))
        return [{'row':row, 'judge':aggregate, 'execution':assessments[-1]['execution']}]
    data = [{'id': r['case']['id'], 'criterion': r['case']['criterion'], 'messages': r.get('executedMessages', r['case']['messages']), 'turnResults':r.get('turnResults'), 'reply': r['target'].get('content'), 'contractChecks': r.get('contractChecks')} for r in rows]
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
    if not valid_execution(row['target']):
        row['judge'] = {'id':row['case']['id'],'judgment':'fail','reason':'Target execution failed, returned no text or was truncated.'}
    elif 'judge' not in row:
        valid.append(row)
# Isolate each case so full and compact instructions cannot leak across judgments.
batch_size = judge_policy.get('batch_size', 1)
if batch_size != 1:
    raise SystemExit('Judge requests must contain exactly one case')
batches = [valid[i:i+batch_size] for i in range(0,len(valid),batch_size)]
judge_requests = sum(len(r.get('turnResults', [])) or 1 for r in valid)
print(f'Judging {len(valid)} cases/sessions in {judge_requests} isolated requests to the same model.', flush=True)
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
archive['rawJudgeSummary'] = dict(archive['summary'])
archive['adjudications'] = 0
save()
print(json.dumps(archive['summary']), flush=True)
if archive['summary']['fail'] or archive['summary']['uncertain']:
    raise SystemExit(1)
