# 0024. Shape of the application

Status: accepted
Design ID: D-23 (Issue #3)

## Decision
A. One container: the API serves the built frontend.

## Options considered
- A. One container: the API serves the built frontend. **(chosen)**
- B. Two containers: a frontend server and a separate API. Two images to build and two deploy targets.
- C. One server-rendered application with no separate frontend. Pages are rendered by the server.
- Other: your own answer.

## Why
This is what the kit's Dockerfile builds; one image and one Cloud Run service.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
