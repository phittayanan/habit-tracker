# Team workflow (read first)

Two students build this CPE 334 group project with Claude Code. The product lives in `docs/`; this file holds only the working rules. Work goes step by step: each PR waits for the teammate's review, and you may start your next own Issue meanwhile (ADR 0057).

## Branches and PRs
- One Issue -> one branch -> one PR. Branch from `staging` and name it `feat/|fix/|docs/|chore/<issue-number>-<slug>`.
- Open the PR into `staging`. Only the release PR goes from `staging` into `main`, with a tag.
- Commit titles use Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`. GitHub's merge-commit titles are exempt.
- Busy files (ADR 0094): database schema, `package.json`, route index, `docs/ai-use.md`, plus every file an open PR also changes (shared docs such as `docs/traceability.md`, `docs/system-sds.md`, `docs/srs.md` included). When starting an Issue, name each overlap with its PR number, and check again before asking for review. When an open PR on the same files is approved or will merge first, wait for it to merge, then update your branch from `staging` once; the PR that merges second fixes the conflicts, including renumbering a clashing ADR. If that PR is still not merged and your work waits on it, the two students may agree a new order in the thread.
- One worktree per Issue (ADR 0094), for parallel work with no open blocker: each Issue gets its own git worktree folder and Claude session; never switch branches in a folder that holds another Issue's work. Its branch follows the name rule above (rename an auto-made `claude/...` branch before the first push). After the PR merges, remove the worktree and its local branch. Worktrees that run tests at the same time use separate test databases.
- Never push to `main` or `staging`. Never force push. Push only your own branch.
- Never merge or approve your own PR. The teammate reviews it, and the review must state a specific check, question, finding or reason ("LGTM" does not count).
- Before asking the teammate for a review, read their status: `gh variable get TEAM_STATUS_<LOGIN>` (ADR 0062). If it is AFK, sleep or out, or missing, tell the author the status and how old it is; the author decides whether to send the request now or wait. Warn when a status is over 12 hours old.
- Review format (ADR 0055, ADR 0085): first line says "AI-assisted" once; the review names the reviewed commit once. "What I checked": at most 5 numbered items, the checks you made yourself or that found something; routine checks (CI green, commit IDs match) share one line; a check may name its file, line numbers only in findings. Plus one "Not checked / not run" line, outside the 5. Then "Findings", each labelled `issue (blocking)` (must change before merge; the review is "Requesting changes"), `issue` (change in this PR, or the author says why not), `suggestion` (optional) or `question` (needs an answer in the thread).
- Moving Issue cards on board 12 is the agent's job: move the card at each event in ADR 0055 and read it back. People do not move cards.
- Fill in every part of the PR template: Issue link, feature/AC IDs, what changed, tests run with output, reviewer check.

## Spec and tests first
- Write or update the spec in `docs/` first, then a failing test, then the code. Commit them in that order so the history shows the test failing before the fix and passing after.
- Keep `docs/traceability.md` in step with the feature and test IDs you touch.
- No Issue, no work: if the task has no Issue, ask the human to create one.

## Decisions
- Ask the human before any product or design decision (requirements, scope, UI, stack, data model). Do not decide it yourself or fill gaps with guesses. Record each decision as its own file in `docs/adr/` (`NNN-short-name.md`); take the next number free on `staging` and in every open PR, and recheck before asking for review (ADR 0094).
- Work until blocked (ADR 0057, ADR 0094): add a "blocked by" link when an Issue needs another merged first, also when an ADR lets its PR open before the other merges; after opening a PR, start your next own Issue that has no open "blocked by" Issue, branched from `staging`. At most 2 of your PRs wait for review at once; review the teammate's waiting PR before starting new work; never take the teammate's Issue unless they agree and the assignee changes.

## Releases
- After each release PR from `staging` into `main`, tag `main` `vS.N` (Sprint 1 = `v1.0`).
- A fix goes `fix/*` -> `staging` -> a new release, never straight to `main`.
- Never move the submitted tag.

## AI use
- Record AI use in `docs/ai-use.md`: what the AI did, what the human checked or changed.

## Safety
- The repo is public. Never commit secrets, real passwords, tokens, `.env` files or student IDs. Use `.env.example` with fake values.
- `.claude/settings.local.json` is personal and stays out of git.

## Where things are
- Product and design: `docs/` (`srs.md`, `features.md`, `traceability.md`, `system-sds.md`, `adr/`, `ai-use.md`, `report.md`, `sprints/`).
- Issue and PR forms: `.github/`.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
