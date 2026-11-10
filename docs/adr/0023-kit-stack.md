# 0023. Stack

Status: accepted
Design ID: D-22 (Issue #3)

## Decision
A. The kit's stack as it is (Node.js, Express, React with Vite, Prisma, PostgreSQL). The kit's files work without changes.

## Options considered
- A. The kit's stack as it is (Node.js, Express, React with Vite, Prisma, PostgreSQL). The kit's files work without changes. **(chosen)**
- B. One full-stack framework in TypeScript (for example Next.js) with PostgreSQL. The kit's Dockerfile and CI need adapting.
- C. A Python backend (for example Django or FastAPI) with a separate or built-in frontend and PostgreSQL. The kit's Dockerfile, CI and deploy scripts need adapting.
- D. The stack used in Labs 1 to 4, if it is none of A to C, with a database Cloud SQL offers. The kit needs adapting, and the team already knows the tools.
- Other: your own answer.

## Why
The Lab 5 Dockerfile, CI and deploy scripts work with no changes, which is the least risk. (Add the stack used in Labs 1 to 4 here.)

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
