"""Offline structure checks for .github/workflows/deploy.yml (Issue #80, ADR 0052).

Run (repo root):  python3 -m unittest discover -s deploy/tests -p 'test_*.py'
Reads the file as text; it does not run the workflow and needs no GCP access.
"""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).parents[2]
WORKFLOW = ROOT / '.github' / 'workflows' / 'deploy.yml'


class DeployWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.text = WORKFLOW.read_text()

    def test_runs_on_push_to_main_and_manual_rollback_only(self):
        self.assertRegex(self.text, r'push:\s*\n\s*branches: \[main\]')
        self.assertIn('workflow_dispatch:', self.text)
        self.assertNotIn('pull_request', self.text)

    def test_reuses_the_ci_job_before_deploying(self):
        self.assertIn('uses: ./.github/workflows/ci-docker.yml', self.text)
        self.assertRegex(self.text, r'needs: test')

    def test_uses_environment_demo_and_keyless_login(self):
        self.assertRegex(self.text, r'environment: demo')
        self.assertIn('id-token: write', self.text)
        self.assertIn('google-github-actions/auth@', self.text)
        for name in ('GCP_PROJECT_ID', 'GCP_REGION', 'WIF_PROVIDER', 'WIF_SERVICE_ACCOUNT'):
            self.assertIn('vars.' + name, self.text)

    def test_names_match_the_habit_tracker_resources(self):
        self.assertNotRegex(self.text, r'(?i)toktickit')
        self.assertIn('SERVICE_NAME: habit-tracker', self.text)
        self.assertIn('MIGRATE_JOB_NAME: habit-tracker-migrate', self.text)
        self.assertIn('/habit-tracker/habit-tracker:', self.text)

    def test_commit_goes_into_the_image_and_the_smoke_test(self):
        self.assertRegex(self.text, r'--build-arg BUILD_SHA=\$IMAGE_TAG')
        self.assertRegex(self.text, r'smoke_test\.py "\$SERVICE_URL" "\$IMAGE_TAG"')

    def test_no_sign_in_secret_and_actions_are_pinned(self):
        self.assertNotRegex(self.text, r'(?i)SMOKE_PASSWORD|secrets\.')
        for line in re.findall(r'uses: (\S+@\S+)', self.text):
            self.assertRegex(line, r'@[0-9a-f]{40}$')


if __name__ == '__main__':
    unittest.main()
