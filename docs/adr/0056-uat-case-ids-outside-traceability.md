# 0056. UAT case IDs stay outside `docs/traceability.md`

Status: decided by projectnewy on 2026-11-19 (asked in the review of PR #112, Issue #99: "use what you think is best"); phittayanan agreed in the review of PR #112 on 2026-11-19

## Decision

1. Lab 6 UAT cases (`UAT-01`, `UAT-02`, ...) are acceptance cases written for the partner team. They are kept as files in `docs/labs/lab-06/uat-cases/`, each with its own requirement and AC references. They are not added to `docs/traceability.md`, which keeps the product's feature, AC and TC IDs.
2. The table that links each UAT case to its FR, BR and AC IDs is built once, in the Lab 6 evidence PDF (Issue #109), from the case files.
3. A UAT case adds no new requirement and no new AC. If a case finds that the product does not match a contract, that is a finding (Lab 6 Part C), and the contract and `traceability.md` change only through the usual Issue, spec, test and fix.

## Reasons

- `docs/traceability.md` maps requirements to automated tests that run in CI. A manual UAT case does not run there, so listing it would mix two kinds of evidence.
- Every UAT case file already names its FR, BR and AC IDs, so the link exists and a reviewer can check it with a search.
- One table at the end avoids five PRs (#99 to #102 and later) editing the same file.

## Not changed

The Sprint 1 contracts, `docs/traceability.md`, the TC IDs and the rule that a product change updates `traceability.md`.
