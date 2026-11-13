"""Public deployment checks for Habit Tracker (Issue #80, ADR 0052). No sign-in, no secret.

WHAT THIS SCRIPT DOES
    Called by .github/workflows/deploy.yml after a deployment:
        python3 deploy/smoke_test.py SERVICE_URL COMMIT_SHA
    It checks the live service and exits non-zero (failing the workflow) if any
    check fails. Each check is retried up to 5 times, 3 seconds apart, to
    tolerate Cloud Run cold starts.

    Checks (in order)
      1. GET /api/health  -> {"status": "ok"}
      2. GET /api/ready   -> {"status": "ready"}   (proves the database answers)
      3. GET /            -> HTML whose build tag holds the first 7 characters of
                             COMMIT_SHA (proves the new image is the one serving)

IMPORTANT
    Uses only the Python standard library (no pip install needed).
    Offline unit tests: deploy/tests/test_smoke.py
"""
import json
import re
import sys
import time
import urllib.error
import urllib.request


# --- HTTP helper --------------------------------------------------------------
# Returns the response body (bytes). Raises on HTTP errors / timeouts.
def request(base, path):
    with urllib.request.urlopen(urllib.request.Request(base + path), timeout=30) as response:
        return response.read()


def check(base, commit):
    if not re.fullmatch(r'[0-9a-f]{40}', commit or ''):
        raise ValueError('The commit must be a full 40-character SHA.')
    tag = ('name="build" content="%s"' % commit[:7]).encode()
    for path, predicate in (
        ('/api/health', lambda b: json.loads(b).get('status') == 'ok'),
        ('/api/ready', lambda b: json.loads(b).get('status') == 'ready'),
        ('/', lambda b: tag in b),
    ):
        # Retry: a cold Cloud Run instance may need a few seconds to start, and
        # a new revision may need a moment before it takes all traffic.
        for attempt in range(5):
            try:
                if not predicate(request(base, path)):
                    raise ValueError('Unexpected response')
                break
            except (urllib.error.URLError, TimeoutError, ValueError):
                if attempt == 4:
                    suffix = ' (deployed commit not shown)' if path == '/' else ''
                    raise RuntimeError('Smoke check failed: ' + path + suffix) from None
                time.sleep(3)
        print('PASS ' + path)


# --- Entry point ----------------------------------------------------------------
if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Usage: python3 deploy/smoke_test.py SERVICE_URL COMMIT_SHA')
    check(sys.argv[1].rstrip('/'), sys.argv[2])
