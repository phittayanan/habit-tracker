# Course handouts summary

This file summarizes what each CPE 334 handout requires. It reports what the handouts say. It decides no product feature, stack or design. The team decides those in Issue #3 and later.

Every point has a section number so a reader can check it against the handout.

## How to read this file

| Short name | Handout | Version seen |
|---|---|---|
| GWS | Group Work Specification | Draft for instructor review, issued 6 Oct 2026 |
| D1 | Project Deliverable 1 | v1 |
| D2 | Project Deliverable 2 | v1 |
| FD | Final Project Delivery | v1 |
| L5 | Lab 5: Cloud Deployment and CI/CD Pipeline on GCP | updated |
| SG | Student Guide: GCP Deployment and CI/CD | V1.1, 28 Oct 2026 |
| KIT | Lab 5 Starter Kit (`toktickit-lab5-starter`) | as unzipped |

- Section numbers are the handout's own. For SG, "Ep." means Episode, then the sub-section (for example SG Ep. 6.5).
- "Required" means the handout says must, or ties the item to a graded part. "Recommended" means the handout says it is advice and not scored (L5 §5).
- Lab 6 and Lab 7 have no separate handout yet. GWS §12 says they will be issued separately. Their rows come from GWS §10 only.
- L5 §6 says: if the guide or the kit disagrees with the L5 handout, follow the L5 handout.

## 1. Dates

All submission deadlines are 23:59 on the given date (GWS §4). All due dates below are Sundays in 2026.

| Date | What | Points | Source |
|---|---|---|---|
| 6, 8 Oct | Project launch: topics, scope, team workflow, engineering baseline | none | GWS §4 |
| 12–25 Oct | Exam period | none | GWS §4 |
| 26 Oct – 1 Nov | Midterm break, independent project work | none | GWS §4 |
| 3, 5 Nov | Workshop: SRS, system SDS, Sprint 1 contract, tests, integration. Lab 5 sessions with the TA walkthrough in Lecture 11 | none | GWS §4; L5 cover table |
| **8 Nov** | **Project Deliverable 1 due** (Sprint 1 released on `main`) | 80 project | GWS §4; D1 title |
| 10, 12 Nov | Lab 6 sessions: cross-team UAT and defect management | none | GWS §4 |
| **15 Nov** | **Lab 5 due**: deployed Sprint 1 and repeatable delivery | 100 lab | GWS §4; L5 cover table, §12 |
| 17, 19 Nov | Lab 7 sessions: maintenance, metrics, release readiness | none | GWS §4 |
| **22 Nov** | **Lab 6 due** | 100 lab | GWS §4, §10 |
| 24, 26 Nov | Final Exam Review. Project Deliverable 2 discussion | none | GWS §4 |
| **29 Nov** | **Project Deliverable 2 due** | 70 project | GWS §4; D2 title |
| **29 Nov** | **Lab 7 due** | 100 lab | GWS §4, §10 |
| 1–11 Dec | Final examination period | none | GWS §4 |
| **13 Dec** | **Final product, report and demo video due** | 100 project | GWS §4; FD title |

Other dated checkpoints:

| Date | Checkpoint | Source |
|---|---|---|
| 8 Nov | Sprint 1 working increment on `main`. Authentication, permissions and persistence | GWS §7; D1 §3.4 |
| 29 Nov | Sprint 2 complete. Sprint 3 contracts, working progress and a remaining-work list. Product "substantially complete" | GWS §4, §7; D1 §3.4; D2 §2 |
| 13 Dec | Sprint 3 complete and released | GWS §7; D1 §3.4 |
| 15 Dec | Example end date for the GCP budget alert ("or your Final Project deadline") | SG Ep. 1.5 |
| 90 days | Length of the GCP Free Trial (USD 300 credit) | SG Ep. 1.5 |

## 2. Points and course weight

| Assessment | Points | Course grade | Source |
|---|---|---|---|
| Labs 1–4 (individual, already done) | 400 | 20% | GWS §3 |
| Lab 5: CI/CD, Docker, GCP (group) | 100 | 5% | GWS §3; L5 cover table |
| Lab 6: cross-team UAT (group) | 100 | 5% | GWS §3 |
| Lab 7: maintenance and release readiness (group) | 100 | 5% | GWS §3 |
| Project Deliverable 1 | 80 | 8% | GWS §3 |
| Project Deliverable 2 | 70 | 7% | GWS §3 |
| Final Project Delivery | 100 | 10% | GWS §3 |

- Labs pool: 700 points, 35%. Group project pool: 250 points, 25%. The two pools are scored separately (GWS §3).
- The default is one shared team score. Suspected non-participation goes to the instructor (GWS §2; L5 §1).

## 3. Group Work Specification (GWS)

**Due:** it sets the schedule above; it is not itself submitted.
**Points:** see section 2.
**Submission:** one submission per team per assessment on LEB2 (GWS §11).

### 3.1 Team and participation (GWS §2)

- Teams have two students, with one repository and one application for the project and Labs 5–7.
- Both students take part in requirements and design, testing, AI-agent supervision, implementation, review, deployment and maintenance.
- Tasks may be shared, but not as permanent roles such as "one writes specs, the other writes code".
- Record contributions with Issues, commits, PR author and review, and a short contribution table. Pair work is allowed if both names are in the Issue or PR.
- Equal commit counts are not required. Both students must be able to explain any sampled requirement, test, design decision or release step.

### 3.2 Common product and technical requirements (GWS §5)

- The product has a real UI → API/application layer → persistent database workflow (§5.1).
- A static site, UI mock-up, generic CRUD demo, or an app that keeps all data in browser memory does not meet the requirements (§5.1).
- The product needs meaningful domain rules and workflows (§5.1).
- Authentication and basic server-side authorization are required from Sprint 1 (§5.2). Details are in section 9 of this file.
- Delivery rules (§5.3) are in section 9 of this file.

### 3.3 Themes (GWS §6)

- There are ten themes. A team's theme is the one whose number matches the last digit of a team member's student ID. A pair may be able to choose between two themes (§6).
- Teams on the same theme must build independent products (§6).
- The theme text is a stakeholder brief, not a finished SRS. The team must find the ambiguities, resolve them with the instructor or TA when needed, and record the decisions (§6).
- Each Sprint 1 example is a minimum level of scope and depth. It is not a fixed screen layout or feature count. A different vertical slice needs instructor or TA agreement and equal depth (§6).
- The handouts do not name our team's theme. The repository name suggests theme 8 (Habit and Activity Tracking). See open point O-1.

Theme 8 as the handout words it (GWS §6.8):

- **Brief:** users define activity goals, record progress and review history. Choose study habits, exercise, sleep or another routine. The finished product handles goals, valid daily entries, progress calculations, history, and reminder or schedule representation. The brief says to specify dates, units, duplicate-entry behavior and goal changes. Medical diagnosis and treatment advice are out of scope.
- **Sprint 1 example:** a program manager logs in and defines an activity template with a unit and a valid range. A participant logs in, selects a template, sets a goal, records daily activity and sees computed progress. Enforce the specified one-entry-per-day or accumulation rule, and valid values and dates.
- **Sprint 1 identity and access:** Participant and Program Manager roles. Managers maintain templates. Participant histories stay private unless the SRS defines consent-based sharing. Managers do not automatically get access to private records. Test cross-participant access, and participant attempts to edit shared templates.
- **Later sprints:** goal revisions, streak and history logic, reminder placeholders, progress summaries.

### 3.4 Three-sprint model (GWS §7)

| Sprint | What the handout says | Due |
|---|---|---|
| 1 | Small working increment: authentication and authorization foundation plus an end-to-end domain slice. Show a normal workflow, a business-rule rejection, and access restrictions with tests. Runs locally with documented setup and is suitable for containerization | 8 Nov |
| 2 | Major remaining workflows under feature contracts. Integrated, tested working increment | 29 Nov |
| 3 | Remaining features, integration, failure handling, usability, authorization, regression tests, defect fixes. By 29 Nov: contracts, progress and a remaining-work list | 13 Dec |

- Plan the whole product's scope, architecture and three-sprint allocation before Sprint 1 implementation (§7).
- Write each feature contract before implementing that feature. Sprint 3 detail need not be frozen at launch (§7).
- Record justified changes. Do not silently shrink scope or rewrite history (§7).

### 3.5 Engineering workflow and artifacts (GWS §8)

