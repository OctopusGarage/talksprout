import json,subprocess,concurrent.futures,datetime
from pathlib import Path
root=Path.cwd();base=root/'.superpowers/model-run/contextual-015';plan=json.loads((base/'plan.json').read_text())
def execute(item):
 route,case=item;turns=case['turns']
 if route=='mcp':turns=[t.replace('$talksprout','TalkSprout') for t in turns]
 command=['python3',str(base/'probe.py'),'--route',route,'--intent',turns[0]]
 if route=='skill-web':
  command+=['--allow-skill-reader']
  if not turns[0].startswith('$talksprout'):command+=['--explicit']
 else:command+=['--endpoint','http://localhost:8791/mcp']
 for text in turns[1:]:command+=['--follow-up',text]
 log=base/(case['id']+'--'+route+'.log');print('START',case['id'],route,flush=True)
 with log.open('w')as output:r=subprocess.run(command,stdout=output,stderr=subprocess.STDOUT)
 print('DONE',case['id'],route,r.returncode,flush=True)
 return {'caseId':case['id'],'route':route,'exitCode':r.returncode,'command':command,'log':str(log)}
items=[(route,case)for case in plan['cases']for route in ['skill-web','mcp']]
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:records=list(pool.map(execute,items))
(base/'executions.json').write_text(json.dumps(records,indent=2)+'\n');raise SystemExit(any(r['exitCode']for r in records))
