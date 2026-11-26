#!/usr/bin/env bash
# Writes records.md: the GitHub review and Issue texts that the Lab 6 PDF prints (sheet 4.1: include readable
# review text, not only links). It reads public data with `gh` and changes nothing. Times are GitHub UTC times.
#   bash fetch-records.sh
set -euo pipefail
cd "$(dirname "$0")"
OURS=phittayanan/habit-tracker
THEIRS=asamapornch/habit-activity-tracker
fence() { echo; echo '````text'; tr -d '\r'; echo; echo '````'; }
# Each record is pinned to the ID of the review or comment that was checked, so a later one cannot replace it.
review() { # PR number, review ID
  gh api "repos/$OURS/pulls/$1/reviews/$2" --jq '"\(.user.login)|\(.submitted_at)|\(.commit_id[0:7])|\(.html_url)"' |
    { IFS='|' read -r who when sha url; printf '\n### R-%s Review of PR %s by %s, %s, head %s\n\nSource: <%s>\n' "$1" "$1" "$who" "$when" "$sha" "$url"; }
  gh api "repos/$OURS/pulls/$1/reviews/$2" --jq .body | fence
}
comment() { # record ID, repository, comment id
  gh api "repos/$2/issues/comments/$3" --jq '"\(.user.login)|\(.created_at)|\(.html_url)"' |
    { IFS='|' read -r who when url; printf '\n### %s Comment by %s, %s\n\nSource: <%s>\n' "$1" "$who" "$when" "$url"; }
  gh api "repos/$2/issues/comments/$3" --jq .body | fence
}
finding() { # record ID, Issue number in our repository: the report as the partner filed it
  gh api "repos/$OURS/issues/$2" --jq '"\(.user.login)|\(.created_at)|\(.html_url)|\(.title)"' |
    { IFS='|' read -r who when url title; printf '\n### %s Report by %s, filed %s: %s\n\nSource: <%s>\n' "$1" "$who" "$when" "$title" "$url"; }
  gh api "repos/$OURS/issues/$2" --jq .body | fence
}
{
  echo '## Findings received about our product, as filed by the partner team'
  finding 'F-126' 126
  finding 'F-127' 127
  echo; echo '## Review texts of the fix and release pull requests'
  review 129 6060732067; review 132 6071653008; review 135 6072909741
  echo; echo '## Independent retest of our fixes (by the partner team)'
  comment 'RT-126' $OURS 7194992804
  comment 'RT-127' $OURS 7194997077
  echo; echo '## Acceptance record for our product (decided by the partner team)'
  comment 'AD-1' $OURS 7195278883
  echo; echo '## Our retest of the partner fixes (we are the UAT Team)'
  comment 'RT-61' $THEIRS 7191150762
  comment 'RT-60' $THEIRS 7191242616
  echo; echo "## Acceptance record for the partner's product (decided by our team)"
  comment 'AD-2' $THEIRS 7195894403
  comment 'AD-3' $THEIRS 7196006157
} > records.md
echo "records.md: $(wc -l < records.md) lines"