- Baseline (§8.1): a concise SRS with unique FR, BR and measurable important NFR IDs, actors, scope, exclusions, assumptions and decisions. A feature inventory and a requirement → feature → sprint traceability matrix. A System-Level SDS with architecture and stack, major data model, UI structure, API approach, roles and permissions, configuration and planned deployment. Diagrams only where they help; there is no UML quota.
- Feature contract (§8.2), written before implementation: Feature-Level SDS, UI/API/data specs where they apply, acceptance criteria (AC) with stable IDs, a Software Test Specification (STS) with test IDs, inputs, expected results, level and AC coverage, and a Definition of Done with the evidence needed.
- Link each AC to planned and actual tests. Use unit tests for important logic, API/database integration tests for persistence and permissions, and UI/end-to-end tests for selected critical journeys. Include negative and boundary tests (§8.2).
- A stub assertion, a mock-only persistence demo, a screenshot, or an AI statement that "all tests pass" is not execution evidence (§8.2).
- Use TDD for meaningful rule, defect or change work: a failing test first, then the implementation and passing tests. Do not weaken tests to make wrong behavior pass. Manual checks are allowed but do not replace the required automated coverage (§8.2).
- Git workflow (§8.3): (1) an Issue linked to the requirement, feature and contract; (2) a feature or fix branch from the current sprint staging branch; (3) implement, test, inspect the diff, update documents; (4) a PR into sprint staging, reviewed by the teammate; (5) integrate and run integration, system and acceptance checks; (6) a reviewed release PR from sprint staging into `main`; (7) tag or record the release, and after Lab 5 deploy it through the pipeline.
- Reviews must contain a specific check, question, finding or reason for approval. Authors do not approve their own PRs (§8.3).
- Failed integration goes back to an Issue or fix branch and is re-tested (§8.3).
- Keep contract revisions and implementation history so the order can be verified (§8.3).
- Lab changes may be part of a planned sprint, but their assessment evidence must be labelled and kept apart from unrelated feature work (§8.3).
- AI use (§8.4): spec and coding agents are allowed. Give them the contract, work on bounded Issues, inspect output, run tests and review changes. Both students must understand the result. Keep a short AI-use declaration listing tools and tasks. Full transcripts and long reflections are not required.

### 3.6 Evidence conventions (GWS §11)

- Identify the team, both students, the assessment, the repository, the submitted tag or commit, the deployed version where it applies, and evidence links.
- Suggested document places: `docs/srs.md`, `docs/features.md`, `docs/traceability.md`, `docs/system-sds.md`, `docs/sprints/`, `docs/labs/`. Equivalent clear organization is accepted.
- Every assessment has a short evidence index with these columns: rubric part, artifact or direct link, IDs and selected version, verification result or status.
- For tests, give the file and test name, the command or CI run, the result and the tested commit. Screenshots only add to direct evidence.
- Keep links open to graders and partner testers. Keep the final deployment up until the instructor ends the access period.
- TAs sample requirements, AC, tests, Issues, PRs and deployed journeys. Marks reward observable behavior, traceability, meaningful tests and credible evidence. Length, prompt count, commit count and polish alone do not earn marks.

### 3.7 Lab 6 and Lab 7 (GWS §10, summary only)

No separate handout exists yet (see O-8).

- **Lab 6, due 22 Nov, 100 lab points.** Pair with another team. Each team writes UAT cases for its own released app, tests the partner's app, and triages and fixes findings on its own app. Test a recorded release. At least four user-facing cases: normal journey, domain-rule or boundary case, role or ownership restriction, and a state, history or persistence check. Each case records UAT ID, goal, preconditions, steps, expected and actual result, PASS/FAIL, tester, version and defect link. Resolve and independently re-test at least one accepted defect. Rubric: preparation and handoff 20, independent execution 25, defect reporting and triage 20, resolution and re-test 35.
- **Lab 7, due 29 Nov, 100 lab points.** Apply one instructor- or TA-approved change to an already implemented behavior or rule. A backlog feature does not count. Trace impact, update the contract, show the changed test failing first, implement, run regression tests, review and redeploy. Rubric: impact analysis and contract 25, implementation and regression-safe delivery 50, five dated metrics with sources and one interpretation of at most 100 words 15, release readiness and a short retrospective 10.

## 4. Project Deliverable 1 (D1)

| Item | Value | Source |
|---|---|---|
| Title | Engineering baseline and working Sprint 1 | D1 title |
| Due | 8 Nov 2026, 23:59 | D1 title, §4 |
| Points | 80 (8% of grade) | D1 title |
| Submit | One self-contained PDF per team on LEB2 | D1 §4 |

### 4.1 Rubric (D1 §1, §4.1)

| Part | Points | What the PDF must contain | Suggested file |
|---|---|---|---|
| A. SRS and product scope | 10 | Stakeholder and context, actors, scope and exclusions, numbered FR/BR/NFR, assumptions and decisions | `docs/srs.md` |
| B. Feature inventory and traceability | 10 | Feature inventory, requirement → feature → sprint table, coverage gaps, approved changes | `docs/features.md`, `docs/traceability.md` |
| C. System-Level SDS | 15 | Architecture and stack, data model, UI/API conventions, roles and ownership, authentication, configuration, deployment plan | `docs/system-sds.md` |
| D. Three-sprint plan | 5 | Goals, feature IDs, dependencies, completion outcomes, scope of Sprint 1 | `docs/sprints/plan.md` |
| E. Sprint 1 engineering contracts | 20 | All Sprint 1 feature contracts: feature SDS, UI/API/data specs, AC, STS, Product Definition of Done, version history | `docs/sprints/sprint-1/` |
| F. Working Sprint 1 and verification | 20 | Demonstrations, build and test results, Git workflow evidence, contribution table, known limitations | released app, tests, README, Issues, PRs |
| Total | 80 | | |

### 4.2 Required Sprint 1 outcome (D1 §2)

By the deadline, release a working increment on `main` with documented local setup. It must include:

- A complete domain journey through the UI, the API or application layer, and the database.
- Real login, logout and current-user identity, and at least two meaningful user roles.
- A meaningful domain transaction or state transition, and business-rule validation, comparable to the theme's Sprint 1 example.
- Automated tests for domain rules, persistence and access restrictions, plus selected UI or end-to-end journeys.
- GitHub Issues, feature branches, teammate-reviewed PRs, sprint staging or integration, and an accepted release on `main`.

Also (D1 §2):

- Docker, completed CI/CD and GCP deployment are due in Lab 5, not D1.
- At D1, keep local build and test results linked to the release commit, and design the app for later deployment.
- Seeded test accounts are enough. Self-registration, password recovery and advanced account administration are not required.

### 4.3 What each part asks for (D1 §3)

- **Part A (§3.1).** Problem, context, actors and responsibilities. Scope and explicit exclusions. FR and BR with stable IDs that describe observable behavior, not generic claims like "manage records". Important NFR with measurable targets, a practical verification method and a sprint for verification. Assumptions, design decisions, questions and how they were resolved.
- **Part B (§3.2).** Features with stable IDs, short description, related requirements, dependencies and planned sprint. Cover every baseline FR, BR and important NFR. A cross-cutting requirement may link to several features or a named system responsibility, with the sprint that sets it up and verifies it. Later-sprint requirements need an allocation now but not full AC and tests. Show uncovered requirements and approved changes.
- **Part C (§3.3).**
  - Architecture and data: the stack and each component's role across UI, API and database; how they communicate; where business rules are enforced. Major entities, fields, relationships, constraints and ownership links. Database setup, migrations and reproducible seed data. A diagram when it helps.
  - UI, API and access: main screens and navigation; shared UI behavior (validation, loading, empty and error states). API approach: endpoint conventions, request and response shape, validation, safe error handling. A role and permission matrix: who may do each protected operation and which records they may access. A hidden frontend control is not backend authorization. Credential handling, password hashing if passwords are managed locally, session or token creation and expiry, current-user retrieval, logout.
  - Configuration and delivery: environment variables, secret handling, database configuration and the planned GCP components. The product must suit Docker packaging and durable storage. Keep real secrets out of Git and client code.
- **Part D (§3.4).** For each sprint: goal, feature IDs, dependencies, completion outcome. Together the three sprints cover the product baseline.
- **Part E (§3.5).** Write and version the contract for each Sprint 1 feature before implementing it. It covers behavior, workflow, dependencies, rules, validation, failure and boundary cases and permissions. It covers UI behavior, API methods, paths and request, response and error shapes, and data fields, constraints and migrations (say when a layer needs no change). AC have stable IDs and observable outcomes, with negative, boundary and role cases. Each planned test has an ID, linked AC, level, precondition or input, action and expected result. Map all Sprint 1 AC to tests. Define the Product Definition of Done: required behavior implemented, planned verification run, meaningful tests passing, review and integration complete, setup and documents current, incomplete work disclosed. Completion is shown by evidence, not by an AI claim. Keep spec, test-design and implementation history. Use TDD for meaningful rule work and keep evidence that the test failed first.
- **Part F (§3.6).** Show the full Sprint 1 journey and retrieve the saved result. Show a business-rule rejection and a forbidden operation. Automated checks for valid and invalid login, unauthenticated protected requests, and forbidden role operations. Show logout as the session or token design defines it. Enforce on the backend; a client-chosen user ID or role selector does not count. Run the build and test commands on the released commit and keep the test names, files, counts, results, command and commit. Report failed and skipped tests. Do not disable or weaken required tests. Link each completed Issue to its feature contract, branch and PR. Branch from sprint staging. The teammate reviews with a specific check. Integrate, run integration and acceptance checks, then merge the reviewed staging release PR into `main`. Record the release tag or commit. Both students take part; show pair work in Issues and PRs and a short contribution table.

