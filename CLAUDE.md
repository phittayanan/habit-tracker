# Team workflow (read first)

Two students build this CPE 334 group project with Claude Code. The product lives in `docs/`; this file holds only the working rules. Work goes step by step: each step waits for a human review.

## Branches and PRs
- One Issue -> one branch -> one PR. Branch from `staging` and name it `feat/|fix/|docs/|chore/<issue-number>-<slug>`.
- Open the PR into `staging`. Only the release PR goes from `staging` into `main`, with a tag.
- Never push to `main` or `staging`. Never force push. Push only your own branch.
- Never merge or approve your own PR. The teammate reviews it, and the review must state a specific check, question, finding or reason ("LGTM" does not count).
- Fill in every part of the PR template: Issue link, feature/AC IDs, what changed, tests run with output, reviewer check.

## Spec and tests first
- Write or update the spec in `docs/` first, then a failing test, then the code. Commit them in that order so the history shows the test failing before the fix and passing after.
- Keep `docs/traceability.md` in step with the feature and test IDs you touch.
- No Issue, no work: if the task has no Issue, ask the human to create one.

## Decisions
- Ask the human before any product or design decision (requirements, scope, UI, stack, data model). Do not decide it yourself or fill gaps with guesses. Record the answer in `docs/decisions.md`.
- Do not run ahead: finish the current step, open the PR, and stop for review.

## AI use
- Record AI use in `docs/ai-use.md`: what the AI did, what the human checked or changed.

## Safety
- The repo is public. Never commit secrets, real passwords, tokens, `.env` files or student IDs. Use `.env.example` with fake values.
- `.claude/settings.local.json` is personal and stays out of git.

## Where things are
- Product and design: `docs/` (`srs.md`, `features.md`, `traceability.md`, `system-sds.md`, `decisions.md`, `ai-use.md`, `report.md`, `sprints/`).
- Issue and PR forms: `.github/`.
