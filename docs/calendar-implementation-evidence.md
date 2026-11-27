# Month calendar implementation evidence (Issue #155)

Contract: [F-11](sprints/sprint-2/F-11-month-calendar.md), with ADR 0063 to ADR 0074 and ADR 0097. Run on macOS 27.2, Node.js 26.8, local PostgreSQL with a test database used only by this worktree (ADR 0094 rule 5), and Google Chrome (`PLAYWRIGHT_CHANNEL=chrome`). The browser tests ran on port 33155 through a local config that is not committed, because `client/playwright.config.js` hard-codes 33132 and the #158 worktree uses it. TC-73 has 33132 hard-coded in its own request context, so it was run separately on 33132 when nothing else was listening there. Run by Claude Code; not yet run in CI.

## Before the change (tests committed in 91a930e, before any code)

- Server suite on `staging` (650cde2): 113 tests, 113 pass.
- New and changed server tests (`server/test/calendar.test.js`: TC-120, TC-121; `server/test/client.test.js` with `/calendar`) against the unchanged code: 6 tests, 0 pass, 6 fail.
- Browser suite with the new `client/test/calendar.spec.js` and the changed Sprint 1 login steps, against the unchanged code: 70 failed, 12 passed, 4 skipped.
- 3455050, still before the code, fixed two test steps: the month helper now waits for each month change, and the goals TC-47/TC-48 needs one more Tab for "Calendar". It has no red run of its own.
- After the independent check, new tests in 8ba370c (keyboard Discard, focus inside the phone box, focus after a day becomes full, Minutes 0 to 59, the time bar by keyboard) ran red against the code of ffc88f0: `calendar.spec.js` 18 passed, 5 failed, 5 skipped. 8c2cd29 then made TC-115 answer the Discard question before it opens Sleep.

## After the change

Tested code commit: 3d31bb1 (later commits change documents only).

| Command | Result |
|---|---|
| `npm test` in `server/` | 118 tests, 118 pass, 0 fail, 0 skipped |
| `npx playwright test` in `client/` (Chrome, port 33155) | 83 passed, 5 skipped, 2 failed: TC-73 at both widths, `connect ECONNREFUSED 127.0.0.1:33132`, because its request context is hard-coded to 33132 |
| `npx playwright test test/templates.spec.js -g TC-73` (standard config, port 33132) | 2 passed |

The 5 skipped cases are width-specific: TC-36 and the desktop TC-116 case run at 1280 px only; TC-111, the phone TC-116 case and the keyboard Discard case at 375 px only.

## AC results

| AC | Test (file) | Result |
|---|---|---|
| AC-11.1 | TC-36 (`calendar.spec.js`) | pass at 1280 px |
| AC-11.2 | TC-110 | pass; the List step waits for #156 (ADR 0097) |
| AC-11.3 | TC-111 | pass at 375 px; the future-day step runs only when tomorrow is in this month |
| AC-11.4 | TC-36, TC-112, TC-120 | pass |
| AC-11.5 | TC-36 (desktop), TC-111, TC-116 | pass |
| AC-11.6 | TC-113, TC-47/TC-48 | pass |
| AC-11.7 | TC-114 (keys and pointer) | pass |
| AC-11.8 | TC-115 | pass |
| AC-11.9 | TC-116 (phone and desktop) | pass |
| AC-11.10 | TC-113, TC-115 (card total and entries) | pass; sign and colour are TC-117, which runs in #156 (ADR 0097) |
| AC-11.11 | TC-120, TC-121 (`calendar.test.js`) | pass; `state` is `null` on every day until #156 |
| AC-11.12 | Three TC-47/TC-48 tests (`calendar.spec.js`): counter and Other amount; time bar, Check in and Exact; Keep editing and Discard with focus kept in the phone box | pass at 375 and 1280 px (the Discard test at 375 px) |
| AC-11.13 | TC-130, and the Sprint 1 tests with only the ADR 0073 point 4 steps changed | pass |

## Sprint 1 tests that changed (ADR 0073 point 4)

- After a Participant logs in, the address is `/calendar`. The login helpers in the goals, progress, template-kind, entries and goal-change specs then open "Goals" from the menu; the auth and templates helpers expect `/calendar`.
- TC-07: the Participant's menu is "Calendar", "Goals", "Templates". The auth and templates TC-47/TC-48: Tab reaches "Calendar" before "Goals". The goals TC-47/TC-48: one more Tab to reach "+ New goal".
- `server/test/client.test.js`: the built client also serves `/calendar`.

The checks on the goals page itself did not change.

## Choices the contract does not spell out (drafted by Claude Code, accepted by phittayanan on 2026-11-27)

1. The − / + buttons are named "One less" and "One more".
2. The counter shows "+2" and "total 12 / 8"; the time bar shows "+45 min" and "total 7 h 25 min", with a mark at the target.
3. A card lists its entries on one line, newest first: "2 · 3".
4. Cards are in the order the goals were created, oldest first.
5. On the current month › is disabled, not hidden.
6. Cancel on the time bar drops the amount without the ADR 0067 question (the question is for closing the box or choosing another day).
7. A full past day says "2026-11-26 is full (12 glasses)." with the F-08 wording.
8. On desktop the panel keeps its chosen day while other months are shown.
9. A tap on a bar segment fills up to the end of that segment (with 6 h 40 min logged, a tap on the 7 h segment adds +20 min); the arrow keys add 15 minutes each.
10. One card's input is open at a time; opening another card's input with an unsaved amount asks the ADR 0067 question.
11. `GET /api/calendar` answers `400 VALIDATION_ERROR` "Month must be YYYY-MM.", also for an empty or repeated `month`.
12. A Minutes value outside 0 to 59 shows "Minutes must be 0 to 59." and is not sent (written into contract section 4).

Items 1 to 8 were accepted after phittayanan looked at the screenshots; items 9 to 12 were accepted one by one in the same session.

## Independent check before review

Two read-only subagents checked the branch at ffb3112: Claude Sonnet checked the claims in the changed documents against their sources, and Claude Opus checked the branch against Issue #155, the F-11 contract and ADR 0073 and ADR 0097. Claude Code verified each finding against the code before changing anything.

- Fixed: focus was lost after "Keep editing" and after a save that fills the day, and Tab could leave the phone box (now kept inside); the Minutes box took values above 59; the keyboard tests did not cover the time bar, the Exact row or the Discard question; ADR 0097 said "chip" where the contract says "sign"; this file did not mention 3455050; a stray test comment.
- Recorded here, not changed: the pointer behaviour of the bar (item 9), the red run for 3455050, the busy files shared with PR #179.
- Not fixed: if the read after a 201 fails, the card shows the read error although the entry was saved; the next read shows it.

## Screenshots (for the D2 PDF)

| Phone: calendar | Phone: count input | Phone: time bar | Desktop: count input | Desktop: time bar |
|---|---|---|---|---|
| ![](sprints/sprint-2/img/f11-built-375-calendar.png) | ![](sprints/sprint-2/img/f11-built-375-count.png) | ![](sprints/sprint-2/img/f11-built-375-time.png) | ![](sprints/sprint-2/img/f11-built-1280-count.png) | ![](sprints/sprint-2/img/f11-built-1280-time.png) |

Not done: no day colour, sign or chip (Issue #156); no deploy; not run on Windows or in CI; the screens were not checked by a person with a screen reader.
