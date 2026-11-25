import unittest
import tempfile
import hashlib
from pathlib import Path
from release_policy import release_decision, verify_assets, verify_checksums, assert_tag_revision
class ReleaseTests(unittest.TestCase):
    def test_retries_and_changed_versions(self):
        current=dict(name='talksprout',version='0.1.0',fingerprint='abc',mcpEndpoint=None)
        self.assertEqual(release_decision(current,None),'create')
        self.assertEqual(release_decision(current,current),'skip')
        self.assertEqual(release_decision(current,current,True),'resume')
        with self.assertRaises(ValueError): release_decision(current,dict(current,fingerprint='changed'))
    def test_published_revision_and_asset_bytes_are_immutable(self):
        current=dict(name='talksprout',version='0.1.0',fingerprint='abc',mcpEndpoint=None,sourceRevision='a'*40,assets={'skill.zip':{'sha256':'abc','bytes':7}})
        for changed in [dict(current,sourceRevision='b'*40),dict(current,assets={'skill.zip':{'sha256':'changed','bytes':7}}),dict(current,assets={'skill.zip':{'sha256':'abc','bytes':8}})]:
            with self.assertRaises(ValueError): release_decision(current,changed)
    def test_integrity_and_traversal(self):
        with tempfile.TemporaryDirectory() as directory:
            Path(directory,'skill.zip').write_bytes(b'package')
            manifest={'assets':{'skill.zip':{'sha256':hashlib.sha256(b'package').hexdigest(),'bytes':7}}}
            verify_assets(manifest,directory)
            Path(directory,'skill.zip').write_bytes(b'tampered')
            with self.assertRaises(ValueError): verify_assets(manifest,directory)
            with self.assertRaises(ValueError): verify_assets({'assets':{'../secret':{}}},directory)
    def test_remote_checksums_detect_missing_changed_and_duplicate_assets(self):
        with tempfile.TemporaryDirectory() as directory:
            folder=Path(directory)
            (folder/'skill.zip').write_bytes(b'package')
            digest=hashlib.sha256(b'package').hexdigest()
            (folder/'SHA256SUMS').write_text(digest+'  skill.zip\n')
            verify_checksums(folder,['skill.zip'])
            with self.assertRaises(ValueError): verify_checksums(folder,['skill.zip','release-manifest.json'])
            (folder/'skill.zip').write_bytes(b'changed')
            with self.assertRaises(ValueError): verify_checksums(folder,['skill.zip'])
            (folder/'SHA256SUMS').write_text((digest+'  skill.zip\n')*2)
            with self.assertRaises(ValueError): verify_checksums(folder,['skill.zip'])
    def test_lightweight_and_annotated_tags_must_resolve_to_source(self):
        expected='a'*40
        assert_tag_revision(expected,{'type':'commit','sha':expected},lambda sha:None)
        assert_tag_revision(expected,{'type':'tag','sha':'b'*40},lambda sha:{'object':{'type':'commit','sha':expected}})
        with self.assertRaises(ValueError): assert_tag_revision(expected,{'type':'commit','sha':'wrong'},lambda sha:None)
        with self.assertRaises(ValueError): assert_tag_revision(expected,{'type':'tag','sha':'b'*40},lambda sha:{'object':{'type':'tag','sha':'b'*40}})
if __name__=='__main__': unittest.main()
