# 0063. Day box design on phone and desktop

Status: decided by phittayanan on 2026-11-27 from the F-11 prototype (variants M and N), before [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151); written into the F-11 contract in [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151). To be agreed by projectnewy in the review of the #151 PR.

## Decision

1. Keep the current look of the app (the Sprint 1 layout and style).
2. Phone (below the current 600 px breakpoint): tapping a day opens a box in the centre of the screen. Tapping outside the box, the close button or Escape closes it.
3. Inside the box each goal has one "Check in" button that opens its input: a count goal gets − / + and Done; a time goal gets the light-up bar and Check in (ADR 0064 says which goal is which).
4. Desktop: the side panel of ADR 0047 shows the same content for the chosen day, with no pop-up.

## Options considered

Prototype variants A to O (`f11-phone-panel.html`, outside the repository). **M (phone) and N (desktop) were chosen**; the others were an inline panel (A), a bottom sheet (B), a separate page (C), a box with day arrows (D), and quick-pick, slider, tally and hour/minute inputs (E to L).

## Why

No reason was recorded beyond the choice of the prototype variants.

## Consequences

- The F-11 contract carries screenshots of variants M and N. The prototype week starts on Sunday; the contract uses Monday (ADR 0068).