### 4.4 PDF layout and evidence (D1 §4, §5)

- Put both students' names and IDs, the theme and context, one repository URL, and the release tag or commit at the start (§4).
- Put the full engineering documents and selected evidence in the PDF. A TA must be able to grade Parts A–F without opening other files. The repository stays available for checking but does not replace the PDF (§4).
- Use headings for Parts A to F in that order. Add a table of contents with page numbers. There is no page limit (§4.1).
- Add a navigation table with one row per part: page range and IDs (§4.3).
- Part F evidence (§4.2):
  - Captioned screenshots of three scenarios: a normal journey with the saved result retrieved; a business-rule or boundary rejection; login and logout with a forbidden role or ownership operation. Each caption gives feature and AC IDs, role, starting conditions, steps, expected and actual result. Name the release commit once.
  - Backend or API test evidence for protected operations.
  - Build and test commands, tested commit, and output with passing, failing and skipped counts. A table mapping each Sprint 1 AC to planned test ID, actual file and test name, and result. Mark automated tests and manual checks apart.
  - Two short real test excerpts: one domain rule and one role or ownership restriction, with setup, assertion and result. Show a test failing before the fix and passing after, with versions.
  - Two completed Issues with their PRs: IDs, branch names, author and reviewer, a substantive review, and integration into staging and `main`. Final board status and release reference.
  - A short history sequence with commit IDs and dates showing contracts and test design before implementation.
  - Both students' contributions, a brief AI-use declaration, and known incomplete work or failed or skipped tests.
- Keep the README current: dependencies, environment-variable examples, database setup, migrations and seed, and the run, build and test commands. Give a short setup summary in Part F (§4.4).
- Use synthetic data. Give safe test accounts through the private course handoff or a documented local seed. Put no real passwords, tokens or production secrets in the PDF or Git (§4.4).
- A demo video, a GCP URL, a finished Docker setup and a CI/CD pipeline are not required for D1 (§4.4).
- Later commits must not silently replace the assessed version (§4.3).
- Checklist (§5): all parts A–E complete in the PDF; navigation table; screenshots with captions; test output and AC-to-test table; Issue, PR and review evidence; the repository and an immutable release identified; incomplete work and failed tests disclosed; no real secrets.

## 5. Project Deliverable 2 (D2)

| Item | Value | Source |
|---|---|---|
| Title | Sprint 2 completion and Sprint 3 progress | D2 title |
| Due | 29 Nov 2026, 23:59 | D2 title, §4 |
| Points | 70 (7% of grade) | D2 §1 |
| Submit | One self-contained PDF per team on LEB2 | D2 §4 |

### 5.1 Rubric (D2 §1, §4.1)

| Part | Points | What to show |
|---|---|---|
| A. Sprint 1 continuity and change status | 5 | Original slice still works. Sprint 1 tag or commit. Change and defect register: ID, source, affected requirement or feature, accepted decision, status, fix release and re-test. Approved baseline revisions with reasons. Status of relevant Lab 5–7 findings (§3.1) |
| B. Sprint 2 contracts and working increment | 25 | Complete contract for every Sprint 2 feature (FR/BR/NFR links, feature SDS, UI/API/data, validation, errors, permissions, AC, STS, DoD) with history before implementation and TDD evidence. Completion table for every Sprint 2 feature: AC, implementation, executed verification, result, accepted release. AC mapped to real tests. Issues, branches, reviewed PRs, integration checks, and the Sprint 2 release on `main`, kept identifiable (§3.2) |
| C. Sprint 3 contracts and working progress | 15 | Contracts, AC and STS for all remaining Sprint 3 features. At least one meaningful Sprint 3 workflow or rule implemented and tested. Status of each item: planned, in progress, implemented, tested, accepted. Remaining-work table: feature or defect, status, remaining action, owner and target date (§3.3) |
| D. Updated requirements and test traceability | 10 | Current SRS, feature inventory and System-Level SDS. One matrix: requirement → feature → sprint → AC or NFR verification → planned test → actual file and test or measurement → result and version. Show uncovered items. No "done" for an unrun test (§3.4) |
| E. Integrated release candidate | 15 | Candidate on `main`, deployed on GCP, with build, automated suite, integration and system checks, and acceptance journeys on its commit. Deployed version matches tag, commit and CI run. Post-deploy check of a critical journey and persistence. Docker, env vars, migrations and setup current. Readiness review and a dated plan to finish by 13 Dec (§3.5) |
| Total | 70 | |

### 5.2 Required checkpoint outcome (D2 §2)

- All planned Sprint 2 features are complete, reviewed, integrated and verified against their contracts.
- Sprint 3 contracts cover the remaining baseline features. At least one Sprint 3 workflow or rule is implemented and tested. Empty screens or unrun tests do not count.
- The candidate on `main` combines Sprint 1, Sprint 2 and implemented Sprint 3 work, and is deployed on GCP through the Lab 5 process.
- Earlier behavior, authentication, backend permissions and record ownership still work.
- The remaining-work list names exact features and AC, defects, owners, dependencies, next actions and completion dates up to 13 Dec.
- Required features must not move to Sprint 3 just to mark Sprint 2 complete, unless the scope change is approved (§3.2).
- Plan around the 1–11 Dec exam period. Do not leave the main workflows for the last two days (§3.3).

### 5.3 Submission format (D2 §4, §5)

- Start with both students' names and IDs, theme, one repository URL, the immutable tag or commit, the deployed URL and its version. Add a navigation table of rubric part, PDF pages and IDs (§4).
- Part contents (§4.1): A continuity evidence and change log; B Sprint 2 contracts, completion table and evidence; C Sprint 3 contracts, tests and remaining-work plan; D current SRS, features, SDS and the results matrix with gaps; E candidate demos, build, regression, CI and deploy output, readiness review, setup summary, completion plan.
- Appendices are inside the same PDF. There is no page limit (§4.1).
- Program evidence (§4.2): captioned screenshots for two Sprint 2 features and at least one Sprint 3 item, plus a short Sprint 1 continuity demo. Show saved data, a rule rejection, and backend or API evidence for a forbidden role or ownership operation. Include commands, commit IDs and output with pass, fail and skip counts. Two real test excerpts (one domain or cross-feature rule, one access restriction). TDD red and green with versions. Two Issue and PR chains.
- Setup summary: dependencies, env var names and examples, Docker, build, run and test commands, migration and seed, deployment procedure. Keep the README current. Synthetic data only; no real secrets (§4.2).
- Keep the deployment and repository available through grading (§4.2).
- Checklist (§5): every part, navigation table, statuses that show incomplete, failed and skipped work, versions identified, release on `main` and deployed, UAT and change findings accounted for.

## 6. Final Project Delivery (FD)

| Item | Value | Source |
|---|---|---|
| Title | Complete integrated and verified product release | FD title |
| Due | 13 Dec 2026, 23:59 | FD title, §4 |
| Points | 100 (10% of grade) | FD §1 |
| Submit | One self-contained PDF per team on LEB2, plus a demo video as a YouTube link anyone with the link can view | FD §4, §4.1 Part E |

### 6.1 Rubric (FD §1)

| Part | Points | What to show |
|---|---|---|
| A. Final working product | 35 | Complete major workflows and domain rules across three sprints. Completion table for every feature. Persistence, validation and error feedback, recovery from expected failures. Real backend authentication, role permissions and ownership on every protected workflow, including endpoints added after Sprint 1 (§3.1) |
| B. Engineering process and team evidence | 15 | Requirements and contracts before code, Issues, branches, tests, teammate reviews, staging integration, release PRs, `main` releases, TDD evidence. A release and history table. Two Issue and PR chains from different sprints (§3.2) |
| C. Final requirements and verification traceability | 20 | Final SRS, features, SDS and all contracts, AC and STS in appendices. Every baseline FR, BR and important NFR mapped to feature, sprint, AC or target, planned test, actual test or measurement, result and final version. NFR results compared with their targets. No silent deletions (§3.3) |
| D. Final QA and Product Definition of Done | 20 | Final build and test run on the final commit with counts. Lab 6 UAT cases reused and affected journeys re-tested. Defect status. Deployment through the pipeline with post-deploy checks. Reproducible Docker and setup. Data survives a restart or redeploy. DoD review, known defects, debt, blockers (§3.4) |
| E. Demonstration video | 10 | Real running product, both students presenting together, deployed version named, major workflows, one business rule, one rejected or failed case. Slides cannot replace execution (§3.5) |
| Total | 100 | |

### 6.2 Required final outcome (FD §2)

