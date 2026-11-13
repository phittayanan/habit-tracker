<!-- Deliverable 1 rewrite, Part D (Issue #11). New text; sprint split from tag v1.0 (64831f7) docs and ADR 0020, ADR 0021; Sprint 1 outcome checked against the v1.0 release. Per-feature requirements and dependencies live in Part B.1; this Part works at sprint level. -->

# Part D. Three-sprint plan {#part-d}

This Part splits the 17 features of Part B across the three course sprints. For each sprint it gives the goal, the features, what the sprint depends on, and the outcome that marks it complete. Each feature's requirements and its own dependencies are in Part B.1.

## D.1 The three sprints {#d-1}

| | Sprint 1 | Sprint 2 | Sprint 3 |
|---|---|---|---|
| **Checkpoint** | Deliverable 1. Handout date 8 Nov 2026; LEB2 due date 15 Nov 2026 23:59 (read 2026-11-13) | Deliverable 2, 29 Nov 2026 (handout) | Final delivery, 13 Dec 2026 (handout) |
| **Goal** | The handout's example slice (ADR 0020): a Manager defines a template; a Participant chooses it, sets a goal, records daily values and sees computed progress, with login, two roles, the entry rules and access restrictions enforced on the server | Goal changes and history (ADR 0021): the month calendar as the Participant's home, entry correction, goal changes and template retire | Streaks and reminders (ADR 0021), then hardening: integration, failure handling, usability, authorization, regression tests and defect fixes |
| **Features** | F-01, F-02, F-03, F-04, F-06, F-07, F-08, F-09, F-10 | F-05, F-11, F-12, F-13, F-14, F-15 | F-16, F-17 |
| **Depends on** | Nothing earlier. Inside the sprint the build order is F-01, F-02 → F-03, F-06 → F-07 → F-04 → F-08 → F-09, F-10. F-04 comes after F-07 because "refused once a goal uses the template" needs a goal to exist | The Sprint 1 release on `main`. F-12 and F-15 follow F-11. F-14 brings goal versions, a data change (Part C.2) | F-16 needs F-13 from Sprint 2, because a streak is computed from entries after any correction. F-17 needs only F-07 |
| **Planned tests** | The Sprint 1 rows of Part B.2 and B.3 | TC-14, TC-15, TC-19, TC-36 to TC-40, TC-49; NFR-02, NFR-03, NFR-05, NFR-06 rechecked on every new screen and endpoint | TC-41 to TC-43; NFR-08 hardening |
| **Complete when** | A working increment is released on `main` with documented local setup: a full journey through UI, API and database; login, logout and "who am I" for both roles; a rule rejection and a forbidden operation refused by the server; automated tests for rules, persistence and access; Issues, branches, reviewed pull requests and a reviewed release from `staging` to `main` | All six features are built against their contracts, reviewed, integrated and verified, and every Sprint 1 behaviour still passes. The Participant's first screen is the month calendar. Released on `main`. The Sprint 3 contracts, work started on one Sprint 3 feature, and a remaining-work list exist on the same date | Both features are built and verified, all 17 features are complete, the hardening work is done, and the final release is on `main` |

**Coverage.** Together the three sprints hold all 17 features and therefore every FR-01 to FR-23 (Part B.2). Each FR is built in exactly one sprint. FR-23 is split: its create and edit refusals are Sprint 1, and its retire refusal can only be tested once retire exists in Sprint 2. Docker, CI and the GCP deployment are Lab 5 work, not a sprint feature.

## D.2 Why Sprint 1 has this scope {#d-2}

**What is in.** Sprint 1 is exactly the theme's example slice from the Group Work Specification, plus what it cannot work without: real login and two roles (F-01, F-02), templates to choose from (F-03, F-06), goals (F-07), entries with their rules (F-08), progress (F-09) and privacy (F-10). Template edit (F-04) is also in, because "a Participant cannot edit a template" (FR-23) has no meaning without an edit endpoint to refuse. Keeping to the example slice meant no TA agreement was needed for a different slice (ADR 0020).

**What is left out, and why.**

| Left out of Sprint 1 | Reason | Where it goes |
|---|---|---|
| Template retire (F-05) | Not part of the example slice; hidden in Sprint 1 | Sprint 2 (approved change, Part B.5) |
| Month calendar, side panel, colours (F-11, F-12) | The example slice needs only a goals page with progress | Sprint 2 (approved change, Part B.5) |
| Correcting an entry (F-13) | Not part of the slice. Until Sprint 2 a wrong same-day entry cannot be changed (assumption A-11) | Sprint 2 |
| Docker, CI, GCP | Assessed in Lab 5, not Deliverable 1 | Lab 5 |

**Making it fit.** The nine features were planned as five build Issues in the order of D.1: auth (F-01, F-02), templates (F-03, F-04, F-06), goals (F-07), entries (F-08), and progress with privacy (F-09, F-10). Template edit (F-04) was then split into its own Issue after goals, giving six build Issues (Part F.5). A cut line was agreed in advance: drop F-04 first, then show F-09 as a bare number, and never cut login, the two roles, a tested rule or a finished journey. No cut was needed: all nine features are in the `v1.0` release.

**Risks carried forward.**

- Sprint 2 holds six features, and Labs 5, 6 and 7 fall in the same weeks (Group Work Specification §4). Lab evidence is kept apart from feature work.
- Deliverable 2 on 29 Nov also needs the Sprint 3 contracts and started Sprint 3 work.
- The exam period, 1 to 11 Dec, falls inside Sprint 3 (Group Work Specification §4).
- Any feature moved between sprints needs an approved scope change, recorded in Part B.5.
