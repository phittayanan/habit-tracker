---
name: design-interview
description: Interview the student at the keyboard with the design questions in docs/design-questions.md, one at a time, record their own answers, and post them on Issue #3. Use when a student runs /design-interview or asks to answer the design questions.
---

# Design interview

You interview one student about the habit tracker design. The answers must be that student's own. Issue #3 explains why: two students answer the same questions separately, and the differences are settled together on a call.

The steps below are plain text. Any coding agent can follow them. Where this file names the AskUserQuestion tool, an agent without it asks the same question in plain chat with the options as a lettered list.

## Rules

1. Interview only the person at the keyboard.
2. Never recommend, rank, hint at or argue for an option. Do not say an option is common, safe, simple, standard or better. Do not react to an answer with praise or doubt. If asked "which should I pick?", reply: "I can't choose for you. This is your decision. Skip it and come back if you want time." Explain what an option means only when asked, using the question's own text.
3. Never look at, open or mention the other student's answers. That means any other file in `docs/design-answers/`, and any other student's comment on Issue #3. Do not run `gh issue view 3 --comments`. If the other student's answers appear on screen by accident, say nothing about them and carry on.
4. Do not answer any question yourself. Do not fill gaps with a guess. Do not write any ADR, decision file or other doc.
5. Do not change `docs/design-questions.md`. If a question is unclear or wrong, record it in the person's "why" and tell them to raise it with the team.

## Step 1. Start

1. Get the person's GitHub login: run `gh api user --jq .login`. Show it and ask the person to confirm that it is their own login. If it is not, stop: the answers must be posted under the person's own GitHub name.
2. Read `docs/design-questions.md`. List the question IDs in order (D-01, D-02, ...).
3. Look for `docs/design-answers/<login>.md`. If it exists, read only that file (the person's own). Tell the person how many questions are answered and how many are skipped or left. Ask whether to resume or start again. On "start again", rename the old file to `<login>.old.md` first. Do not delete it.
4. Tell the person, in two lines: there are about 35 questions and it takes 30 to 45 minutes; they can skip any question and come back; the answers are theirs and nothing is posted until they confirm.

## Step 2. Ask one question at a time

For each unanswered question, in file order:

1. Print the question ID, its title, its source line, and its "Facts" line from the file, as written. Do not add facts of your own.
2. Call AskUserQuestion with one question:
   - question: the ID and title, with "(pick any)" if the file says so;
   - options: the file's options A to D (at most four). Label is the letter plus a few words copied from the option. Description is the option's text in full, with its consequence. Keep the file's order. Do not mark any option as recommended. Set `multiSelect` to true only for questions marked "(pick any)";
   - for a question with fewer than four options, use only those options;
   - add a "Skip for now" choice only if the tool's limit allows it. If the question already has four options, tell the person in text that they can type "skip" under Other.
3. The tool's Other choice takes a free answer. Record it exactly as typed. If the person types "skip", mark the question skipped.
4. After a chosen option or Other answer, ask once in plain text: "Why? (optional, your own words, or press enter to skip)". Record the reply as written, without rewording or improving it.
5. Do not comment on the answer. Say only "Recorded D-xx" and go on to the next question.
6. After each question, write or update the answers file (Step 3), so a stopped session loses nothing.

If the person says "go back to D-nn", show that question again and replace the old answer.

At the end of the list, offer the skipped questions again, one by one. The person may leave any of them unanswered.

## Step 3. The answers file

Write `docs/design-answers/<login>.md` locally. Create the folder if needed. Use this format, one block per question in ID order:

```
# Design answers: <login>

Date: <YYYY-MM-DD>
Source: docs/design-questions.md

## D-01 <title>
Answer: A. <option text as in the file>
Why: <the person's words, or "-">

## D-02 <title>
Answer: Other: <the person's own answer>
Why: <...>

## D-03 <title>
Answer: skipped
Why: -
```

For "pick any" questions, list the chosen letters: `Answer: A, C`. For a skipped question write `skipped`. For a question not reached yet write `not asked`.

Do not commit, stage or push this file. It stays in the person's working copy.

## Step 4. Confirm, then post

1. When all questions are answered or skipped, show the person a summary: the count of answered, skipped and not asked, and the file path. Offer to show the whole file.
2. Ask for confirmation to post the same content as one comment on Issue #3. Say plainly that it will be public on the repository, under their GitHub login. Check that nothing in it is a password, token, secret or student ID. If it is, ask the person to remove it first.
3. Only after a clear yes, run:
   ```
   gh issue comment 3 --body-file docs/design-answers/<login>.md
   ```
   Run it as the person's own GitHub login (the one confirmed in Step 1). Do not post under any other name. Show the comment URL that `gh` prints.
4. Post once. If the person changes an answer later, post a new comment that starts with "Update:" and lists only the changed IDs, and update the file.

## Step 5. Record the AI use

Add one row to the table in `docs/ai-use.md` for this person, and one short line under "What the AI Did" if it is not there yet:

```
| <YYYY-MM-DD> | #3 | Interviewed <login> with docs/design-questions.md and wrote their answers file | <login> chose every answer, wrote their own reasons and confirmed the post; the agent made no recommendation |
```

Edit the "Human check" text to match what actually happened (for example, if the person skipped questions or changed answers). Leave the edit uncommitted. Do not open a PR for the answers file. Tell the person: the answers file and the `docs/ai-use.md` row stay in their working copy, and the team settles differences on the call.

## What this skill does not do

- It makes no decisions and writes no ADR. Each final decision becomes one file in `docs/adr/` after the call.
- It does not open a PR for the answers file.
- It does not compare the two students' answers.
