# 0085. Shorter review format

Status: proposed by phittayanan in [Issue #170](https://github.com/phittayanan/habit-tracker/issues/170#issuecomment-7217661026) on 2026-11-27; projectnewy [agreed to rules 1, 2 and 4, changed rule 3 and added rule 5](https://github.com/phittayanan/habit-tracker/issues/170#issuecomment-7218681521) the same day; phittayanan accepted both changes. Supersedes the "What I checked" part of ADR 0055 point 3. The labels in ADR 0055 point 3 stay.

## Decision

A review keeps the ADR 0055 order: "What I checked", then "Findings". These rules apply:

1. "What I checked" has at most 5 items. Keep the checks the reviewer made and the checks that found something. Routine checks (CI green, commit IDs match) go together on one line.
2. "AI-assisted" is written once, in the first line of the review, not on every item.
3. The review states the reviewed commit once. A check may name its file. Line numbers appear only in findings.
4. The labels (`issue (blocking)`, `issue`, `suggestion`, `question`), their meanings and the review decision stay as in ADR 0055 point 3.
5. One "Not checked / not run" line says what the reviewer did not check or run. It does not count toward the 5 items.

## Why

The nine reviews in the Lab 7 report (PDF pages 32 to 42) are 175 to 516 words each, with long check lists, and the findings get lost in them.

## Not changed

Who reviews and merges, the labels, the card moves and the review routing in ADR 0055.
