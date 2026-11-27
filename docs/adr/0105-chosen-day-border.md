# 0105. The chosen day is marked by a thick border, not a dark fill

Status: chosen by projectnewy on 2026-11-27 in the session for [Issue #156](https://github.com/phittayanan/habit-tracker/issues/156). Agreed by phittayanan in the [review of 8cf2ee2](https://github.com/phittayanan/habit-tracker/pull/185#pullrequestreview-6091551110) of PR #185.

## Context

#155 shows the chosen day as a dark fill with white text. With the F-12 colours that fill would hide the day's colour. The F-12 contract does not say how a chosen day looks.

## Decision

The chosen day keeps its colour and sign and gets a 3 px dark border. Today keeps its inner outline and bold number.

## Options considered

- **A. Thick dark border (chosen).**
- B. Keep the dark fill; the day's state is then read from the sign and the panel.
