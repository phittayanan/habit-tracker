#!/usr/bin/env bash
# Writes the generated inputs of the Lab 7 PDF (Issue #166): records.md (Issue, review and comment texts as
# posted on GitHub) and three diffs read from git (sheet 4.1: readable review text and the code diff in the PDF).
# It reads public data with `gh` and the local git history and changes nothing. GitHub times are UTC.
#   bash fetch-records.sh
set -euo pipefail
cd "$(dirname "$0")"
OURS=phittayanan/habit-tracker
TOP=$(git rev-parse --show-toplevel)
fence() { echo; echo '````text'; tr -d '\r'; echo; echo '````'; }
# C-143-3 (merge-conflict steps) and RQ-142 (the request for answers) are left out: not assessed (PR #169).
# Each record is pinned to the ID that was checked, so a later review or comment cannot replace it.
review() { # PR number, review ID
  gh api "repos/$OURS/pulls/$1/reviews/$2" --jq '"\(.user.login)|\(.submitted_at)|\(.state)|\(.commit_id[0:7])|\(.html_url)"' |
    { IFS='|' read -r who when state sha url; printf '\n### R-%s-%s Review of PR %s by %s, %s, %s, head %s\n\nSource: <%s>\n' "$1" "$2" "$1" "$who" "$when" "$state" "$sha" "$url"; }
  gh api "repos/$OURS/pulls/$1/reviews/$2" --jq .body | fence
}
comment() { # record ID, Issue or PR number, comment id
  gh api "repos/$OURS/issues/comments/$3" --jq '"\(.user.login)|\(.created_at)|\(.html_url)"' |
    { IFS='|' read -r who when url; printf '\n### %s Comment by %s on #%s, %s\n\nSource: <%s>\n' "$1" "$who" "$2" "$when" "$url"; }
  gh api "repos/$OURS/issues/comments/$3" --jq .body | fence
}
issue() { # record ID, Issue number: the body as filed
  gh api "repos/$OURS/issues/$2" --jq '"\(.user.login)|\(.created_at)|\(.html_url)|\(.title)"' |
    { IFS='|' read -r who when url title; printf '\n### %s Issue #%s by %s, filed %s: %s\n\nSource: <%s>\n' "$1" "$2" "$who" "$when" "$title" "$url"; }
  gh api "repos/$OURS/issues/$2" --jq .body | fence
}
{
  echo '## The approved change request'
  issue 'CR-139' 139
  echo; echo '## Review of the revised contract, before any test or code (PR 143)'
  review 143 6079956119; review 143 6083813777
  comment 'C-143-1' 143 7202728642; comment 'C-143-2' 143 7203404404
  comment 'C-143-4' 143 7210368492; comment 'C-143-5' 143 7210662024
  echo; echo '## Review of the tests and code (PR 146)'
  review 146 6084399396; comment 'C-146-1' 146 7211667897; review 146 6084528918
  echo; echo '## Review of the sync and release (PR 149, PR 147) and the release evidence (PR 162)'
  review 149 6084603999; review 147 6084904251; review 162 6086487403
  echo; echo '## Review of the metrics and readiness (PR 163)'
  review 163 6086779392; review 163 6086886889
  echo; echo '## Retrospective answers as posted (Issue 142)'
  comment 'RA-142' 142 7215873068
} > records.md
# Old and new contract text: the accepted Sprint 1 release against the merged revised contract (PR 143).
git -C "$TOP" diff --no-color --unified=1 v1.4 c4ba749 -- docs/srs.md docs/system-sds.md docs/features.md docs/adr/0008-one-entry-per-day.md \
  docs/sprints/sprint-1/README.md docs/sprints/sprint-1/F-08-entry.md docs/sprints/sprint-1/F-09-progress.md > spec-diff.txt
# The new and revised tests (RED commit) and the implementation (GREEN commit), without the test files.
git -C "$TOP" show --no-color --format='commit %H%nDate: %ad%n%n    %s%n' --date=iso 761d87e > test-diff.txt
git -C "$TOP" diff --no-color c4ba749 bbf12a2 -- server/src server/prisma client/src > code-diff.txt
# Short excerpts of the saved test output for Part B; the full files are printed in the Appendix.
EV=../evidence
{ sed -n '1,3p' $EV/red-server.txt; echo '...'; grep -E '^✖ ' $EV/red-server.txt | awk '!seen[$0]++'; echo '...'; grep -E '^ℹ ' $EV/red-server.txt
  echo; echo '... one failure in full (TC-82, API):'; sed -n '246,258p' $EV/red-server.txt; } > red-server-excerpt.txt
{ sed -n '1,3p' $EV/red-client.txt; echo '...'; grep -E '✘' $EV/red-client.txt; echo '...'; sed -n '60,75p' $EV/red-client.txt; echo '...'; grep -E '^  [0-9]+ (failed|passed)' $EV/red-client.txt; } > red-client-excerpt.txt
{ sed -n '1,3p' $EV/green-server.txt; echo '...'; grep -E '^✔ (TC-(29|61|8[2-9]|90)|Entry list)' $EV/green-server.txt; echo '...'; grep -E '^ℹ ' $EV/green-server.txt; } > green-server-excerpt.txt
{ sed -n '1,3p' $EV/green-client.txt; echo '...'; grep -E '✓.*TC-(61|86|88)' $EV/green-client.txt; echo '...'; grep -E '^  [0-9]+ (failed|passed|skipped)' $EV/green-client.txt; } > green-client-excerpt.txt
echo "records.md: $(wc -l < records.md) lines; spec-diff.txt: $(wc -l < spec-diff.txt); test-diff.txt: $(wc -l < test-diff.txt); code-diff.txt: $(wc -l < code-diff.txt)"
