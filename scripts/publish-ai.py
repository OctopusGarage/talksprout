"""Verify, preflight and publish immutable packages; resume interrupted drafts."""
import json
import subprocess
import tempfile
import sys
import time
from pathlib import Path
from release_policy import release_decision, verify_assets, verify_checksums, assert_tag_revision

def require_visible_tag(check_tag, pause=None):
    """GitHub ref creation can succeed before a subsequent GET sees the ref.

    Retry only absence. A conflicting revision or API/authentication error fails
    immediately in check_tag; it must never be treated as propagation delay.
    """
    for delay in (0, 1, 2, 4):
        if delay:
            (pause or time.sleep)(delay)
        if check_tag():
            return
    raise SystemExit('Release tag is not visible after bounded verification; retry publication with the same source revision')

def main():
    operation = sys.argv[1] if len(sys.argv)>1 else 'publish'
    if operation not in ('preflight','publish'):
        raise SystemExit('Use preflight or publish')
    config=json.loads(Path('distribution/config.json').read_text())
    current=json.loads(Path('public/downloads/release-manifest.json').read_text())
    identity=json.loads(Path('distribution/identity.json').read_text())
    for key,value in identity.items():
        if current.get(key)!=value: raise SystemExit('Stale release manifest identity at '+key+'; rebuild AI packages')
    verify_assets(current,'public/downloads')
    verify_checksums('public/downloads', [*config['packages'].values(), 'release-manifest.json'])
    if set(current['assets']) != set(config['packages'].values()):
        raise SystemExit('Release assets differ from configured packages')
    repository=config['repository'].removeprefix('https://github.com/')
    tag='v'+config['version']
    def gh(*args): return subprocess.check_output(['gh',*args],text=True,stderr=subprocess.PIPE)
    def check_tag():
        try:
            reference=json.loads(gh('api',f'repos/{repository}/git/ref/tags/{tag}'))['object']
        except subprocess.CalledProcessError as error:
            if 'HTTP 404' in error.stderr: return False
            raise
        assert_tag_revision(current['sourceRevision'],reference,lambda sha:json.loads(gh('api',f'repos/{repository}/git/tags/{sha}')))
        return True
    tag_exists=check_tag()
    try:
        release=json.loads(gh('api',f'repos/{repository}/releases/tags/{tag}'))
    except subprocess.CalledProcessError as error:
        if 'HTTP 404' not in error.stderr: raise
        release=None
    if release and not release['draft'] and not tag_exists:
        require_visible_tag(check_tag)
    with tempfile.TemporaryDirectory() as directory:
        previous=None
        if release:
            if any(a['name']=='release-manifest.json' for a in release['assets']):
                gh('release','download',tag,'--repo',repository,'--pattern','release-manifest.json','--dir',directory)
                previous=json.loads((Path(directory)/'release-manifest.json').read_text())
            elif release['draft'] and release['target_commitish']==current['sourceRevision']:
                previous=current
            else:
                raise SystemExit('Existing release has no verifiable manifest; choose a new AI version')
        decision=release_decision(current,previous,bool(release and release['draft']))
        print(f'{tag}: {decision}')
        if decision=='skip':
            # Never treat a manifest alone as proof that a published release is intact.
            names=[*config['packages'].values(),'SHA256SUMS','release-manifest.json']
            if not set(names).issubset({asset['name'] for asset in release['assets']}):
                raise SystemExit('Published release is missing required assets')
            patterns=[argument for name in names for argument in ['--pattern',name]]
            gh('release','download',tag,'--repo',repository,'--dir',directory,'--clobber',*patterns)
            verify_assets(previous,directory)
            verify_checksums(directory,[*config['packages'].values(),'release-manifest.json'])
            require_visible_tag(check_tag)
            return
        if operation=='preflight': return
        revision=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
        if current['sourceRevision']!=revision: raise SystemExit('Release source revision differs from checkout')
        assets=[str(Path('public/downloads')/name) for name in config['packages'].values()]+['public/downloads/SHA256SUMS','public/downloads/release-manifest.json']
        if not check_tag():
            try:
                gh('api','--method','POST',f'repos/{repository}/git/refs','-f','ref=refs/tags/'+tag,'-f','sha='+revision)
            except subprocess.CalledProcessError as error:
                if 'HTTP 422' not in error.stderr: raise
            require_visible_tag(check_tag)
        if decision=='create':
            gh('release','create',tag,'--draft','--repo',repository,'--target',revision,'--title','TalkSprout '+config['version'],'--notes-file','distribution/release-notes.md')
        gh('release','upload',tag,*assets,'--clobber','--repo',repository)
        require_visible_tag(check_tag)
        gh('release','edit',tag,'--draft=false','--repo',repository)
if __name__=='__main__': main()
