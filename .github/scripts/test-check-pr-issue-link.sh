#!/usr/bin/env bash
# Tests for check-pr-issue-link.sh. Run: bash .github/scripts/test-check-pr-issue-link.sh
set -uo pipefail
script="$(cd "$(dirname "$0")" && pwd)/check-pr-issue-link.sh"
fails=0

# run <name> <expected-exit> <body> <head-ref> [author-type]
run() {
  local name="$1" want="$2" body="$3" ref="$4" type="${5:-User}" out got
  out=$(PR_BODY="$body" HEAD_REF="$ref" PR_AUTHOR_TYPE="$type" FAKE_ISSUES="17:open 5:closed 9:open 20:pr" bash "$script" 2>&1)
  got=$?
  if [ "$got" -eq "$want" ]; then echo "PASS  $name"; else
    echo "FAIL  $name (exit $got, wanted $want)"; echo "$out" | sed 's/^/      /'; fails=$((fails+1)); fi
}

run "pass: Closes #17 on matching branch"        0 $'## Issue\nCloses #17\n'            chore/17-pr-issue-check
run "pass: lowercase fixes"                      0 'fixes #17'                          fix/17-x
run "pass: Resolves with colon + Part of line"   0 $'Resolves: #17\nPart of #3'         docs/17-x
run "pass: template hint comment ignored"        0 $'Closes #17\n<!-- e.g. Closes #9 -->' feat/17-x
run "fail: no Closes (template placeholder)"     1 $'## Issue\nCloses #\n'               chore/17-x
run "fail: only Part of"                         1 'Part of #3'                         chore/17-x
run "fail: two Closes"                           1 $'Closes #17\nFixes #9'              chore/17-x
run "fail: branch number mismatch"               1 'Closes #17'                         chore/9-x
run "fail: bad branch prefix"                    1 'Closes #17'                         wip/17-x
run "fail: branch without number"                1 'Closes #17'                         chore/pr-issue-check
run "fail: Issue closed"                         1 'Closes #5'                          chore/5-x
run "fail: Issue does not exist"                 1 'Closes #999'                        chore/999-x
run "fail: number is a pull request"             1 'Closes #20'                         chore/20-x
run "skip: bot author with no Issue"             0 'bump deps'                          dependabot/npm_and_yarn/x Bot

[ "$fails" -eq 0 ] && echo "All tests passed." || { echo "$fails test(s) failed."; exit 1; }