- Complete the baseline features of Sprints 1–3, with approved changes. Give an explicit status for every requirement and feature.
- Release on `main` and deploy the same version on GCP with durable data and current setup instructions.
- Verify workflows, business rules, errors, persistence, authentication and backend permissions on the integrated product.
- Finish automated regression tests and relevant independent UAT and re-tests. Fix accepted critical defects and disclose blockers.
- Results must come from the final version. An old passing run does not prove the final release works (§2).
- Basic CRUD pages without the specified domain behavior are not enough (§3.1).
- Technical debt is a design or implementation compromise that makes future work harder. It is not a label for unfinished required features (§3.4).

### 6.3 Submission format (FD §4)

- Start with both students' names and IDs, theme, one repository URL, the immutable tag or commit, the deployed URL and its version. Add a navigation table (§4).
- Part contents (§4.1): A completion table and demos (persistence, a rejection, access limits); B history across three sprints, two reviewed chains, contribution table, brief AI-use declaration; C final documents and the results matrix; D final test, CI, UAT and re-test records, defect and debt register, DoD review, deployment evidence, setup summary; E video title, access reference, release and a timestamp index.
- The video is submitted separately as a YouTube link. Allow viewing for anyone with the link (§4.1 Part E, §5).
- Put the two chain samples from different sprints. Include real NFR measurements or access checks against their targets, and the latest independent UAT or re-test records with tester and release ID (§4.2).
- Give one contribution table, AI-use declaration and known-limitations list, then refer to their pages (§4.1).
- The setup summary lists dependencies, env var names, Docker, build, run and test commands, migration and seed, and deployment steps. Synthetic data only; no real secrets (§4.2).
- Keep the deployment and repository available through grading (§4.2).

## 7. Lab 5 (L5)

| Item | Value | Source |
|---|---|---|
| Title | Cloud Deployment and CI/CD Pipeline on GCP | L5 title |
| Type | Group lab: same team, repository and app as the project | L5 cover table |
| Starting point | The accepted Sprint 1 release | L5 cover table, §1 |
| Lab sessions | 3 and 5 Nov 2026; TA walkthrough in Lecture 11 | L5 cover table, §6 |
| Due | 15 Nov 2026, 23:59 | L5 cover table, §12 |
| Points | 100 lab points (5% of grade) | L5 cover table |
| Submit | One PDF per team on LEB2, named `lab5_sec<section>_<group name>.pdf` | L5 §12 |
| Repository | Public until grading ends (R-12) | L5 §4.1 |
| Service | Keep it running until the instructor announces the end of grading | L5 §12 |

### 7.1 Rubric (L5 §12)

| Part | Points | Required evidence |
|---|---|---|
| 0. Team and evidence index | not scored | Team number and topic, both students' names, IDs and GitHub usernames, public repository link, tag or commit, public URL and the commit it serves, contribution table with Issue and PR links, evidence index |
| 1. CI and quality gate | 30 | CI workflow file; a passing PR with meaningful build and test results (C-01); the required-check setting for `main`; a failing PR from a temporary branch with the merge blocked (C-02) |
| 2. Docker and reproducible configuration | 20 | Dockerfile and `.dockerignore`; a fresh build and the running container with its database (C-03); `.env.example` and the env var table in `deployment.md` showing no secret is committed |
| 3. GCP deployment and persistence | 35 | Public URL; the domain workflow on the live URL (C-04); UI, API and database connected; the GCP service and database; data before and after a restart and a redeploy (C-05) |
| 4. Repeatable release pipeline | 15 | One labelled change from Issue to PR into staging with a specific teammate review, the release PR into `main`, CI and deployment; the pipeline run and the running revision showing the release commit (C-06); the release procedure in `deployment.md` |
| Total | 100 | |

### 7.2 Requirements (L5 §4.1)

| ID | Requirement | GWS source |
|---|---|---|
| R-01 | Package the app with Docker. A fresh build from a clean clone gives a working container | §5.1, §5.3, §10 |
| R-02 | Read every setting from the environment. Document each variable in `.env.example` or `deployment.md`. Commit no real secret | §5.3, §10 |
| R-03 | Deploy on GCP at a public URL. The domain workflow works there through UI, API and database | §5.3, §10 |
| R-04 | Persistent database. Data survives a restart and a redeploy. Nothing the app needs lives only in the container | §5.1, §10 |
| R-05 | Run build and automated tests on every relevant PR, with meaningful results | §5.3, §10 |
| R-06 | Make the passing check required so a failed check cannot enter the release path. Prove it with a failing PR from a temporary branch. Never break the released app | §5.3, §10 |
| R-07 | Deploy accepted releases from `main` through a repeatable pipeline: reviewed change, CI, merge, deployment. A documented manual approval is allowed. A separate cloud staging environment is not required | §5.3, §8.3, §10 |
| R-08 | Identify the commit of each release (tag or SHA). Document a repeatable release procedure | §8.3, §10 |
| R-09 | Issues and a project board, feature or fix branches, PRs into staging reviewed by the teammate, a release PR from staging into `main`. Authors do not approve their own PRs. Every review states a specific check, question, finding or reason | §5.3, §8.3 |
| R-10 | Label Lab 5 Issues and PRs (for example `lab5`). Do not delete or rewrite commits, contract revisions or CI runs. CI stays mandatory after Lab 5 | §8.3 |
| R-11 | Both members take part in every area. Record contributions in Issues, commits, PR authorship and review | §2 |
| R-12 | Repository public until grading ends. Never commit `.env`, passwords, connection strings or keys. If a secret is pushed, change it at once and tell a TA | §11 |

### 7.3 Required checks (L5 §8)

Record each check with the file or test name, the command or CI run, the result and the tested commit.

| Check | What it shows | Covers |
|---|---|---|
| C-01 | A normal PR runs build and all tests, and they pass. Evidence: CI run link and test summary | R-05 |
| C-02 | A PR from a temporary branch with one failing test cannot be merged. Evidence: PR link, failed check, blocked merge | R-06 |
| C-03 | A fresh clone builds and runs with only `.env.example` values filled in. Evidence: commands and output | R-01, R-02 |
| C-04 | The domain workflow works on the public URL: sign in, the main business action, and one rule rejection or access restriction. Evidence: screenshots with the URL visible | R-03 |
| C-05 | A record created before a restart and a redeploy is still there afterwards. Evidence: before and after screenshots | R-04 |
| C-06 | A reviewed change goes from staging into `main` and is deployed, and the running revision matches its commit. Evidence: PR links, pipeline run, GCP revision | R-07 to R-10 |

### 7.4 Other L5 content

- **Required files (§4.3):** `Dockerfile` and `.dockerignore` (plus `docker-compose.yml` if the app runs locally with a database); `.env.example` with placeholders only; CI and deploy workflows (for example `.github/workflows/ci-docker.yml` and `deploy.yml`, or equivalent); `docs/labs/lab-05/deployment.md`.
- **`deployment.md` must hold (§4.3):** the stack and any change from the reference; each env variable (purpose, secret or not, where its value comes from); commands to build, test, run, migrate and seed; GCP project, region and resource names; the release procedure, including how to find the running commit.
- **Not required (§4.2):** a separate cloud staging environment, Kubernetes or infrastructure-as-code, custom domains, load balancers, multi-region, canary or blue/green releases, monitoring dashboards, load testing, real payment or messaging services, features outside the approved Sprint 1 scope.
- **GCP access (§4.4):** one member signs up for the Free Trial (USD 300) with a personal Gmail account that has never used it, not a university account. That member creates one project for Lab 5, 6, 7 and the Final Project and adds the teammate in IAM with the Editor role. Nobody pays a prepayment or clicks Upgrade. If GCP asks for payment, take a screenshot and tell a TA.
- **Execution steps (§7):** each step has its own Issue, numbered #1 to #8 in the guide: (1) GCP account, project, teammate; (2) make the app cloud-ready and write the first `deployment.md`; (3) containerize; (4) CI on PRs; (5) first deploy to GCP; (6) connect GitHub to GCP and set the merge gate; (7) deploy workflow and a visible change released through staging into `main`; (8) check persistence. Step 9 is finishing `deployment.md` and the PDF.
- **Team workflow (§9):** each Issue has its own branch and enters staging through a teammate-reviewed PR. Staging enters `main` through a release PR. Only `main` deploys, so every merge into `main` is a release. Console work still gets an Issue, closed with a screenshot. With AI agents: read every `gcloud` command or Console change before it runs; never let an agent change billing, IAM or databases on its own; never paste secrets into an agent chat; when a deploy fails, give the agent the log excerpt and ask for the cause before asking for a fix.
- **Definition of Done (§11):** a fresh clone builds and runs, every setting from the environment, no secret in the repository, image, logs or PDF; the public URL serves the latest `main` release and shows the running commit; data survived a restart and a redeploy; CI runs on every PR into staging and `main` and a failed required check blocks the merge; the latest release reached `main` through reviewed PRs and was deployed by the pipeline; the repository is public; `deployment.md` and the evidence index are complete and either member can explain any step; the PDF is named correctly.
- **PDF format (§12):** headings "Answer Part 0" to "Answer Part 4" in order. The PDF is an evidence index: give a direct link and one or two sentences for each item. Use a screenshot only where a link cannot show the thing (a blocked merge button, a GCP setting, before and after a redeploy). Number each caption and say what it proves and which commit, run or URL it comes from. Crop to the key part, keep text readable at 100% zoom, and hide any secret value. Give at least one evidence-index row per rubric part.
- **Recommended practices (§5), not scored:** a budget alert before any resource; Cloud Run minimum instances 0 and maximum 3 or fewer; the smallest Cloud SQL tier with storage auto-increase off; pause when idle and tear down after the course; secret scanning push protection; reference stack of Artifact Registry, Cloud Run, Cloud SQL for PostgreSQL, Secret Manager and GitHub Actions; keep sessions and uploaded files in the database; seed demo accounts per role with passwords kept out of code and shared privately; runtime secrets in Secret Manager and pipeline secrets in GitHub Actions secrets; Workload Identity Federation instead of JSON keys with least-privilege service accounts; image tag is the full commit SHA and deploy by digest; migrations in a separate job before the service update and kept additive; an automated read-only smoke test after each deploy; roll back by redeploying an earlier tag; pin GitHub Actions to a full commit SHA with Dependabot. If the team chooses differently, write the choice and the reason in `deployment.md` (§5).
- **Stakeholder request (§3):** anything entered survives a restart and the next release; a change reaches the live system only after review and passing tests; every release comes from `main` through the same process; Lab 6 partners will run UAT on the deployed system and fixes ship through the same pipeline; keep costs low and do not leave paid resources running when nobody needs them.

