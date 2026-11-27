# Template retire implementation evidence (Issue #152)

Contract: [F-05](sprints/sprint-2/F-05-template-retire.md) (ADR 0017, ADR 0078, ADR 0079). No migration: `Template.state` already exists. Run on Windows 11, Node.js 24.14.0, PostgreSQL 16 in a temporary Docker container used only by this worktree, Playwright's Chromium for the browser tests. Run by Claude Code; not yet run in CI.

## Before the change

- Existing suites on `staging` (650cde2): `npm test` in `server/` 113 tests, 113 pass; `npm test` in `client/` 62 passed.
- New server tests (`server/test/template-retire.test.js`) against the unchanged code: 10 tests, 0 pass, 10 fail. The retire request got 404, a goal on a retired template got 201 or a target rule code, and the protected route was not listed.
- New browser tests (`client/test/template-retire.spec.js`) and the changed TC-11, at 375 px and 1280 px: 8 failed. There was no Retire button.
- The failing tests are commit c37ccb9.

## After the change (commit 39a4f38)

| Command | Result |
|---|---|
| `npm test` in `server/` | 123 tests, 123 pass, 0 fail, 0 skipped |
| `npm test` in `client/` | 68 passed |

| Test | File |
|---|---|
| TC-14, TC-15, TC-19, TC-140, TC-142 | `server/test/template-retire.test.js` |
| TC-141, TC-143 | `client/test/template-retire.spec.js` |
| TC-08 | the route audit in `server/test/auth.test.js`; the listing of the new route is asserted in `template-retire.test.js` |

Added beyond the contract's steps, under the same test numbers: the refusal order of goal creation (TC-15); a goal creation that waits for the lock while the template is retired (TC-142); TC-142 (b) and (c) run 10 rounds each; the API messages of a rejected retire and of a goal form opened earlier (TC-141, contract section 6).

## Sprint 1 tests that changed

- TC-11: the active row has "Retire", and the retired row has no button. This replaces "no Retire control" and the count of two Edit buttons (F-03 section 6, ADR 0079). The column headers are unchanged.

## Choices the contract does not spell out

1. "Retire" sits under "Edit" in the same last column, whose header stays "Edit".
2. In the dialog, focus starts on "Cancel".
3. While the request runs, "Cancel" and Escape are disabled too, so that nothing looks like a cancel of a request already sent.
4. A rejected request shows the API message inside the open dialog.
5. After a successful retire the row has no button left, and focus is not moved to another control. Changed after the review, see below.

## After the review of 16a615e (PR #179)

phittayanan approved with one finding: after a successful retire, focus fell to the page body. projectnewy chose to move it to the row's "Retired" cell (ADR 0095, which replaces choice 5; contract section 6 and TC-143 updated in 947de5e).

| Step | Result |
|---|---|
| TC-143 with the new focus expectation, before the fix (e39b9b4), 375 px and 1280 px | 2 failed: the cell was not focused |
| `npm test` in `client/` after the fix (a8aabec) | 68 passed |
| `npm test` in `server/` (a8aabec) | 123 tests, 123 pass, 0 fail, 0 skipped |

Screen reader behaviour was not tested.

Not done: no deploy; the screens were not checked by a person; Claude Code looked at screenshots at 375 px and 1280 px.
