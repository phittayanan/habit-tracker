# 0055. Review routing, card moves by the agent and one review format

Status: agreed by phittayanan and projectnewy in Issue #55 (comments of 2026-11-16 and 2026-11-18); implemented in the PR for Issue #55, review by projectnewy pending. The "What I checked" part of point 3 is superseded by ADR 0085 (Issue #170).

## Decision

1. `.github/CODEOWNERS` has one line, `*  @phittayanan @projectnewy`. GitHub asks the student who did not open a PR to review it. It only asks: merging still needs one approval, and "Require review from Code Owners" stays off.
2. The agent moves every Issue card on board 12. People do not move cards. The agent at the event moves the card and reads it back:

   | Event | Card goes to | Moved by |
   |---|---|---|
   | Contract and AC approved | Specified | agent |
   | Work starts on the branch | Started | agent |
   | PR opened | PR Review | board automation; the agent fixes a miss |
   | Changes requested | Fixing | agent (the reviewer's agent after the review, or the author's agent when the fix starts) |
   | Fix pushed, review re-requested | PR Review | agent |
   | Issue closed | Done | board automation; the agent fixes a miss |

3. A review uses one format (the "What I checked" part is superseded by [ADR 0085](0085-shorter-review-format.md); the labels stay): "What I checked" (numbered, each with the commit or file and the result), then "Findings", each finding with one label:

   | Label | Meaning |
   |---|---|
   | `issue (blocking)` | must change before merge; the review is "Requesting changes" |
   | `issue` | should change in this PR, or the author says why not |
   | `suggestion` | optional |
   | `question` | needs an answer in the thread |

   The labels are taken from [Conventional Comments](https://conventionalcomments.org).

## Board access

A card move needs nothing beyond what each student already uses: the agent writes the Status field with the `gh` login of the student who runs it, and sets no workflow, filter, visibility or sharing option of board 12.

Checked on 2026-11-18: board 12 is owned by the user `phittayanan`, and that login's token has the `project` scope. The board reports `public: true`, so it is not private today; whether to make it private is the owner's decision and is not part of this change. Not checked: whether `projectnewy` has write access to board 12. If not, the owner grants it, or the card moves for projectnewy's PRs are made by phittayanan's agent.

## Source

phittayanan proposed the three parts in Issue #55 on 2026-11-16; projectnewy agreed to all three on 2026-11-18 and asked for the next free ADR number (0055) and for this access note.

## Not changed

Who reviews, who merges (the student who did not write the PR), the PR template, and the rulesets.
