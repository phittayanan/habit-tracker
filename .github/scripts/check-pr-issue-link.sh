#!/usr/bin/env bash
# Enforce "One Issue -> one branch -> one PR" (CLAUDE.md, Issue #17).
#
# Inputs (environment, never interpolated into the script text):
#   PR_BODY         pull request body
#   HEAD_REF        pull request head branch name
#   PR_AUTHOR_TYPE  pull request author type ("User", "Bot", ...)
#   REPO            owner/name (used with `gh api` and GH_TOKEN)
#   FAKE_ISSUES     tests only: space-separated "N:state" pairs (e.g. "17:open 5:closed")
#                   used instead of the GitHub API; state "pr" means N is a pull request.
# Exit 0 = pass or skipped, 1 = fail (every problem is listed).
set -uo pipefail

PR_BODY="${PR_BODY:-}"
HEAD_REF="${HEAD_REF:-}"
PR_AUTHOR_TYPE="${PR_AUTHOR_TYPE:-}"

if [ "$PR_AUTHOR_TYPE" = "Bot" ]; then
  echo "Skipped: PR author is a bot."
  exit 0
fi

errors=()
fail() { errors+=("$1"); }

# Returns "open", "closed", "pr" or "missing" for Issue number $1.
issue_state() {
  local n="$1" pair
  if [ -n "${FAKE_ISSUES+x}" ]; then
    for pair in $FAKE_ISSUES; do
      if [ "${pair%%:*}" = "$n" ]; then echo "${pair#*:}"; return; fi
    done
    echo missing; return
  fi
  local json
  if ! json=$(gh api "repos/${REPO}/issues/${n}" 2>/dev/null); then
    echo missing; return
  fi
  if [ "$(jq -r 'has("pull_request")' <<<"$json")" = "true" ]; then echo pr; return; fi
  jq -r '.state' <<<"$json"
}

# --- Closing keywords in the PR body -------------------------------------
# Drop CRLF and HTML comments (the PR template hint contains examples).
body=$(printf '%s' "$PR_BODY" | tr -d '\r' | perl -0pe 's/<!--.*?-->//gs')
closed=$(printf '%s\n' "$body" \
  | grep -oiE '(^|[^[:alnum:]_])(close[sd]?|fix(e[sd])?|resolve[sd]?):?[[:space:]]+#[0-9]+' \
  | grep -oE '[0-9]+$' | sort -un)
count=$(printf '%s' "$closed" | grep -c . || true)

issue=""
if [ "$count" -eq 0 ]; then
  fail "The PR body does not close an Issue. Add a line such as 'Closes #<N>' (or Fixes/Resolves) under '## Issue' in the PR description. 'Part of #<M>' lines are allowed but do not count."
elif [ "$count" -gt 1 ]; then
  fail "The PR body closes $count Issues ($(printf '%s' "$closed" | sed 's/^/#/' | paste -sd, - | sed 's/,/, /g')). One PR must close exactly one Issue: keep a single 'Closes #<N>' and use 'Part of #<M>' for the others."
else
  issue="$closed"
  case "$(issue_state "$issue")" in
    open) ;;
    closed) fail "Issue #$issue is already closed. Point 'Closes #<N>' at this PR's own open Issue, or reopen/create the Issue first." ;;
    pr) fail "#$issue is a pull request, not an Issue. Point 'Closes #<N>' at this PR's own Issue." ;;
    *) fail "Issue #$issue does not exist in this repository. Create the Issue first (no Issue, no work) and point 'Closes #<N>' at it." ;;
  esac
fi

# --- Branch name -----------------------------------------------------------
if [[ "$HEAD_REF" =~ ^(feat|fix|docs|chore|test|refactor)/([0-9]+)-[A-Za-z0-9._-]+$ ]]; then
  branch_n="${BASH_REMATCH[2]}"
  if [ -n "$issue" ] && [ "$branch_n" != "$issue" ]; then
    fail "Branch '$HEAD_REF' names Issue #$branch_n but the PR body closes #$issue. Rename the branch to '<type>/$issue-<slug>' or fix 'Closes #<N>' so both use the same number."
  fi
else
  fail "Branch '$HEAD_REF' must be named '<type>/<issue-number>-<slug>' with type feat, fix, docs, chore, test or refactor (e.g. 'chore/17-pr-issue-check'). Rename the branch and open a new PR from it."
fi

if [ "${#errors[@]}" -gt 0 ]; then
  for e in "${errors[@]}"; do
    echo "::error title=PR must link its own Issue::$e"
    echo "FAIL: $e"
  done
  exit 1
fi

echo "OK: PR closes Issue #$issue (open) and branch '$HEAD_REF' matches."
