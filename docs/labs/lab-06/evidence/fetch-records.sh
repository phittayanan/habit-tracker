#!/usr/bin/env bash
# Writes records.md: the GitHub review and Issue texts that the Lab 6 PDF prints (sheet 4.1: include readable
# review text, not only links). It reads public data with `gh` and changes nothing. Times are GitHub UTC times.
#   bash fetch-records.sh
set -euo pipefail
cd "$(dirname "$0")"
OURS=phittayanan/habit-tracker
THEIRS=asamapornch/habit-activity-tracker
fence() { echo; echo '````text'; tr -d '\r'; echo; echo '````'; }
review() { # PR number: the last approving review
  gh api "repos/$OURS/pulls/$1/reviews" --jq 'map(select(.state=="APPROVED")) | last | "\(.user.login)|\(.submitted_at)|\(.commit_id[0:7])|\(.html_url)"' |
    { IFS='|' read -r who when sha url; printf '\n### R-%s Review of PR %s by %s, %s, head %s\n\nSource: <%s>\n' "$1" "$1" "$who" "$when" "$sha" "$url"; }
  gh api "repos/$OURS/pulls/$1/reviews" --jq 'map(select(.state=="APPROVED")) | last | .body' | fence
}
comment() { # record ID, repository, comment id
  gh api "repos/$2/issues/comments/$3" --jq '"\(.user.login)|\(.created_at)|\(.html_url)"' |
    { IFS='|' read -r who when url; printf '\n### %s Comment by %s, %s\n\nSource: <%s>\n' "$1" "$who" "$when" "$url"; }
  gh api "repos/$2/issues/comments/$3" --jq .body | fence
}
pick() { gh api "repos/$1/issues/$2/comments" --jq "map(select(.user.login==\"$3\")) | $4 | .id"; }
{
  echo '## Review texts of the fix and release pull requests'
  review 129; review 132; review 135
  echo; echo '## Independent retest of our fixes (by the partner team)'
  comment 'RT-126' $OURS "$(pick $OURS 126 asamapornch last)"
  comment 'RT-127' $OURS "$(pick $OURS 127 asamapornch last)"
  echo; echo '## Acceptance record for our product (decided by the partner team)'
  comment 'AD-1' $OURS "$(pick $OURS 130 asamapornch last)"
  echo; echo '## Our retest of the partner fixes (we are the UAT Team)'
  comment 'RT-61' $THEIRS "$(pick $THEIRS 61 projectnewy last)"
  comment 'RT-60' $THEIRS "$(pick $THEIRS 60 projectnewy last)"
  echo; echo "## Acceptance record for the partner's product (decided by our team)"
  comment 'AD-2' $THEIRS "$(pick $THEIRS 68 phittayanan first)"
  comment 'AD-3' $THEIRS "$(pick $THEIRS 68 phittayanan last)"
} > records.md
echo "records.md: $(wc -l < records.md) lines"
