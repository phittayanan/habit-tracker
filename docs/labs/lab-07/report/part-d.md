# Part D: Release readiness and retrospective

The texts were reviewed by projectnewy in PR #163 (records R-163 in the Appendix): changes requested on `daefb86`, then approved on `7452f46`.

## D.1 Release readiness

{{include:../readiness.md|## 2.}}

## D.2 Technical debt

{{include:../readiness.md|## 3.}}

## D.3 Retrospective

{{include:../readiness.md|## 4.}}

## D.4 Contribution

| Part | Issue / PR | Done by | Reviewed and merged by |
|---|---|---|---|
| A. Change request and contract | #139 / PR #143 | projectnewy | phittayanan |
| B. Tests and implementation | #140 / PR #146 | phittayanan | projectnewy (changes requested, then approved) |
| B. Release, deploy and post-deployment checks | #141, #148 / PR #149, #147, #162 | projectnewy | phittayanan |
| C and D. Metrics, readiness, retrospective | #142 / PR #163 | phittayanan | projectnewy |
| This PDF | #166 / PR #169 | phittayanan | projectnewy |

## D.5 AI-use declaration for Lab 7

Both students used Claude Code (an AI coding agent) for every part of Lab 7. The agent drafted documents, tests, code, reviews and this PDF, and ran commands; the students made every decision listed below, approved each review before it was posted, and merged every PR. Each review in the Appendix says in its first line that it was drafted with Claude Code. The full log is `docs/ai-use.md` (rows for #139 to #142, #148 and #164 to #166).

| Part | Issue | What Claude Code did | What the students decided and checked |
|---|---|---|---|
| A. Contract | #139 | Created the Lab 7 Issues; proposed three change topics; wrote ADR 0061, the change request and the revised SRS, SDS, F-08, F-09 and STS rows; proposed OP-08.9 to OP-08.12; revised them after the PR #143 review. Changed no code and ran no test | projectnewy chose the change, the day-total limit and the unchanged target rule, and accepted the proposals; phittayanan reviewed and approved the contract twice before any test or code |
| B. Tests and code | #140 | Wrote the new and revised tests and ran them failing on the old code, then wrote the migration, the rule and the page change; ran both suites; fixed TC-89 for Windows after the review | phittayanan chose to start and asked for the PR #143 discussion to be read first; projectnewy reviewed the code and tests; the Windows re-run for that review (by Claude Code, for projectnewy) found the TC-89 failure |
| B. Release and checks | #141, #148 | For projectnewy: drafted the reviews of PR #145 and #146, opened the release and sync PRs, read the deploy log, pushed tag `v1.5` after approval, gave the steps of the signed-in checks and judged the screenshots, wrote `release.md`. It did not sign in, type a password or change anything in Google Cloud | projectnewy took the database backup, ran the signed-in checks by hand and typed the passwords, and approved each posting and release step; phittayanan reviewed and merged PR #147 and #149 |
| C, D. Metrics and readiness | #142 | Read the PR, review, CI and deploy data; proposed metric sets, readiness evidence, debt items and owners in Thai; computed the values; wrote `readiness.md`; translated phittayanan's retrospective answers; fixed the six PR #163 findings | phittayanan chose the five metrics, READY, the debt items, the action and the owners, and answered the retrospective; projectnewy answered the retrospective (drafted with Claude Code and reviewed by projectnewy) and reviewed the file |
| This PDF | #166 | With phittayanan's permission read the Lab 7 sheet on LEB2; adapted the Lab 6 builder; wrote the parts and the records script; built and checked the PDF | phittayanan chose the layout and what to cut; projectnewy checks the PDF against the sheet (PR #169 review); the students type their names and student IDs into a file outside Git |

## D.6 Known limitations

{{include:../readiness.md|## 7.}}

Limits of the post-deployment checks (B.4, section 4):

- They were manual checks in a browser, run by projectnewy, not automated tests.
- The times are when Claude Code received each screenshot, by a computer clock about 10 minutes ahead of GitHub; they are not capture times.
- Most screenshots do not show the address bar; E-PD-09, E-PD-11 and E-PD-12 show the URL but not the signed-in account.
- The data that existed before the release was not compared row by row with the data after the migration.
