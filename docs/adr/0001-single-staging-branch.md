# 0001. Single staging branch

Status: proposed (to confirm with the partner and, if needed, a TA)

## Context
The course asks for the "current sprint staging branch". We have not confirmed whether that means one long-lived branch or a new branch per sprint.

## Decision
The team uses one `staging` branch for all sprints. Each sprint ends with a release PR from `staging` into `main` and a tag.

## Consequences
`CLAUDE.md` and the branch rules name `staging` directly. If a TA requires one branch per sprint, update this ADR and `CLAUDE.md`.

## Default branch
`staging` is the repository's default branch, so `Closes #N` in a PR into `staging` links and closes the Issue. `main` holds only tagged releases.
