"""Pure release decisions and exact artifact integrity checks."""
import hashlib
from pathlib import Path

def release_decision(current, previous, draft=False):
    if previous is None:
        return 'create'
    for key in ('name', 'version', 'fingerprint', 'mcpEndpoint', 'sourceRevision', 'assets'):
        if current.get(key) != previous.get(key):
            raise ValueError('Published AI inputs changed at '+key+'; bump the AI version')
    return 'resume' if draft else 'skip'

def verify_assets(manifest, directory):
    directory = Path(directory)
    for name, expected in manifest['assets'].items():
        if Path(name).name != name:
            raise ValueError('Invalid asset path')
        data = (directory/name).read_bytes()
        if hashlib.sha256(data).hexdigest() != expected['sha256'] or len(data) != expected['bytes']:
            raise ValueError('Artifact checksum mismatch: '+name)


def verify_checksums(directory, names):
    directory=Path(directory)
    rows={}
    for line in (directory/'SHA256SUMS').read_text().splitlines():
        digest, name=line.split('  ',1)
        if name in rows or Path(name).name!=name:
            raise ValueError('Invalid or duplicate checksum entry')
        rows[name]=digest
    if set(rows)!=set(names):
        raise ValueError('Missing or unexpected checksum entries')
    for name, digest in rows.items():
        if hashlib.sha256((directory/name).read_bytes()).hexdigest()!=digest:
            raise ValueError('Checksum file mismatch: '+name)


def assert_tag_revision(expected, reference, read_tag):
    """Resolve lightweight/annotated tags and reject mismatches or cycles."""
    seen=set()
    while reference.get('type')=='tag':
        sha=reference.get('sha')
        if not sha or sha in seen or len(seen)>=16:
            raise ValueError('Invalid annotated tag chain')
        seen.add(sha)
        reference=read_tag(sha)['object']
    if reference.get('type')!='commit' or reference.get('sha')!=expected:
        raise ValueError('Release tag does not resolve to the expected source revision')
