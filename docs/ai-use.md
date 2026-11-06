# AI Use Declaration

## Tools Used
- Claude Code (Claude Sonnet 5.5), run as a worker agent for the team.

## What the AI Did
- Issue #12: read the course handouts and the Lab 5 starter kit, and wrote `docs/assignment.md` (dates, per-handout requirements, limits on design and stack, design questions, open points).
- Issue #17: wrote the `pr-issue-link` GitHub Actions check (`.github/workflows/pr-issue-link.yml`), its parsing script and a test script.
- Issue #3: wrote `docs/design-questions.md` (35 decision questions with neutral options, from `docs/assignment.md` sections 10 and 11) and the `/design-interview` skill. The AI answered no question.
- Issue #19: wrote ADRs 0002 to 0049 in `docs/adr/`, one per design decision (D-01 to D-35, F-01 to F-08, G-01 to G-05), from phittayanan's answers on Issue #3. Options come from `docs/design-questions.md`. The AI added no decision and no reason of its own.
- Issue #4: wrote `docs/srs.md` (scope, actors, BR, FR, NFR, assumptions, TA questions) and the BR to FR table in `docs/traceability.md`, using only ADRs 0001 to 0049 and `docs/design-questions.md`. Where no ADR settles a point, the AI listed it as an open point (A-1 to A-10) and decided nothing. The NFR numbers are the AI's proposals, flagged for the students.
- Issue #5: wrote `docs/features.md` (17 features F-01 to F-17 with requirement links, dependencies and sprints taken from the SRS, cross-cutting NFR table, open points) and extended `docs/traceability.md` (FR to feature to planned test, NFR table, provisional test list `TC-01` to `TC-52`, coverage gaps). The feature grouping and test IDs are the AI's proposals, flagged as open points O-1 to O-3. The AI changed no SRS text and reported two SRS inconsistencies (FR-06 Retire action in Sprint 1, FR-23 retire in Sprint 1) as open points.

## What We Checked or Changed
- Issue #12: pending. The reviewer checks `docs/assignment.md` against the handouts, and both students read it before Issue #3 starts. Record what was checked or changed here.
- Issue #19: pending. The reviewer checks each ADR against phittayanan's answers on Issue #3. Record what was checked or changed here.
- Issue #17: pending. The reviewer reads the script and tests, and checks the check on the PR itself.
- Issue #4: pending. The reviewer checks that each BR, FR and NFR matches the ADR it cites, that no open point (A-1 to A-10) was settled by guesswork, and the NFR targets. Record what was checked or changed here.
- Issue #5: pending. The reviewer checks that each feature's requirement links and sprint match the SRS, that every BR, FR and NFR appears in the traceability tables, and confirms or changes the feature grouping and test IDs (O-1 to O-3). Record what was checked or changed here.

## Log
| Date | Issue | AI task | Human check |
|---|---|---|---|
| 2026-11-06 | #12 | Summarized handouts into `docs/assignment.md` | Pending review |
| 2026-11-07 | #17 | Wrote PR-to-Issue link check, script and tests | Pending review |
| 2026-11-07 | #3 | Wrote `docs/design-questions.md` and `.claude/skills/design-interview/SKILL.md` | Pending review: reviewer checks that no option is worded as a recommendation and that no section 10 question was dropped |
| 2026-11-07 | #19 | Wrote ADRs 0002 to 0049 from the agreed design answers | Pending review: reviewer compares each ADR's decision and provenance line with the answers on Issue #3 |
| 2026-11-07 | #4 | Wrote `docs/srs.md` and the BR to FR table | Pending review: reviewer compares each requirement with its cited ADR and confirms or changes the open points and NFR targets |
| 2026-11-07 | #4 | Review round 1: set NFR-07 and NFR-08 numbers, moved FR-08, FR-15 and FR-16 to Sprint 2, stated the BR-04 Sprint 1 limit, added FR-23 (403 for Participant template writes) | Pending review: partner re-checks the four points against the owner's answers |
| 2026-11-07 | #5 | Wrote `docs/features.md` and the feature, NFR and planned-test tables in `docs/traceability.md` | Pending review: reviewer compares feature links and sprints with the SRS and confirms or changes the grouping and test IDs |
