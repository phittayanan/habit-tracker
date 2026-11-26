# 0062. Team status through a Discord bot, checked before review

Status: decided by phittayanan, owner of [Issue #144](https://github.com/phittayanan/habit-tracker/issues/144), on 2026-11-27.

Each student sets a status in Discord with a slash command: `/in` (working), `/afk`, `/sleep` or `/out`. A bot stores each status with the time it was set in a GitHub repository variable of this repo, which only collaborators can read. The agent may also set a status, for example "working" when a student starts an Issue in a session. Before the agent asks the teammate for a review, it reads the reviewer's status; if the reviewer is AFK, asleep or out, it tells the author and holds the request.

The bot is team tooling, not part of the habit-tracker product. Its code lives in the private repository `phittayanan/team-status-bot`, outside this repo's CI and deploy. It runs on GCP Cloud Run as its own service, apart from the app's deploy, with the Discord bot token and GitHub token in GCP Secret Manager and never in Git. phittayanan builds it and projectnewy reviews and merges it.

This lets the agent see whether the teammate is awake and working before it waits on a review.

The bot commands, stored record and agent rules are specified in [team-status-bot docs/spec.md](https://github.com/phittayanan/team-status-bot/blob/main/docs/spec.md) (private repo).
