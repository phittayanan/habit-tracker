# 0062. Team status through a Discord bot, checked before review

Status: decided by phittayanan, owner of [Issue #144](https://github.com/phittayanan/habit-tracker/issues/144), on 2026-11-27.

Each student sets a status in Discord with one click on a pinned panel: 🟢 In (working), 🟡 AFK, 🌙 Sleep or ⚫ Out. The panel updates in place to show both statuses with a live age, and a 🔄 Refresh button redraws it after the agent changes one; `/panel` posts it and is the only slash command. A bot stores each status with the time it was set in a GitHub repository variable of this repo, which only collaborators can read. The agent may also set a status, for example "working" when a student starts an Issue in a session. Before the agent asks the teammate for a review, it reads the reviewer's status; if the reviewer is AFK, asleep or out, it tells the author the status and its age, and the author decides whether to send the request now or wait. A status never expires; the agent warns when one is over 12 hours old. The panel is visible to everyone in the channel.

The bot is team tooling, not part of the habit-tracker product. Its code lives in the private repository `phittayanan/team-status-bot`, outside this repo's CI and deploy. It runs on GCP Cloud Run as its own service, apart from the app's deploy, with the Discord bot token and GitHub token in GCP Secret Manager and never in Git. phittayanan builds, reviews and merges it; projectnewy does not review the bot repo (owner's decision, 2026-11-27), so the habit-tracker team rule that the teammate reviews every PR does not apply there. The habit-tracker PR for a bot Issue is still reviewed by the teammate.

Work on the bot is tracked by Issues in this repo, on board 12; the bot repo has no Issues of its own. A bot PR refers to its habit-tracker Issue ("Part of phittayanan/habit-tracker#N") and the habit-tracker PR closes it. So one Issue may have one PR in each repo, an exception to one Issue, one PR. The bot repo has no issue-link check, so phittayanan checks the link by hand before merging.

This lets the agent see whether the teammate is awake and working before it waits on a review.

The bot commands, stored record and agent rules are specified in [team-status-bot docs/spec.md](https://github.com/phittayanan/team-status-bot/blob/main/docs/spec.md) (private repo).
