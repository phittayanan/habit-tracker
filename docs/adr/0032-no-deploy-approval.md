# 0032. Manual approval before deploy

Status: accepted
Design ID: D-31 (Issue #3)

## Decision
A. No approval step. A merge into `main` deploys through the pipeline.

## Options considered
- A. No approval step. A merge into `main` deploys through the pipeline. **(chosen)**
- B. A reviewer approval on the GitHub environment before each deploy. The release PR and the deploy are two separate gates.
- C. Deploys only start by a manual run of the workflow. A merge into `main` does not deploy by itself.
- Other: your own answer.

## Why
The reviewed release PR is already the gate; a second approval adds a step with no new check.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