## 8. GCP guide (SG) and Lab 5 starter kit (KIT)

### 8.1 Student Guide V1.1 (SG)

The guide has Episodes 0 to 10. Its examples use TokTickIT. Each episode lists its Issue and the rubric part it supports.

| Ep. | Topic | Issue and branch (example) | Rubric part | What it asks |
|---|---|---|---|---|
| 0 | Overview | none | none | Required vs recommended list (0.2); kit files and what to change (0.3, 0.4); console menus (0.5) |
| 1 | GCP account and cost control | #1, no branch | GCP deployment | Free Trial on a personal Gmail; project; add teammate as Editor; Cloud Shell; alerts-only budget |
| 2 | Local to cloud | #2, `refactor/2-cloud-ready` | Docker and config | Six cloud-readiness checks (2.2); complete `.env.example` (2.3); run tests (2.4); PR into staging with the checklist (2.5) |
| 3 | Docker | #3, `build/3-docker` | Docker and config | Seven Docker files; read them; run compose and check persistence (recommended); PR |
| 4 | CI on PRs | #4, `ci/4-pr-checks` | CI and quality gate | Add the CI workflow and `deploy/` folder; set the branch list to include staging and `main`; keep job name `test-and-docker`; first release PR to `main` |
| 5 | First deployment to GCP | #5, no branch | GCP deployment | Adapt and run `deploy/deploy.sh` from Cloud Shell: dry run first; turn off storage auto-increase; test the app; get the first admin password privately |
| 6 | GitHub to GCP, merge gate | #6, throwaway branch | CI gate, release pipeline | Workload Identity Federation (no keys); GitHub environment `demo`; ruleset `protect-main`; prove the gate with a failing PR |
| 7 | Auto deploy and smoke test | #7, `feature/auto-deploy`, `feature/deploy-proof` | Release pipeline | Add `deploy.yml`; release through staging into `main`; check run summary and revision digest; a second visible change |
| 8 | Persistence and rollback | #8, no branch | GCP deployment; release pipeline | Create data; roll back by `image_tag`; data and sign-in survive; roll forward |
| 9 | Pause when idle | none | cost | Close public access and stop Cloud SQL; resume before merging to `main` |
| 10 | Teardown | none | none | Preview then delete resources, remove the Ep. 6 account and pool, disable the deploy workflow. Do not run before grading |

Rules and requirements stated in the guide:

- Never paste passwords, connection strings or keys into an AI chat, the repo, a screenshot or a group chat. Read every `gcloud` command an AI suggests. Never let an AI change billing, IAM or the database on its own (SG "Rules for the whole lab").
- Required (project spec): Docker packaging and GCP deployment; build and tests on every relevant PR with a failed required check blocking the merge; releases deploy from `main` through a repeatable pipeline; data lives outside the container; configuration documented without real secrets (SG Ep. 0.2).
- If the team does not use the recommended stack, adapt the kit and explain the choice in the System-Level SDS (SG Ep. 0.2).
- Never commit directly to staging or `main`. Authors cannot approve their own PRs. Deploys happen from `main` only (SG Ep. 0.1).
- Anything done in the Console or GitHub Settings has no branch but still has an Issue, closed with a screenshot (SG Ep. 0.1).
- Cloud-readiness checks (SG Ep. 2.2): uploaded files not in a local folder; the seed is safe to rerun and demo passwords come from environment variables; no development shortcuts in production (no way to pick a user without logging in, no default password on the login page); sessions in the database, not in server memory; the server reads its port from `PORT` and does not bind only to localhost; a readiness endpoint that returns 503 if the database cannot be reached.
- The image must listen on `PORT` at `0.0.0.0`, read all settings from environment variables, and keep no data on the container disk (SG Ep. 3.3).
- Database: PostgreSQL is the kit default. For MySQL or SQL Server change the version and connection settings. A database Cloud SQL does not offer needs a managed option agreed with the lecturer first (SG Ep. 0.4, 5.0).
- Keep as they are unless you know why: Workload Identity Federation, full commit SHA image tag, deploy by digest, the `if` conditions in `deploy.yml`, and additive-only migrations (SG Ep. 0.4).
- Ruleset (SG Ep. 6.5): enforcement Active, empty bypass list, require a PR, one required approval for a team, require status checks with the CI job chosen from the list, require branches up to date. Prove it with a normal (not draft) failing PR from `test/prove-gate`, then close it unmerged (Ep. 6.6).
- Before a release PR into `main`, merge `main` back into staging because the ruleset requires up-to-date branches (SG Ep. 7.4).
- Rollback changes only the app image, not the database (SG Ep. 8).
- Do not merge into `main` while the database is paused. The deploy would fail (SG Ep. 9.3).
- Cost: Cloud SQL is billed for every hour it exists. The guide estimates USD 14–18 per project per month (SG Ep. 1.5). A budget is an alert, not a cap (SG Ep. 10.4).
- Create the budget as alerts only. Do not choose spend cap enforcement, which pauses services (SG Ep. 1.5).

### 8.2 Starter kit (KIT)

**Stack in the kit** (KIT README, `Dockerfile`, `docs/gcp-cicd-guide.md` §1):

- Node.js 24, React 18 with TypeScript and Vite for the client, Express with TypeScript for the server, Prisma 5 for the ORM, PostgreSQL 16.
- The README says every file assumes a Node.js 24 frontend and API in one container with PostgreSQL and Prisma. Application code (`client/`, `server/src/`, `server/prisma/`) is not included.
- GCP services used: Artifact Registry, Cloud Run, Cloud SQL for PostgreSQL 16, Secret Manager, Cloud Build (first manual deploy only), GitHub Actions with Workload Identity Federation.
- Defaults in `deploy/deploy.sh`: region `asia-southeast1`; Cloud SQL `db-f1-micro` with a 10 GB SSD and `--edition=enterprise`; Cloud Run minimum 0 and maximum 3 instances, 1 CPU, 512 MiB, port 3000, public access.

**Layout in the kit:**

| Path | Role |
|---|---|
| `Dockerfile`, `.dockerignore` | Three-stage production image: client build, server build, runtime. API and built SPA in one container on port 3000, running as the non-root `node` user |
| `docker-compose.yml` | Four services: `db` (PostgreSQL with a volume), `migrate` (migrations and seed, then exits), `server` (API on 3000), `client` (nginx on 5173) |
| `client/Dockerfile`, `client/nginx.conf`, `server/Dockerfile`, `server/docker-entrypoint.sh` | Used by compose only. The entrypoint ends with `exec "$@"` |
| `client/.env.example`, `server/.env.example` | Placeholders only |
| `.github/workflows/ci-docker.yml` | Job `test-and-docker`: PostgreSQL service, deploy-script tests, backend install, migrate, seed and `npm test`, frontend `npm ci`, `npm test` and `npm run build`, then `docker build` of the root Dockerfile. Triggers: `workflow_call`, `pull_request` into `main`, `workflow_dispatch` |
| `.github/workflows/deploy.yml` | Workflow "Deploy demo": on push to `main` or manual run. Runs CI, signs in with Workload Identity Federation, builds and pushes the image tagged with the full commit SHA, runs `deploy/release.sh`, runs the smoke test, writes a run summary. Uses environment `demo` |
| `.github/dependabot.yml` | Weekly updates for GitHub Actions |
| `deploy/deploy.sh` | One-time provisioning and first deploy. `DRY_RUN=1` previews. Safe to rerun |
| `deploy/release.sh` | Verify the image, resolve its digest, run the migration job, update the service. Rollback skips the migration |
| `deploy/smoke_test.py` | Read-only checks of the live URL |
| `deploy/teardown.sh` | Deletes the resources |
| `deploy/tests/` | Offline tests for the deploy scripts. CI runs them |
| `docs/gcp-first-lab.md`, `docs/gcp-cicd-guide.md`, `docs/auto-deploy.md` | Guides |

