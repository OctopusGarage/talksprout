"""Fault-injected publication orchestration. No network or deployment occurs."""
import hashlib
import importlib.util
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
spec = importlib.util.spec_from_file_location('publish_ai', Path(__file__).with_name('publish-ai.py'))
publish_ai = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = publish_ai
spec.loader.exec_module(publish_ai)


class PublishFlowTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        previous = Path.cwd()
        os.chdir(self.directory.name)
        self.addCleanup(os.chdir, previous)
        self.sha = 'a' * 40
        self.tag = None
        self.visibility_misses = 0
        self.after_create_misses = 0
        self.release = None
        self.remote = {}
        self.calls = []
        self.fail_upload = False
        self.conflicting_tag = False
        folder = Path('public/downloads')
        folder.mkdir(parents=True)
        Path('distribution').mkdir()
        names = {'skill': 'skill.zip', 'plugin': 'plugin.zip', 'claudePlugin': 'claude.zip', 'fullSkill': 'full.zip', 'fullSkillText': 'full.md'}
        config = dict(repository='https://github.com/Example/project', version='1.0.0', packages=names)
        identity = dict(name='example', version='1.0.0', fingerprint='fixture')
        Path('distribution/config.json').write_text(json.dumps(config))
        Path('distribution/identity.json').write_text(json.dumps(identity))
        Path('distribution/release-notes.md').write_text('Fixture release')
        assets = {}
        for name in names.values():
            data = ('fixture:' + name).encode()
            (folder / name).write_bytes(data)
            assets[name] = dict(sha256=hashlib.sha256(data).hexdigest(), bytes=len(data))
        manifest = dict(identity, sourceRevision=self.sha, assets=assets, mcpEndpoint=None)
        (folder / 'release-manifest.json').write_text(json.dumps(manifest))
        (folder / 'SHA256SUMS').write_text(''.join(hashlib.sha256((folder / name).read_bytes()).hexdigest() + '  ' + name + '\n' for name in [*names.values(), 'release-manifest.json']))

    def error(self, command, message):
        raise subprocess.CalledProcessError(1, command, stderr=message)

    def cli(self, command, **kwargs):
        self.calls.append(command)
        if command == ['git', 'rev-parse', 'HEAD']:
            return self.sha
        self.assertEqual(command[0], 'gh')
        args = command[1:]
        if args[0] == 'api':
            if '--method' in args:
                self.tag = 'b' * 40 if self.conflicting_tag else self.sha
                self.visibility_misses = self.after_create_misses
                if self.conflicting_tag:
                    self.error(command, 'HTTP 422: Reference already exists')
                return json.dumps(dict(object=dict(type='commit', sha=self.tag)))
            if '/git/ref/tags/' in args[1]:
                if self.tag is None or self.visibility_misses:
                    self.visibility_misses = max(0, self.visibility_misses - 1)
                    self.error(command, 'HTTP 404: Not Found')
                return json.dumps(dict(object=dict(type='commit', sha=self.tag)))
            if '/releases/tags/' in args[1]:
                if self.release is None:
                    self.error(command, 'HTTP 404: Not Found')
                return json.dumps(dict(self.release, assets=[dict(name=name) for name in self.remote]))
        if args[:2] == ['release', 'create']:
            self.release = dict(draft=True, target_commitish=self.sha)
            return ''
        if args[:2] == ['release', 'upload']:
            for item in args[3:args.index('--clobber')]:
                file = Path(item)
                self.remote[file.name] = file.read_bytes()
                if self.fail_upload:
                    self.fail_upload = False
                    self.error(command, 'HTTP 502: Upload interrupted')
            return ''
        if args[:2] == ['release', 'edit']:
            self.release['draft'] = False
            return ''
        if args[:2] == ['release', 'download']:
            folder = Path(args[args.index('--dir') + 1])
            for i, item in enumerate(args):
                if item == '--pattern':
                    name = args[i + 1]
                    (folder / name).write_bytes(self.remote[name])
            return ''
        self.fail('Unexpected CLI call: ' + str(command))

    def run_publish(self):
        with patch('publish_ai.subprocess.check_output', side_effect=self.cli), patch('publish_ai.sys.argv', ['publish-ai.py', 'publish']), patch('publish_ai.time.sleep') as pause, patch('sys.stdout', new_callable=io.StringIO):
            publish_ai.main()
            return pause

    def count(self, prefix):
        return sum(call[:len(prefix)] == prefix for call in self.calls)

    def test_successful_creation_tolerates_delayed_tag_visibility(self):
        self.after_create_misses = 2
        pause = self.run_publish()
        self.assertEqual(pause.call_count, 2)
        self.assertFalse(self.release['draft'])
        self.assertEqual(len(self.remote), 7)
        self.assertEqual(self.count(['gh', 'api', '--method', 'POST']), 1)

    def test_partial_upload_resumes_then_published_retry_verifies_without_upload(self):
        self.fail_upload = True
        with self.assertRaises(subprocess.CalledProcessError):
            self.run_publish()
        self.assertTrue(self.release['draft'])
        self.assertEqual(len(self.remote), 1)
        self.run_publish()
        self.assertFalse(self.release['draft'])
        uploads = self.count(['gh', 'release', 'upload'])
        self.run_publish()
        self.assertEqual(self.count(['gh', 'release', 'upload']), uploads)
        self.assertEqual(self.count(['gh', 'release', 'create']), 1)

    def test_conflicting_tag_fails_without_uploading_or_replacing_it(self):
        self.conflicting_tag = True
        with self.assertRaises(ValueError):
            self.run_publish()
        self.assertEqual(self.tag, 'b' * 40)
        self.assertEqual(self.count(['gh', 'release', 'create']), 0)
        self.assertEqual(self.count(['gh', 'release', 'upload']), 0)

    def test_visibility_timeout_is_bounded_and_does_not_publish(self):
        self.after_create_misses = 100
        with self.assertRaisesRegex(SystemExit, 'not visible after bounded verification'):
            self.run_publish()
        self.assertIsNone(self.release)
        self.assertEqual(self.count(['gh', 'api', '--method', 'POST']), 1)


if __name__ == '__main__':
    unittest.main()
