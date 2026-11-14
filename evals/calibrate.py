#!/usr/bin/env python3
"""Real isolated same-model judge calibration on authored labeled examples.
No target calls: labels and sample replies are authored, never judge inputs.
"""
import argparse, datetime, hashlib, json, os, subprocess, tempfile, time
from pathlib import Path
parser = argparse.ArgumentParser()
parser.add_argument('--output', default='.superpowers/model-run/calibration-current.json')
args = parser.parse_args()
key = os.environ.get('OPENAI_API_KEY')
if not key: raise SystemExit('OPENAI_API_KEY is required. No requests were made.')
root = Path('.superpowers/model-run')
root.mkdir(parents=True, exist_ok=True)
model = 'gpt-4.1-2025-04-14'
def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
policy = json.loads(Path('evals/live-policy.json').read_text())
examples = json.loads(Path('evals/calibration-cases.json').read_text())
archive = dict(method='authored-pairs-real-openai-judge', labelProvenance='agent-authored-labeled-pairs', requestedModel=model, endpoint='https://api.openai.com/v1/chat/completions', judgePolicySha256=digest(dict(model=model, **policy)), startedAt=now(), cases=[])
output = Path(args.output)
output.parent.mkdir(parents=True, exist_ok=True)
if output.exists(): raise SystemExit('Refusing to overwrite existing calibration evidence; choose a new --output path.')
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

for example in examples['cases']:
    # Deliberately omit expectedJudgment, pair and labelRationale from the request.
    probe = {k:example[k] for k in ['id','criterion','messages','reply']}
    execution = api(dict(model=model, temperature=policy['temperature'], max_tokens=policy['max_tokens'], response_format=policy['response_format'], messages=[dict(role='system',content=policy['system']),dict(role='user',content=json.dumps([probe],ensure_ascii=False))]))
    try:
        verdicts = json.loads(execution.get('content') or '{}').get('verdicts', [])
        judge = verdicts[0] if len(verdicts) == 1 and verdicts[0].get('id') == example['id'] else None
    except (ValueError, TypeError, AttributeError): judge = None
    row = dict(example=example, judge=judge, judgeExecution=execution)
    row['agrees'] = bool(judge and judge.get('judgment') == example['expectedJudgment'])
    row['evidenceSha256'] = digest(row)
    archive['cases'].append(row)
    archive['completedAt'] = now()
    archive['summary'] = dict(agree=sum(r['agrees'] for r in archive['cases']), disagree=sum(not r['agrees'] for r in archive['cases']))
    output.write_text(json.dumps(archive,ensure_ascii=False,indent=2)+'\n')
    print(example['id'] + ': ' + ('agree' if row['agrees'] else 'DISAGREE'),flush=True)
print(json.dumps(archive['summary']))
if archive['summary']['disagree']: raise SystemExit(1)
