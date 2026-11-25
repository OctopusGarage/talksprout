from pathlib import Path
from zipfile import ZipFile
import hashlib, json
root=Path(__file__).resolve().parents[1]
config=json.loads((root/'distribution/config.json').read_text())
checks=[]
for kind,name in config['packages'].items():
 path=root/'public/downloads'/name
 with ZipFile(path) as z:
  names=z.namelist()
  prefix='talksprout/' if kind=='skill' else 'skills/talksprout/'
  assert prefix+'SKILL.md' in names
  assert prefix+'references/release.md' in names
  assert all(not n.startswith('/') and '..' not in n.split('/') for n in names)
  assert len(names)==len(set(names))
  if kind!='skill':
   manifest='.claude-plugin/plugin.json' if kind=='claudePlugin' else 'plugin.json'
   assert json.loads(z.read(manifest))['version']==config['version']
  assert not any(n.endswith(('.py','.ts','.env')) for n in names)
 checks.append(hashlib.sha256(path.read_bytes()).hexdigest()+'  '+name)
identity=json.loads((root/'distribution/identity.json').read_text())
import os
manifest=dict(schemaVersion=1,**identity,sourceRevision=os.environ.get('AI_SOURCE_REVISION') or os.environ.get('GITHUB_SHA','local'),mcpEndpoint=config['mcpEndpoint'],assets={name:dict(sha256=hashlib.sha256((root/'public/downloads'/name).read_bytes()).hexdigest(),bytes=(root/'public/downloads'/name).stat().st_size) for name in config['packages'].values()})
manifest_path=root/'public/downloads/release-manifest.json'
manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
checks.append(hashlib.sha256(manifest_path.read_bytes()).hexdigest()+'  release-manifest.json')
(root/'public/downloads/SHA256SUMS').write_text('\n'.join(checks)+'\n')
print('Validated all three archives and wrote SHA256SUMS')
