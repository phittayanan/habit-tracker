<!-- Deliverable 2 PDF source (Issue #161). Parts A to E include the repository documents (see build.mjs). PENDING marks what still needs the students' input.
Build: npm ci, npx playwright install chromium, npm run build. Output: dist/deliverable-2.pdf (not committed). build.mjs fills the page numbers.
Student IDs are never written in these files: each student types their own ID into the built PDF before the LEB2 submission. The LEB2 Submit click is the students'. -->

<h1 style="font-size:22pt;margin-bottom:4pt">CPE 334 Project Deliverable 2</h1>

<p style="font-size:13pt;margin-top:0">Sprint 2 completion and Sprint 3 progress</p>

| | |
|---|---|
| Team (LEB2 group) | Nine's AI |
| Theme and context | Theme 8, Habit and Activity Tracking System (GWS §6.8). Context: a general habit programme with no named organisation (ADR 0003) |
| Repository | https://github.com/phittayanan/habit-tracker |
| Submission deadline | 29 Nov 2026 23:59 (LEB2, read 2026-11-28) |
| Submitted release | Tag `v2.1` (annotated) on commit `9b09bfe`, the merge of the release PR #198 from `staging` into `main`. Sprint 2 release: tag `v2.0` on `f510619` (PR #189) |
| Deployed URL and version | https://habit-tracker-rfi4eg2u4q-as.a.run.app, page label `build 9b09bfe`, Cloud Run revision `habit-tracker-00010-qsv` (v2.1 record section 1) |

| Student | Student ID | GitHub |
|---|---|---|
| Phittayanan Tiencharoen | [student ID — fill privately] | phittayanan |
| Phuttipong Phankitnirundorn | [student ID — fill privately] | projectnewy |

## Navigation {#navigation}

One row per rubric part. Page numbers refer to this PDF.

| Part | Points | Pages | IDs covered | Main sources |
|---|---|---|---|---|
| A. Sprint 1 continuity and change status | 5 | {{pages:part-a}} | `v1.0`, `v1.4`, `v1.5`; journey J-1 to J-7; register CR-nn | `docs/deliverable-2/part-a-continuity.md` (PR #186) |
| B. Sprint 2 contracts and working increment | 25 | {{pages:part-b}} | F-05, F-11 to F-15, template kind; AC-05.x, AC-11.x to AC-15.x; TC-110 to TC-159; chains #153 → PR #176, #156 → PR #185 | `docs/sprints/sprint-2/`; `docs/deliverable-2/status.md`; evidence files |
| C. Sprint 3 contracts and working progress | 15 | {{pages:part-c}} | F-16, F-17; AC-16.x, AC-17.x; TC-160 to TC-175 | `docs/sprints/sprint-3/`; `docs/deliverable-2/status.md` |
| D. Updated requirements and test traceability | 10 | {{pages:part-d}} | BR-01 to BR-15, FR-01 to FR-23, NFR-01 to NFR-09; F-01 to F-17 | `docs/srs.md`, `docs/features.md`, `docs/system-sds.md`, `docs/traceability.md` |
| E. Integrated release candidate | 15 | {{pages:part-e}} | `v2.0`, `v2.1`; deploy runs; post-deployment checks; readiness; plan to 13 Dec | `docs/deliverable-2/v2.0-release.md`, `v2.1-release.md`, `readiness-and-plan.md` |
| Appendices | | {{pages:appendix}} | ADR 0050 to ADR 0106, contributions, AI use | `docs/adr/`, `docs/ai-use.md` |

### Sources

The same tags as Deliverable 1 (D1, D2, FD, GWS, L5, KIT, SG, LEB2, SRS, SDS, ADR, #n). D2 is the handout `project_deliverable_2_v1.pdf`.

### Contents

<!-- toc -->
