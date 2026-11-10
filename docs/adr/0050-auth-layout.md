# 0050. Auth layout package A

Status: owner approved; teammate agreement pending

## Decision

The owner selected complete package A on 2026-11-07, relayed by firstmate: a centered login form, at most 352px wide without a card, and a shared wrapping top bar. On phones identity and logout precede the menu row.

Use the proposed neutral system sans typography, 16px body, 24px heading, 8px spacing rhythm, controls at least 44px tall, grey borders, dark 3px keyboard focus outline, neutral error panel, disabled submit with “Logging in…” feedback, and generic failure “Something went wrong. Please try again.” Auth-only destinations show a heading, without domain data or actions.

## Source

Owner answer “A”, recorded in the 2026-11-07 firstmate implementation handoff and steering message 002. The reviewed wireframe comparison covered A, B (left aligned) and C (split heading/form). This records that answer; it adds no Template or Goal implementation. At that handoff OP-01.12 and OP-10.1 were open. OP-01.12 is separately authorized in ADR 0051; OP-10.1 remains open. No separate teammate layout comment was present on https://github.com/phittayanan/habit-tracker/pull/34 when checked on 2026-11-07; this records owner approval only.
