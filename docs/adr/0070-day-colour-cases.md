# 0070. Day colour edge cases, and today's live colour

Status: chosen by phittayanan on 2026-11-27 in [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151) (Q7). To be agreed by projectnewy in the review of the #151 PR. Adds to ADR 0040, 0045 and 0046.

## Decision

| Day | Colour | Sign |
|---|---|---|
| Every goal active that day met | green | ✓ |
| Some met, including "one met, another with nothing recorded" | yellow | ½ |
| Something recorded, none met | red | ✗ |
| Goals active, nothing recorded | grey | – |
| No goal active that day, or a future day | no colour | none |

Today shows a live colour from today's totals so far. "Met" uses the target valid on that day (BR-12).

## Options considered

- **Today live (chosen).**
- Today plain until the day is over (like the streak rule, BR-13).
