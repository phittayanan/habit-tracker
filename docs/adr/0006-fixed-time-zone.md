# 0006. What a day is

Status: accepted
Design ID: D-05 (Issue #3)

## Decision
A. One fixed time zone for everyone (for example Asia/Bangkok). The same date for all users, and users in other zones may see odd cut-offs.

## Options considered
- A. One fixed time zone for everyone (for example Asia/Bangkok). The same date for all users, and users in other zones may see odd cut-offs. **(chosen)**
- B. Each participant has a time zone setting. Dates are right for each person, and the data model stores a zone per user.
- C. The UTC calendar date of the server. No time-zone setting, and a late-evening local entry can land on the next UTC date.
- Other: your own answer.

## Why
All users are in Thailand; one zone (Asia/Bangkok) means no time-zone field and no time-zone bugs.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
