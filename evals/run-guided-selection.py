#!/usr/bin/env python3
"""Run authored guided-selection fixtures through genuine native Codex history; no API key."""
import argparse,json,subprocess,concurrent.futures,tempfile
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--route',choices=['skill-web','mcp','both'],default='both');parser.add_argument('--numbered',action='store_true');parser.add_argument('--endpoint',default='http://localhost:8791/mcp');args=parser.parse_args();cases=json.loads(Path('evals/fixtures/guided-numbered-cases.json' if args.numbered else 'evals/fixtures/guided-selection-cases.json').read_text())
def run(route):
 command=['python3','evals/probe-behavior.py','--route',route,'--intent',cases['turns'][0]['input']]
 if route=='skill-web':
  replay=Path(tempfile.mkdtemp(prefix='talksprout-guided-replay-'));(replay/'SKILL.md').write_bytes(Path('evals/fixtures/guided-bootstrap-tested.md').read_bytes());command+=['--allow-skill-reader','--skill',str(replay)]
 else:command+=['--endpoint',args.endpoint]
 for turn in cases['turns'][1:]:command+=['--follow-up',turn['input']]
 result=subprocess.run(command);return result.returncode
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:results=list(pool.map(run,['skill-web','mcp']if args.route=='both'else[args.route]))
raise SystemExit(any(results))
