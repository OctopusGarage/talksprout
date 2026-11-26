#!/usr/bin/env python3
"""Small genuine host-capability/post-deployment probes, separate from the controlled behavior matrix."""
import argparse,datetime,hashlib,json,os,shutil,subprocess,tempfile,time,uuid,zipfile
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--route',choices=['skill-web','mcp'],default='skill-web');parser.add_argument('--skill',default='skills/talksprout');parser.add_argument('--endpoint');parser.add_argument('--explicit',action='store_true');parser.add_argument('--allow-skill-reader',action='store_true');parser.add_argument('--intent',default='Use TalkSprout Gentle Conversation Coach to practise English with me.');parser.add_argument('--follow-up',action='append',default=[]);args=parser.parse_args()
root=Path.cwd();out=root/'.superpowers/model-run'/('behavior-probe-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')+'-'+uuid.uuid4().hex[:8]);out.mkdir(parents=True)
env=dict(os.environ);env.pop('OPENAI_API_KEY',None);endpoint=json.loads((root/'distribution/config.json').read_text())['mcpEndpoint']
if args.endpoint:
 if args.endpoint not in [endpoint,'http://localhost:8791/mcp','http://127.0.0.1:8791/mcp']:raise ValueError('Only configured production MCP or the isolated local TalkSprout test endpoint is supported')
 endpoint=args.endpoint
def digest(s):return hashlib.sha256(s.encode()).hexdigest()
def native(thread):
 files=list((Path.home()/'.codex/sessions').rglob('*'+thread+'.jsonl'));result=[]
 if not files:return result
 for line in files[0].read_text().splitlines():
  row=json.loads(line);p=row.get('payload',{})
  if row.get('type')!='response_item':continue
  if p.get('type')=='message' and p.get('role')=='user':
   text='\n'.join(c.get('text','') for c in p.get('content',[]) if c.get('type') in ['input_text','output_text'])
   result.append({'type':'host_agents_context','sha256':digest(text)} if text.startswith('# AGENTS.md') else {'type':'user_message','text':text})
  elif p.get('type') in ['custom_tool_call','custom_tool_call_output','function_call','function_call_output']:result.append({k:p[k] for k in ['type','name','call_id','input','arguments','output','status'] if k in p})
 return result
with tempfile.TemporaryDirectory(prefix='talksprout-realistic-skill-probe-') as temp:
 directory=Path(temp);subprocess.run(['git','init','-q',str(directory)],check=True);manifest=None;package_sha=None
 if args.route=='skill-web':
  source=(root/args.skill).resolve();target=directory/'.agents/skills/talksprout';target.mkdir(parents=True)
  if source.is_file():
   package_sha=hashlib.sha256(source.read_bytes()).hexdigest()
   with zipfile.ZipFile(source) as archive:
    manifest=archive.read('talksprout/SKILL.md').decode();(target/'SKILL.md').write_text(manifest)
  else:manifest=(source/'SKILL.md').read_text();(target/'SKILL.md').write_text(manifest)
 host='This is a controlled host-capability probe for the learner-requested TalkSprout integration. Use only TalkSprout public GitHub learning documents or its configured MCP. Do not use unrelated services, edit files or read local learning content.'
 host += ' For this controlled route, use only configured TalkSprout MCP tools, never public web or GitHub reader services.' if args.route=='mcp' else ' For this controlled route, use only public TalkSprout GitHub documents through available readers; never use TalkSprout MCP tools.'
 if args.allow_skill_reader:host+=' Read-only shell is enabled solely to read the installed .agents/skills/talksprout/SKILL.md instructions if needed; no other local reads or shell/network fetching is allowed. After loading the Skill, use the genuine built-in web tool for its public learning documents.'
 else:host+=' Do not use shell commands.'
 common=['--ignore-user-config','--ignore-rules','--skip-git-repo-check','-m','gpt-6.1-sol','--json','-c','developer_instructions='+json.dumps(host),'-c','web_search='+json.dumps('live' if args.route=='skill-web' else 'disabled')]
 if not args.allow_skill_reader:common+=['--disable','shell_tool']
 if args.route=='mcp':common+=['-c','mcp_servers.talksprout.url='+json.dumps(endpoint)]
 record={'method':'codex-cli-host-capability-probe','schemaVersion':1,'route':args.route,'invocation':'explicit' if args.explicit else 'implicit-natural','shellProfile':'installed-Skill-read-only' if args.allow_skill_reader else 'disabled','hostPolicy':host,'skillManifest':manifest,'skillSha256':digest(manifest) if manifest else None,'packageSha256':package_sha,'source':args.skill if args.route=='skill-web' else endpoint,'turns':[]};thread=None;offset=0
 for index,text in enumerate([args.intent,*args.follow_up]):
  if text=='@menu:source-skills':
   import re
   previous=record['turns'][-1]['reply'];matches=[number for number,line in re.findall(r'^\s*\**(\d+)[.、)]\s*([^\n]*)',previous,re.M) if all(word in line for word in ['听力','阅读','写作'])]
   if len(matches)!=1:raise ValueError('Cannot uniquely choose source-skills goal from actual numbered menu')
   text=matches[0]
  prompt=('$talksprout\n' if args.explicit and args.route=='skill-web' and index==0 else '')+text;reply=out/f'turn-{index+1}.txt'
  command=['codex','exec']+(['resume',thread] if thread else ['--strict-config','--sandbox','read-only'])+common+['--output-last-message',str(reply),'-'];start=datetime.datetime.now(datetime.timezone.utc).isoformat();begin=time.monotonic()
  result=subprocess.run(command,input=prompt,text=True,cwd=directory,env=env,capture_output=True,timeout=180)
  events=[json.loads(l) for l in result.stdout.splitlines() if l.startswith('{')];ids=[e['thread_id'] for e in events if e.get('type')=='thread.started'];thread=thread or (ids[0] if ids else None)
  trace=native(thread) if thread else [];record['turns'].append({'request':prompt,'requestSha256':digest(prompt),'command':command,'startedAt':start,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-begin,3),'exitCode':result.returncode,'events':events,'threadId':thread,'nativeTrace':trace[offset:],'reply':reply.read_text() if reply.exists() else '','stderr':result.stderr});offset=len(trace)
  (out/'probe.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n');print('PROBE TURN',index+1,'exit',result.returncode,record['turns'][-1]['reply'][:250].replace('\n',' '),flush=True)
 print('PROBE',out/'probe.json',flush=True)