**What the kit expects the project to provide** (so the kit works without changes):

- A `client/` and a `server/` folder, each with `package.json`, `npm ci`, `npm test`, and `npm run build` for the client and the server (CI, Dockerfile).
- Prisma migrations (`npx prisma migrate deploy`) and a seed script `npm run prisma:seed` that is safe to run twice, in `server/` (CI, compose, deploy job).
- The server starts with `node dist/index.js` and listens on `PORT` (3000) (Dockerfile, deploy script).
- The server serves the built client from `/app/client/dist` in the production image (Dockerfile).
- `GET /api/health` returning `{"status":"ok"}`; `GET /api/ready` returning HTTP 200 with `"db":"connected"`, and 503 when the database is unreachable; `GET /` returning HTML; `GET /api/categories` returning a non-empty list. The last one is TokTickIT-specific (smoke test, `docs/auto-deploy.md`).
- Optional login check: `/api/auth/login` returning a `token` field, `/api/auth/me` and `/api/auth/logout`, using a dedicated low-privilege test account and the env var `SMOKE_EMAIL` with the secret `SMOKE_PASSWORD` (smoke test).
- Environment variables the TokTickIT server reads, as SG Ep. 2.3 lists them: `DATABASE_URL`, `PORT`, `NODE_ENV`, `ADMIN_PASSWORD` (required in production), `SEED_DEMO_DATA`, `DEMO_USER_PASSWORD`, `CORS_ORIGIN`, `ALLOW_LEGACY_REQUESTER_HEADER`. The kit's own `server/.env.example` lists only `DATABASE_URL` and `PORT`. The client reads `VITE_API_URL`. Each app documents its own variables (L5 R-02).
- The first administrator is created by the seed with a password from Secret Manager (`ADMIN_PASSWORD`), and the app forces a change at first sign-in (SG Ep. 2.2, 5.6).
- Sessions, users and uploaded files in the database (SG Ep. 2.2, 8).
- GitHub environment `demo`, limited to `main`, with variables `GCP_PROJECT_ID`, `GCP_REGION`, `WIF_PROVIDER`, `WIF_SERVICE_ACCOUNT`. Do not rename them (`deploy.yml`).
- Resource names (`toktickit`, `toktickit-migrate`, `toktickit-pg`, `toktickit-runner`, `toktickit-deployer`, secrets `toktickit-*`) are TokTickIT names to rename together in every file (KIT README, SG Ep. 0.4).
- Names that must not change: the CI job id `test-and-docker`, the environment `demo`, the four variable names (header comments in both workflows).

**Kit notes:**

- The kit's `ci-docker.yml` runs on pull requests into `main` only. SG Ep. 4.2 says to add `staging` to the branch list.
- The kit's Playwright end-to-end specs are not included and were not run against the cloud (`docs/gcp-cicd-guide.md` §4, §7).
- The TA rehearsal ran on 21 Oct 2026 with a billing-enabled test account (`docs/gcp-first-lab.md`, intro).

## 9. Limits on our design and stack

Each row is a requirement from the handouts. "R" means required, "Rec" means recommended.

### 9.1 Product and architecture

| Limit | R/Rec | Source |
|---|---|---|
| Real UI → API or application layer → persistent database workflow. Not a static site, mock-up, generic CRUD demo, or browser-memory-only app | R | GWS §5.1; FD §3.1 |
| Meaningful domain rules and workflows | R | GWS §5.1; D1 §2 |
| Stack is the team's choice. The same stack as Labs 1–4 is encouraged. Explain the choice in the System-Level SDS | R/Rec | GWS §5.1; D1 §3.3 |
| A modular monolith is accepted. Microservices not required. Three layers need not mean three servers or containers | info | GWS §5.1 |
| Persistent database with documented schema, relationships, constraints, migrations or setup, and reproducible demo data | R | GWS §5.1; D1 §3.3 |
| Data must survive an application restart or redeployment | R | GWS §5.1; L5 R-04 |
| Architecture must be packageable with Docker and deployable on GCP | R | GWS §5.1; D1 §3.3 |
| Theme Sprint 1 slice: authentication, authorization, UI, API and database persistence, a meaningful transaction or transition, and a tested business rule. An alternative slice needs instructor or TA agreement | R | GWS §6 |
| Medical diagnosis and treatment advice are out of scope (theme 8) | R | GWS §6.8 |
| Participant histories are private unless the SRS defines consent-based sharing. Managers do not automatically see private records (theme 8) | R | GWS §6.8 |
| No real payment gateway, external messaging service or external API is required. Use synthetic data | info | GWS §5.3 |
| Cloud staging environment, Kubernetes, infrastructure-as-code, custom domains, load balancers, multi-region, canary, monitoring dashboards and load tests are not required in Lab 5 | info | L5 §4.2 |

### 9.2 Authentication and authorization

| Limit | R/Rec | Source |
|---|---|---|
| Login, logout and current-user identity, with a documented session or token lifecycle, from Sprint 1 | R | GWS §5.2; D1 §2 |
| At least two meaningful roles | R | GWS §5.2; D1 §2 |
| Backend enforcement of role permissions. A hidden control, a client-chosen user ID or a role selector does not count | R | GWS §5.2; D1 §3.3, §3.6; FD §3.1 |
| Password hashing when the app manages passwords. No plaintext passwords | R | GWS §5.2; D1 §3.3 |
| Tests for valid and invalid login, unauthenticated access, forbidden role access, and access to another user's data | R | GWS §5.2; D1 §3.6 |
| Role and permission matrix in the design | R | GWS §5.2; D1 §3.3 |
| Seeded demo accounts are enough in Sprint 1. Self-registration, password recovery, email verification, advanced account administration and several roles per account are not required in Sprint 1 | info | GWS §5.2; D1 §2 |
| Framework authentication libraries are allowed | info | GWS §5.2 |
| No way to pick a user without logging in, and no default password on the login page, in production | Rec | SG Ep. 2.2 |
| Sessions stored in the database, not in server memory | Rec | SG Ep. 2.2; L5 §5 |
| Seed demo accounts per role for Lab 6 testers. Passwords from Secret Manager or env vars, never in code, never shown on screen, shared privately | Rec | L5 §5; SG Ep. 2.2, 5.3 |
| Forced password change at first login if admins set default passwords | Rec | SG Ep. 2.2 |

### 9.3 Docker and configuration

| Limit | R/Rec | Source |
|---|---|---|
| Docker packaging is mandatory. A fresh build from a clean clone gives a working container | R | GWS §5.3; L5 R-01 |
| Every setting read from the environment. `.env.example` (or `deployment.md`) documents each variable with placeholders only | R | GWS §5.3; L5 R-02, §4.3 |
| No real secret, `.env`, password, connection string, key or service-account file in Git, the image, logs, screenshots or the PDF | R | L5 §4.3, R-12, §11; D1 §4.4 |
| Required files: `Dockerfile`, `.dockerignore`, `.env.example`, CI and deploy workflows, `docs/labs/lab-05/deployment.md` | R | L5 §4.3 |
| The container listens on `PORT` at `0.0.0.0`, keeps no data on its disk, and reads settings from the environment | R | SG Ep. 3.3 |
| Image has no secret baked in | R | SG Ep. 3.3; KIT `Dockerfile` header |
| Run as a non-root user | Rec | KIT `Dockerfile` |
| A readiness endpoint that checks the database, for the smoke test | Rec | SG Ep. 2.2, 5.0 |

### 9.4 CI

| Limit | R/Rec | Source |
|---|---|---|
| Build and automated tests run on every relevant PR | R | GWS §5.3; L5 R-05 |
| A failed required check must not enter the release path. Prove it with a failing PR from a temporary branch | R | GWS §5.3, §10; L5 R-06, C-02 |
| CI runs on every PR into staging and `main` | R | L5 §11 |
| CI becomes mandatory in Lab 5 and stays mandatory afterwards. Lab 7 uses the run history | R | GWS §8.3; L5 R-10 |
| Do not break the released app to demo the gate. Use a temporary branch | R | GWS §10; L5 R-06 |
| Required check name must match the CI job name. KIT job name is `test-and-docker` | Rec | SG Ep. 4.2, 6.5 |
| Ruleset on `main`: Active, empty bypass list, PR required, required check chosen from the list, branch up to date | Rec | SG Ep. 6.5 |
| A normal PR, not a draft, to prove the gate | Rec | SG Ep. 6.6; KIT `docs/auto-deploy.md` |
| Pin GitHub Actions to a full commit SHA; Dependabot for updates | Rec | L5 §5; KIT |

