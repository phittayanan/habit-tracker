<!-- Deliverable 1 rewrite, front matter (Issue #11). Student IDs are typed into the private PDF copy only (ADR 0034), never into Git. -->

<h1 style="font-size:22pt;margin-bottom:4pt">CPE 334 Project Deliverable 1</h1>

<p style="font-size:13pt;margin-top:0">Engineering baseline and working Sprint 1</p>

| Item | Detail |
|---|---|
| Theme | Theme 8, Habit and Activity Tracking System (Group Work Specification §6.8) |
| Context | A habit programme with no named organisation: Program Managers define activity templates; Participants set daily goals, record values and see their progress privately (Part A.1) |
| Repository | https://github.com/phittayanan/habit-tracker |
| Submitted release | Tag `v1.0` on commit `64831f7`, the merge of the reviewed release pull request #61 into `main` (2026-11-10) |

| Student | Student ID | GitHub |
|---|---|---|
| Phittayanan Tiencharoen | [student ID — typed into the private copy] | phittayanan |
| Phuttipong Phankitnirundorn | [student ID — typed into the private copy] | projectnewy |

## Navigation {#navigation}

One row per Part. Page numbers refer to this PDF. Each fact is written once, in the Part named here, and referred to elsewhere by its ID.

| Part | Pages | IDs written out there | Where the evidence is |
|---|---|---|---|
| A. SRS and product scope | {{pages:part-a}} | BR-01 to BR-15, FR-01 to FR-23, NFR-01 to NFR-09; assumptions A-1 to A-11; decisions ADR 0001 to ADR 0051 | NFR results: page {{page:ac-table}} |
| B. Feature inventory and traceability | {{pages:part-b}} | F-01 to F-17; requirement → feature → sprint → AC → test; coverage gaps; approved changes | Test results: page {{page:ac-table}} |
| C. System-level design | {{pages:part-c}} | Architecture, data model, screens, API conventions, role matrix, sessions, configuration and GCP plan | Access refusals: page {{page:scenario-3}}; API tests: page {{page:api-evidence}} |
| D. Three-sprint plan | {{pages:part-d}} | Sprints 1 to 3: goals, features, dependencies, outcomes; Sprint 1 scope | Release and board: page {{page:chains}} |
| E. Sprint 1 contracts | {{pages:part-e}} | Product Definition of Done; contracts F-01 to F-04, F-06 to F-10; AC-01.1 to AC-10.7, AC-SYS.1 to AC-SYS.5; test specification TC-01 to TC-74 | Journey: page {{page:scenario-1}}; rejections: page {{page:scenario-2}}; access: page {{page:scenario-3}}; AC → test results: page {{page:ac-table}}; red and green: page {{page:f-4}} |
| F. Working Sprint 1 and verification | {{pages:part-f}} | Setup, demonstrations, test results, test excerpts, Issue and PR chains, history, contributions, AI use, limitations | This Part |

## Contents

<!-- toc -->
