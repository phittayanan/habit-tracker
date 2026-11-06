# 0007. Units and valid ranges

Status: accepted
Design ID: D-06 (Issue #3)

## Decision
A. The manager types a free-text unit and a minimum and maximum per entry. Any routine fits, and unit spelling is not checked.

## Options considered
- A. The manager types a free-text unit and a minimum and maximum per entry. Any routine fits, and unit spelling is not checked. **(chosen)**
- B. The manager picks a unit from a fixed list (for example minutes, hours, count, km) and sets a minimum and maximum per entry. Units are consistent, and a new unit needs a code change.
- C. One unit per product (set by D-01), with a minimum and maximum per entry in the template. Fewer fields, and the product covers one kind of value.
- Other: your own answer (for example also a daily maximum).

## Why
D-01 lets managers define any routine, so a fixed unit list would not fit; the minimum must be below the maximum.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
