# 0053. The seed keeps existing templates and still sets the passwords

Status: decided by projectnewy on 2026-11-14 for implementation in Issue #79; review by phittayanan pending

## Decision

1. The seed (`npm run prisma:seed`) creates each demo template (Reading, Walking, Water) only when no template with that name exists. A template that exists is not changed: a Manager's edit to its unit, minimum or maximum stays after every release.
2. The seed still sets the password hash of the three seeded accounts from `SEED_MANAGER_PASSWORD` and `SEED_PARTICIPANT_PASSWORD` on every run. The password in Secret Manager stays the single source of truth for those accounts.

## Reasons

- Before this decision the migration job overwrote the demo templates on every release (Issue #79), so an edit made through the app was lost at the next deploy.
- The app has no password change and no recovery (ADR 0004). Setting the hash at every deploy is the only way to rotate a seeded password. Setting it only when the account is created would make a rotation a manual database step.

## Consequences

- A demo template that a Manager retires or edits stays as the Manager left it. To restore the original values, a Manager edits it again.
- The seeded accounts' display name and role are still set by the seed. No feature in the app changes them.

## Source

phittayanan proposed the template fix in Issue #79 and left the password question open. projectnewy answered both questions in the session for Issue #79 on 2026-11-14.
