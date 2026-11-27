# Appendix: records, contract text and test changes

## X.1 Records as posted on GitHub

Copied from GitHub by `fetch-records.sh`, unchanged. Times in this section are **UTC** (Asia/Bangkok is UTC+7). A review or comment that says it was AI-assisted was approved or decided by the student named.

{{include:records.md}}

## X.2 Contract text, old and new

`git diff --unified=1 v1.4 c4ba749` on the revised specification files (one unchanged line around each change). `-` is the text of the accepted Sprint 1 release, `+` the revised contract that was reviewed and merged before the tests and code.

{{text:spec-diff.txt}}

## X.3 The new and revised tests (RED commit)

`git show 761d87e`: the test changes that were run against the pre-change code (Part B, B.2).

{{text:test-diff.txt}}
