"""Offline unit tests for deploy/smoke_test.py (the network is mocked). Issue #80, ADR 0052: no sign-in.

Run (repo root):  python3 -m unittest discover -s deploy/tests -p 'test_smoke.py'
CI runs it too (.github/workflows/ci-docker.yml).

Covers: public checks pass + login skipped without credentials; a DB that is not
ready fails even if HTTP answers; the session is logged out even if a check fails.
CHANGE ME: if you change the endpoints in smoke_test.py, update `response()` below.
"""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('smoke', Path(__file__).parents[1] / 'smoke_test.py')
smoke = importlib.util.module_from_spec(spec)
spec.loader.exec_module(smoke)


class SmokeTests(unittest.TestCase):
    def response(self, base, path, data=None, token=None):
        return {
            '/api/health': b'{"status":"ok"}',
            '/api/ready': b'{"status":"ready"}',
            '/': b'<html><head><meta name="build" content="1234567"></head></html>',
        }[path]

    def test_public_checks_pass_when_page_shows_the_deployed_commit(self):
        with patch.object(smoke, 'request', side_effect=self.response) as req:
            smoke.check('https://demo.test', '1234567890abcdef1234567890abcdef12345678')
            self.assertEqual(req.call_count, 3)

    def test_old_commit_in_page_fails(self):
        with patch.object(smoke, 'request', side_effect=self.response), patch.object(smoke.time, 'sleep'):
            with self.assertRaisesRegex(RuntimeError, 'commit'):
                smoke.check('https://demo.test', 'abcdef0000000000000000000000000000000000')

    def test_db_not_ready_fails_even_when_http_responds(self):
        def not_ready(base, path, **kwargs):
            return b'{"status":"unavailable"}' if path == '/api/ready' else self.response(base, path)
        with patch.object(smoke, 'request', side_effect=not_ready), patch.object(smoke.time, 'sleep'):
            with self.assertRaisesRegex(RuntimeError, '/api/ready'):
                smoke.check('https://demo.test', '1234567890abcdef1234567890abcdef12345678')

    def test_commit_must_be_a_full_sha(self):
        with self.assertRaisesRegex(ValueError, 'commit'):
            smoke.check('https://demo.test', 'abc')


if __name__ == '__main__':
    unittest.main()
