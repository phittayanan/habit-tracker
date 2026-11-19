# 0058. The UAT accounts are the three seeded accounts

Status: decided by phittayanan in the session of Issue #104 on 2026-11-19 ("ตกลง"); projectnewy to confirm in the review of the Issue #104 PR

## Decision

1. The Lab 6 UAT accounts are the accounts the seed already creates: **M1** = `manager1`, **P1** = `participant1`, **P2** = `participant2` (`server/prisma/seed.js`). No account is added and the seed does not change.
2. The two Participants share the password the seed reads from the secret `habit-tracker-seed-participant-password`; M1 uses `habit-tracker-seed-manager-password` (`docs/labs/lab-05/deployment.md` section 2). phittayanan sends the values to the partner team privately. They are never written in Git, an Issue, a PR or a comment.
3. The passwords must be random values used only for this application, long enough that the public URL cannot be guessed into. A real password of a student is never used.

## Reasons

- The UAT cases already name the accounts M1, P1 and P2 and need no other account.
- A new account or a separate password per account would need a seed change (a code PR) and a new value in Secret Manager, which only a human may set (Lab 5 handout section 9: billing, IAM and database changes are a human's).
- The URL is public and stays up until grading, so a weak password is a risk to the graded deployment.

## Not changed

The seed, the secrets, the roles, and the rule that no password, token or student ID goes into Git.

## Source

Issue #104 (scope: "create the Participant A, Participant B and Manager test accounts; send the credentials to the partner team privately") and the chat decision of 2026-11-19.