### 9.5 GCP and deployment

| Limit | R/Rec | Source |
|---|---|---|
| Deployment on GCP is mandatory. Public URL; the domain workflow works there through UI, API and database | R | GWS §5.3; L5 R-03 |
| Accepted releases deploy from `main` through a repeatable pipeline. A documented manual approval inside the pipeline is allowed | R | GWS §5.3; L5 R-07 |
| Identify the commit of each release and document the procedure | R | L5 R-08 |
| Release path: reviewed change → CI → merge → deployment. Only `main` deploys | R | L5 R-07, §9; SG Ep. 0.1 |
| One GCP project for Lab 5, 6, 7 and the Final Project. Same app, project and pipeline throughout | R | L5 §1, §4.4 |
| GCP access through one member's personal Gmail Free Trial. Not a university account. No prepayment. No Upgrade | R | L5 §4.4; SG Ep. 1.1 |
| The deployment stays available through grading | R | GWS §11; D2 §4.2; FD §4.2; L5 §12 |
| The deployed version must match the tag or commit and the CI run | R | D2 §3.5; FD §2 |
| Reference stack: Artifact Registry, Cloud Run, Cloud SQL for PostgreSQL, Secret Manager, GitHub Actions. Choosing something else means adapting the kit and writing the choice in `deployment.md` and the SDS | Rec | L5 §5; SG Ep. 0.2 |
| Database outside PostgreSQL, MySQL and SQL Server is not offered by Cloud SQL. Agree a managed option with the lecturer first | Rec | SG Ep. 0.4, 5.0 |
| Workload Identity Federation, no JSON keys; least-privilege service accounts | Rec | L5 §5; SG Ep. 6 |
| Image tag is the full commit SHA; deploy by digest | Rec | L5 §5; SG Ep. 0.4 |
| Migrations additive, run in a separate job before the service update | Rec | L5 §5; SG Ep. 0.4 |
| Automated read-only smoke test after each deploy. Do not use the admin account | Rec | L5 §5; SG Ep. 5.0, 7.3 |
| Rollback by redeploying an earlier image tag | Rec | L5 §5; SG Ep. 8 |
| Cost control: budget alert first, Cloud Run minimum instances 0 and maximum 3 or fewer, smallest Cloud SQL tier, storage auto-increase off, pause when idle, teardown at the end | Rec (strongly) | L5 §5; SG Ep. 1.5, 5.4, 9, 10 |
| Public Cloud Run access (`--allow-unauthenticated`) is needed for the demo | Rec | KIT `deploy.sh` step 11; SG Ep. 5.0 |

### 9.6 Testing

| Limit | R/Rec | Source |
|---|---|---|
| Automated tests at three levels: unit for important logic, API and database integration for persistence and permissions, UI or end-to-end for selected critical journeys | R | GWS §8.2; D1 §3.5 |
| Tests for domain rules, persistence and access restrictions | R | D1 §2 |
| Negative and boundary tests | R | GWS §8.2; D1 §3.5 |
| TDD for meaningful rule, defect or change work, with a failing test shown before the fix | R | GWS §8.2; D1 §3.5 |
| No stub assertion, mock-only persistence demo, screenshot or AI claim as evidence | R | GWS §8.2 |
| Required tests stay enabled and meaningful. Failed and skipped tests are reported | R | D1 §3.6; D2 §3.5; FD §3.4 |
| Each AC linked to a planned test ID and an actual test file and name | R | GWS §8.2; D1 §3.5, §4.2 |
| Run the build and tests on the submitted commit and keep command, counts, results and commit | R | D1 §3.6; D2 §4.2; FD §3.4 |
| Independent UAT (Lab 6) reused in the final QA | R | FD §3.4 |
| Regression tests across features, shared data, roles and calculations | R | D2 §3.5; FD §2 |
| Manual checks may supplement but not replace automated coverage | R | GWS §8.2; D1 §3.6 |

### 9.7 Repository and process

| Limit | R/Rec | Source |
|---|---|---|
| GitHub Issues and a project board, feature or fix branches, PRs, teammate review, sprint staging or integration branch, versioned engineering documents | R | GWS §5.3 |
| Branch from the current sprint staging branch. PR into sprint staging. Release PR from staging into `main` | R | GWS §8.3; D1 §3.6; L5 R-09 |
| Authors do not approve their own PRs. Reviews state a specific check, question, finding or reason | R | GWS §8.3; D1 §3.6; L5 R-09 |
| Never commit directly to staging or `main` | Rec | SG Ep. 0.1 |
| Each Issue links to its requirement, feature and contract, branch and PR | R | GWS §8.3; D1 §3.6 |
| Contract written before implementation. Revisions stay visible and justified. History not rewritten | R | GWS §7, §8.3; D1 §3.5; L5 R-10 |
| Label Lab 5 Issues and PRs, for example `lab5` | R | L5 R-10 |
| Do not delete or rewrite commits, contract revisions or CI runs | R | L5 R-10 |
| Both students take part in all areas. Record it in Issues, commits, PRs and a contribution table | R | GWS §2; L5 R-11; D1 §3.6 |
| Repository public until grading ends (Lab 5) | R | L5 R-12 |
| Repository and release stay accessible. Later commits must not silently replace the assessed version | R | D1 §4.3; D2 §4.2; FD §4.2 |
| Release recorded with a tag or commit | R | GWS §8.3; D1 §3.6 |
| Keep a short AI-use declaration | R | GWS §8.4; D1 §4.2; FD §4.1 |
| Student names and IDs go in the submitted PDFs (and the Lab 5 PDF also needs GitHub usernames). Repo rule in `CLAUDE.md` keeps IDs out of the public repository | R | D1 §4; D2 §4; FD §4; L5 §12 Part 0 |
| Safe test accounts through the private course handoff or a documented local seed. Synthetic data. No real passwords, tokens or secrets in the PDF or Git | R | D1 §4.4; D2 §4.2; FD §4.2 |

### 9.8 Documents

| Limit | R/Rec | Source |
|---|---|---|
| SRS with stable FR, BR and measurable NFR IDs, actors, scope, exclusions, assumptions, decisions | R | GWS §8.1; D1 §3.1 |
| Feature inventory and requirement → feature → sprint traceability matrix | R | GWS §8.1; D1 §3.2 |
| System-Level SDS: stack, data model, UI structure, API approach, roles and permissions, configuration, planned deployment | R | GWS §8.1; D1 §3.3 |
| Three-sprint plan | R | D1 §3.4 |
| Sprint feature contracts: feature SDS, UI/API/data specs, AC, STS, DoD | R | GWS §8.2; D1 §3.5 |
| README with dependencies, env var examples, database setup, migrations, seed, run, build and test commands | R | D1 §4.4; D2 §4.2; FD §4.2 |
| `docs/labs/lab-05/deployment.md` | R | L5 §4.3 |
| Evidence index for every assessment | R | GWS §11 |
| Submitted PDFs must hold the full documents. A repository link does not replace them | R | D1 §4; D2 §4; FD §4 |

## 10. Design questions the handouts require us to answer

These are questions only. This file gives no answers and no recommendations. The team answers them in Issue #3 and in the SRS and SDS.

### 10.1 Context and scope

1. Which theme and context does the team use? If it is theme 8, which routine does the product cover: study habits, exercise, sleep, or another? (GWS §6, §6.8)
2. Who are the stakeholders, what problem do they have, and what are the actors and their responsibilities? (D1 §3.1)
3. What is in scope, and what is explicitly out of scope? (D1 §3.1; GWS §6.8)
4. Which ambiguities in the brief need an answer from the instructor or TA? Which are decided by the team and recorded? (GWS §6; D1 §3.1)
5. Is the Sprint 1 slice the handout's example, or an alternative that needs instructor or TA agreement? (GWS §6)

### 10.2 Domain rules (theme 8 brief)

