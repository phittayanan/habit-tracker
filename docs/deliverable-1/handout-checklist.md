# Deliverable 1 rewrite: handout checklist (Issue #11)

Every requirement in the Deliverable 1 handout (`project_deliverable_1_v1.pdf`, the copy dated 6 Nov 2026), mapped to the report section that will carry it. This list is the completeness check for the rewrite: a row is ticked only after its section is written and someone has read it against the handout text.

- Assessed release: tag `v1.0`, commit `64831f7` (decision on #11, 2026-11-13).
- Due: 15 Nov 2026 23:59 (LEB2, read 2026-11-13). The handout itself says 8 Nov.
- Writing rule (§4.1): "There is no fixed page limit; include complete engineering content without duplicating it unnecessarily." Each fact has one home, given in the "Home" column. Other sections refer to it by ID and page.

Status values: `todo`, `written`, `checked`.

## Front of the PDF

| ID | Handout requirement | Ref | Home | Status |
|---|---|---|---|---|
| H-01 | Both students' names and IDs (IDs added to the local PDF only, never in Git) | §4 | Front page | todo |
| H-02 | Selected theme and context | §4 | Front page | todo |
| H-03 | One repository URL | §4 | Front page | todo |
| H-04 | Submitted release tag and commit | §4 | Front page | todo |
| H-05 | Table of contents with page numbers | §4.1 | Front, Contents | todo |
| H-06 | Navigation table: one row per Part A–F with page range and relevant IDs, using in-PDF page references | §4.3 | Front, Navigation | todo |
| H-07 | Headings A–F in the handout's order | §4.1 | Whole PDF | todo |
| H-08 | Text, diagrams, tables and screenshots readable at normal viewing size | §4.1 | Whole PDF | todo |

## Part A. SRS and product scope (10 points)

| ID | Handout requirement | Ref | Home | Status |
|---|---|---|---|---|
| A-01 | Stakeholder problem and chosen context | §3.1 | A.1 | written |
| A-02 | Actors and their responsibilities | §3.1 | A.2 | written |
| A-03 | Product scope and explicit exclusions | §3.1 | A.3 | written |
| A-04 | FR with stable IDs, describing observable behaviour | §3.1 | A.4 | written |
| A-05 | BR with stable IDs, as meaningful domain rules (full rule text lives here only) | §3.1 | A.5 | written |
| A-06 | Important NFR with measurable target, practical verification method and the sprint that verifies it | §3.1 | A.6 | written |
| A-07 | Significant assumptions | §3.1 | A.7 | written |
| A-08 | Design decisions, questions and their resolution | §3.1, §4.1 | A.8 | written |

## Part B. Feature inventory and traceability (10 points)

| ID | Handout requirement | Ref | Home | Status |
|---|---|---|---|---|
| B-01 | Features with stable IDs, short description, related requirements, dependencies and planned sprint | §3.2 | B.1 | todo |
| B-02 | Requirement → feature or responsibility → sprint and verification table covering every baseline FR, BR and important NFR (AC as ID ranges; full AC in Part E) | §3.2, §4.1 | B.2 | todo |
| B-03 | Cross-cutting requirements linked to features or a named system responsibility, with the sprint that sets it up and the sprint that verifies it | §3.2 | B.3 | todo |
| B-04 | Later-sprint requirements have a feature or responsibility and a sprint now | §3.2 | B.2 | todo |
| B-05 | Uncovered requirements shown explicitly | §3.2, §4.1 | B.4 | todo |
| B-06 | Approved changes shown explicitly | §3.2, §4.1 | B.5 | todo |

## Part C. System-Level SDS (15 points)

| ID | Handout requirement | Ref | Home | Status |
|---|---|---|---|---|
| C-01 | Selected stack and each component's role across UI, API or application layer, and database | §3.3 | C.1 | todo |
| C-02 | How the components communicate | §3.3 | C.1 | todo |
| C-03 | Where business rules are enforced | §3.3 | C.1 | todo |
| C-04 | Major entities, fields, relationships, important constraints and ownership links (the only full data model in the PDF) | §3.3 | C.2 | todo |
| C-05 | Database setup, migrations and reproducible seed data | §3.3 | C.2 | todo |
| C-06 | Diagram where it clarifies the architecture or the data model | §3.3, §4.1 | C.1, C.2 | todo |
| C-07 | Main screens and navigation | §3.3 | C.3 | todo |
| C-08 | Shared UI behaviour: validation, loading, empty and error states | §3.3 | C.3 | todo |
| C-09 | API approach: endpoint conventions, request and response shape, validation, safe error handling | §3.3 | C.4 | todo |
| C-10 | Role and permission matrix: who may perform each protected operation and which records they may access; backend enforcement, not hidden controls (the only full matrix in the PDF) | §3.3 | C.5 | todo |
| C-11 | Credential handling and password hashing | §3.3 | C.6 | todo |
| C-12 | Session creation and expiry, current-user retrieval, logout | §3.3 | C.6 | todo |
| C-13 | Environment variables, secret handling, database configuration | §3.3 | C.7 | todo |
| C-14 | Planned GCP deployment components; fit for Docker packaging and durable storage; no real secrets in Git or client code | §3.3 | C.7 | todo |

## Part D. Three-sprint plan (5 points)

| ID | Handout requirement | Ref | Home | Status |
|---|---|---|---|---|
| D-01 | For each sprint: goal, feature IDs, dependencies, completion outcome | §3.4, §4.1 | D.1 | todo |
| D-02 | The three sprints together cover the product baseline | §3.4 | D.1 | todo |
| D-03 | Why Sprint 1 has its scope | §4.1 | D.2 | todo |

## Part E. Sprint 1 engineering contracts (20 points)

One contract per Sprint 1 feature: F-01, F-02, F-03, F-04, F-06, F-07, F-08, F-09, F-10 (to be confirmed against `v1.0`). Each contract cites the BR text in Part A, the data model in Part C and the role matrix in Part C, and states only what the feature adds.

| ID | Handout requirement | Ref | Home | Status |
|---|---|---|---|---|
| E-01 | Product Definition of Done: behaviour implemented, planned verification run, meaningful tests pass, review and integration done, setup and documents current, incomplete work disclosed (written once) | §3.5, §4.1 | E.0 | todo |
| E-02 | Each contract: feature ID and linked FR, BR, NFR | §3.5 | E.n | todo |
| E-03 | Each contract: behaviour, workflow, dependencies | §3.5 | E.n | todo |
| E-04 | Each contract: business rules, validation, failure and boundary cases, permissions | §3.5 | E.n | todo |
| E-05 | Each contract: UI behaviour; API methods, paths, request, response and error shapes; data fields, constraints, migrations; "no change" where a layer has none | §3.5, §4.1 | E.n | todo |
| E-06 | Each contract: AC with stable IDs and observable outcomes, including negative, boundary and role cases (the only full AC text in the PDF) | §3.5 | E.n | todo |
| E-07 | Each contract: STS rows with test ID, linked AC, level, precondition or input, action, expected result (the only full test design in the PDF) | §3.5 | E.n | todo |
| E-08 | Every Sprint 1 AC maps to suitable verification: unit for logic, API and database for persistence and permissions, selected UI or end-to-end for key journeys | §3.5 | E.n | todo |
| E-09 | Version history per contract: specification and test design before implementation, revisions visible and justified | §3.5 | E.n | todo |
| E-10 | All Sprint 1 contracts, AC, STS and DoD appear directly in the PDF | §5 | Part E | todo |

## Part F. Working Sprint 1 and verification (20 points)

| ID | Handout requirement | Ref | Home | Status |
|---|---|---|---|---|
| F-01 | Brief setup summary: dependencies, environment-variable examples, database setup, migrations and seed, run, build and test commands | §4.4 | F.1 | todo |
| F-02 | Safe test access via the local seed procedure; synthetic data; no real passwords, tokens or secrets | §4.4 | F.1 | todo |
| F-03 | Release commit named once for the demonstration set, with any exception | §4.2 | F.2 | todo |
| F-04 | Scenario 1: complete normal journey through UI, API and database, then retrieval of the saved result | §3.6, §4.2 | F.2 | todo |
| F-05 | Scenario 2: meaningful business-rule or boundary rejection with the expected failure shown | §3.6, §4.2 | F.2 | todo |
| F-06 | Scenario 3: login and logout, plus a forbidden role or ownership operation | §3.6, §4.2 | F.2 | todo |
| F-07 | Each scenario labelled with feature and AC IDs, role, starting conditions, brief steps, expected and actual result | §4.2 | F.2 | todo |
| F-08 | Backend or API test evidence for protected operations (hiding a button is not authorization) | §3.6, §4.2 | F.2 | todo |
| F-09 | Automated checks for valid and invalid login, unauthenticated protected requests, forbidden role operations | §3.6 | F.3 | todo |
| F-10 | Build and test commands, tested commit, readable output with passing, failing and skipped counts | §3.6, §4.2 | F.3 | todo |
| F-11 | Results table: each Sprint 1 AC → planned test ID → actual test file and name → result; automated and manual checks marked apart (results by ID only, no AC text) | §4.2 | F.3 | todo |
| F-12 | Test excerpt 1: an important domain rule, with setup, assertion and result | §4.2 | F.4 | todo |
| F-13 | Test excerpt 2: a role or ownership restriction, with setup, assertion and result | §4.2 | F.4 | todo |
| F-14 | TDD evidence: the intended test failing before the fix and passing after, with versions | §3.5, §4.2 | F.4 | todo |
| F-15 | Two completed Issues with their PRs: feature and contract IDs, branches, author and reviewer, a substantive review, integration into staging and main (the only Issue and PR links in the PDF) | §3.6, §4.2 | F.5 | todo |
| F-16 | Final board status and release reference | §4.2 | F.5 | todo |
| F-17 | Short history sequence with commit IDs and dates: contracts and test design recorded before implementation | §3.5, §4.2 | F.5 | todo |
| F-18 | Short contribution table showing both students and pair work | §3.6, §4.2 | F.6 | todo |
| F-19 | Brief AI-use declaration | §4.2 | F.6 | todo |
| F-20 | Known incomplete work, failed and skipped tests | §3.6, §4.2 | F.6 | todo |

## Sprint 1 outcome the evidence must show (§2)

| ID | Handout requirement | Ref | Shown in | Status |
|---|---|---|---|---|
| O-01 | Working increment released on `main` with documented local setup | §2 | F.1, F.5 | todo |
| O-02 | Complete domain journey through UI, API or application layer, and database | §2 | F.2 | todo |
| O-03 | Real login, logout and current-user identity; at least two meaningful roles | §2 | C.6, F.2 | todo |
| O-04 | A meaningful domain transaction or state transition with business-rule validation | §2 | E, F.2 | todo |
| O-05 | Automated tests for domain rules, persistence, access restrictions, and selected UI or end-to-end journeys | §2 | F.3 | todo |
| O-06 | Issues, feature branches, teammate-reviewed PRs, staging integration, accepted release on `main` | §2 | F.5 | todo |

## Submission checklist (§5)

| ID | Handout item | Covered by | Status |
|---|---|---|---|
| S-01 | Complete Parts A–E and selected execution and process evidence in Part F | A–F rows above | todo |
| S-02 | Contents and navigation table identify A–F and their page ranges | H-05, H-06 | todo |
| S-03 | All Sprint 1 contracts, AC, STS and DoD directly in the PDF | E-01 to E-10 | todo |
| S-04 | Captioned screenshots of normal workflow, persisted retrieval, rejection and access restrictions | F-03 to F-07 | todo |
| S-05 | Build and test output, AC-to-test table and test excerpts identify the tested versions | F-10 to F-14 | todo |
| S-06 | Issue, PR, review and history evidence and both students' contributions readable | F-15 to F-18 | todo |
| S-07 | Repository and immutable release identified; repository accessible and reproducible | H-03, H-04, F-01 | todo |
| S-08 | Incomplete work and failed or skipped tests disclosed; no real secrets | F-02, F-20 | todo |

## Duplication check (run after each Part)

- [ ] No BR text outside Part A.
- [ ] No full data model or role matrix outside Part C.
- [ ] No AC text or STS row outside Part E.
- [ ] No Issue or PR link list outside Part F.5.
- [ ] One screenshot per step.