6. Which dates does the product use (entry dates, goal start and end), and which entry dates are valid? Are past or future dates allowed? (GWS §6.8)
7. Which units exist, and what valid range applies to an activity template and to an entry? (GWS §6.8)
8. What is the duplicate-entry rule: one entry per day, or accumulation within a day? What happens on a second entry? (GWS §6.8)
9. How is a goal defined and changed, and what happens to earlier progress when it changes? Which goal changes belong to Sprint 1 and which to later sprints? (GWS §6.8)
10. How is progress computed and shown? (GWS §6.8)
11. What does history show, and what does a streak mean? (GWS §6.8)
12. What is a reminder or schedule representation, and what does "placeholder" mean for this product? (GWS §6.8)
13. Who can create, edit and retire activity templates? Can a participant see or copy a template? (GWS §6.8)
14. Is any sharing of participant history defined? If so, how is consent given and withdrawn? If not, what may a manager see? (GWS §6.8)
15. Which business rules (BR) follow from the answers above, and how will each be tested? (D1 §3.1)
16. What is the rule for each state change or transition in the product, and which transitions are invalid? (GWS §6; D1 §3.5)

### 10.3 Requirements and plan

17. Which FR, BR and NFR does the product have, and what are their stable IDs? (D1 §3.1)
18. Which NFR matter, what is each measurable target, how is it verified, and in which sprint? (D1 §3.1)
19. Which features cover each requirement, and which sprint builds and verifies each? Are there cross-cutting requirements? (D1 §3.2)
20. What is the goal of each of the three sprints, which feature IDs go in each, and what depends on what? (D1 §3.4)
21. Is the Sprint 1 scope small enough to finish by 8 Nov and large enough to match the theme's example? (D1 §3.4; GWS §6)
22. What does "done" mean for a feature and for the product (Product Definition of Done)? (D1 §3.5)

### 10.4 Architecture and data

23. Which stack does the team use for the UI, the API or application layer, and the database, and why? Does it match the stack used in Labs 1–4? (GWS §5.1; D1 §3.3)
24. Does the stack fit the Lab 5 expectations: Docker packaging, GCP deployment, a database that Cloud SQL offers or an agreed alternative, build and test commands CI can run? (GWS §5.1, §5.3; SG Ep. 0.4, 5.0)
25. How do the layers communicate, and where are business rules enforced? (D1 §3.3)
26. Which entities, fields, relationships, constraints and ownership links does the data model have? (D1 §3.3)
27. How are the database set up, migrated and seeded so that demo data is reproducible? (GWS §5.1; D1 §3.3)
28. Which screens and navigation exist, and how do validation, loading, empty and error states look? (D1 §3.3)
29. What are the API conventions: endpoints, request and response shapes, validation, and safe error handling? (D1 §3.3)

### 10.5 Authentication and access

30. Which roles exist, and what does the role and permission matrix say for each protected operation and record? (GWS §5.2; D1 §3.3)
31. How are credentials handled and passwords hashed? Which session or token design is used, how long does it last, how is the current user retrieved and how does logout work? (GWS §5.2; D1 §3.3)
32. Where are sessions stored so a new container or a redeploy does not log users out? (SG Ep. 2.2)
33. Which seeded accounts exist for each role, and how are their passwords kept out of code and shared privately with testers? (D1 §4.4; L5 §5; SG Ep. 2.2)
34. How is "another user's protected data" defined here, and how is it tested? (GWS §5.2, §6.8)

### 10.6 Configuration, deployment and delivery

35. Which environment variables does the app read, which are secret, and where does each value come from locally and on GCP? (D1 §3.3; L5 R-02, §4.3)
36. Which GCP components does the team plan to use, and which names, project and region? (D1 §3.3; L5 §4.3)
37. Which member owns the GCP project and billing, and who is in IAM and in the GitHub repository settings? (L5 §4.4; SG Ep. 1, 6)
38. Which endpoint shows the app is running and can reach its database, and what does the smoke test check? (SG Ep. 2.2, 5.0, 7.2)
39. Which command builds, tests, migrates, seeds and runs the app locally and in a container? (D1 §4.4; L5 §4.3)
40. What does CI run on each PR, what is the required check named, and which branches does it protect? (L5 R-05, R-06, §11; SG Ep. 4.2, 6.5)
41. What is the release procedure, how is the running commit identified, and how is a bad release handled? (L5 R-07, R-08)
42. Is a manual approval step used in the pipeline? (GWS §5.3; L5 R-07)

### 10.7 Testing and process

43. Which test levels and tools does the team use for unit, API and database integration, and UI or end-to-end tests? (GWS §8.2; D1 §3.5)
44. How does each AC map to a test ID and an actual test, and how are failing-first runs kept as evidence? (GWS §8.2; D1 §3.5, §4.2)
45. Is there one `staging` branch for all sprints, or one per sprint? (GWS §8.3; L5 R-09) See O-2.
46. How are Issues, the project board and labels set up (including `lab5`), and how do Issues link to features and contracts? (L5 R-09, R-10; GWS §8.3)
47. How will each student's part in requirements, testing, AI supervision, implementation, review and deployment be recorded? (GWS §2; L5 R-11)
48. How will AI use be recorded in the short declaration? (GWS §8.4)
49. Which evidence goes into each PDF part, and where is it kept in the repository? (GWS §11; D1 §4)

## 11. Open points

Each point is a place where a handout is unclear, or two handouts disagree. Both sources are given. No choice is made here.

| ID | Open point | Sources |
|---|---|---|
| O-1 | The handouts do not name the team's theme. They say the theme follows a student ID digit. The repository name suggests theme 8. Confirm with the partner | GWS §6 |
| O-2 | One staging branch or one per sprint. GWS and D1 say "current sprint staging branch" and "sprint staging". L5 and SG say "staging" and "Your sprint's staging branch: staging". ADR 0001 records the team's proposal and says to confirm with a TA | GWS §8.3; D1 §3.6; L5 R-09; SG "How to use this guide" |
| O-3 | Final demo video length. FD Part E heading says "Maximum 4 minutes". FD §2 says "at most 10 minutes". GWS §9 says "Maximum 10 minutes" | FD §2, §3.5; GWS §9 |
| O-4 | Final video points and report parts. GWS §9 gives the video 8 points and a one-page release summary 2 points. FD gives the video 10 points and has no separate summary part | GWS §9; FD §1 |
| O-5 | Final video content. GWS §9 lists live workflows, a rejected case, brief architecture, test and CI, and a traceability example, and later "one business rule, one failure or access case, one requirement-to-test chain". FD §3.5 lists major workflows, a business rule and a rejected or failure case, and does not list architecture, CI or traceability | GWS §9; FD §3.5 |
| O-6 | Final PDF parts. GWS §9 lists the final report as an evidence index that includes the release summary. FD §4.1 asks for complete SRS, SDS and all contracts in appendices | GWS §9; FD §3.3, §4.1 |
| O-7 | Lab 5 timing. GWS §4 lists "Lab 5: CI/CD, Docker, GCP deployment" next to the 3 and 5 Nov workshop, with no date of its own. L5 says its sessions are 3 and 5 Nov, which is before D1 is due on 8 Nov. L5 §1 starts from "your accepted Sprint 1 release", and SG Ep. 2 needs "the Sprint 1 app runs locally" | GWS §4; L5 cover table, §1; SG Ep. 2 |
| O-8 | Lab 6 and Lab 7 have no handout yet. Only GWS §10 describes them | GWS §10, §12 |
| O-9 | Whether the merge gate must cover staging. GWS §5.3 says a failed check must not enter the "normal release path". L5 §11 says CI runs on every PR into staging and `main` and "a failed required check blocks the merge". SG Ep. 6.5 sets the ruleset on `main` only | GWS §5.3; L5 §11; SG Ep. 6.5 |
| O-10 | SG Ep. 6.5 step 5 offers "Include default branch" or a pattern `main`. ADR 0001 says `staging` is this repository's default branch | SG Ep. 6.5; ADR 0001 |
| O-11 | Number of required approvals. SG Ep. 6.5 says 1 for a team. L5 R-06 does not state a number. L5 R-09 requires teammate review | SG Ep. 6.5; L5 R-06, R-09 |
| O-12 | GCP access method. GWS §5.3 says it comes in the Lab 5 instructions. SG Ep. 1.1 says "Use the access method your instructor announces". L5 §4.4 says a personal Gmail Free Trial | GWS §5.3; SG Ep. 1.1; L5 §4.4 |
| O-13 | Branch names in SG examples (`refactor/2-...`, `build/3-...`, `ci/4-...`, `feature/...`) differ from the repo rule in `CLAUDE.md`. SG says to use the team's style and keep the Issue number | SG Ep. 2.1, 3.2, 4.1 |
| O-14 | KIT `ci-docker.yml` has one job, `test-and-docker`. KIT `docs/gcp-cicd-guide.md` §6 Part A names three checks: Backend Test, Frontend Test and Build, Docker Build | KIT `docs/gcp-cicd-guide.md` §6; KIT `.github/workflows/ci-docker.yml` |
| O-15 | Alternative vertical slices need instructor or TA agreement, and so do ambiguities in the brief. The handouts do not say how to ask or how long a reply takes | GWS §6 |
| O-16 | D1 and GWS require both students' IDs in the PDF. The repository is public. `CLAUDE.md` forbids student IDs in the repository | D1 §4; GWS §11; `CLAUDE.md` Safety |
