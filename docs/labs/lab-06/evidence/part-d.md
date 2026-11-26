# Part D: resolution, independent retest and acceptance

No critical or major defect was received. We still corrected both accepted minor defects, each with an automated test that failed first. D.1 and D.2 are our own accepted-defect chain; D.4 is our work as the UAT Team. The tests in D.2 and D.3 are **automated**; the retests are **manual**.

## D.1 Versions

{{include:../resolution.md|## 1. Version table}}

## D.2 Correction chain: triage, RED, GREEN, review, release, retest

{{include:../resolution.md|## 3. Part D}}

## D.3 Regression tests (excerpt of the test changes from `v1.3` to `v1.4`)

TC-81, new, in `server/test/auth.test.js`:

```js
test('TC-81: a username with a NUL character is an unknown username, not a server error', async t => {
  const compare = t.mock.method(bcrypt, 'compare');
  const responses = [];
  for (const username of ['nobody', 'no\u0000body']) {
    const response = await request(app).post('/api/auth/login').send({ username, password });
    assert.equal(response.status, 401, `status for ${JSON.stringify(username)}`);
    assert.equal(response.headers['set-cookie'], undefined);
    responses.push(response.body);
  }
  assert.deepEqual(responses[0], error('INVALID_CREDENTIALS', 'Username or password is incorrect.'));
  assert.deepEqual(responses[1], responses[0]);
  assert.equal(await db.session.count(), 0);
  assert.equal(compare.mock.callCount(), 2, 'One real bcrypt comparison for each unknown username, including the NUL one');
});
```

Cases added to the existing tests TC-68 (`server/test/template.test.js`, create) and TC-71 (`server/test/template-edit.test.js`, edit), whose loops assert `400 VALIDATION_ERROR` and that nothing is stored or changed:

```diff
 TC-68
+    { ...valid, name: 'Re\u0000ad' },
+    { ...valid, unit: 'pa\u0000ges' },
 TC-71
+    [{ unit: 'X\u0000Y' }, 'Unit must be 1 to 30 characters.'],
+    [{ name: 'N\u0000M' }, 'Name must be 1 to 100 characters.'],
```

The whole server suite (87 tests, 0 fail, 0 skipped) and the browser tests (46 passed) ran in the release's CI run [45806178753](https://github.com/phittayanan/habit-tracker/actions/runs/45806178753) on `056ee5c`.

## D.4 Our retest of the partner's fixes and our acceptance decision

Manual, on the partner's deployed app, 2026-11-26. The texts as posted are RT-61, RT-60, AD-2 and AD-3 in the Appendix.

| Retest | Tester and method | Expected | Actual | Result |
|---|---|---|---|---|
| #61, create with a 110,000-character name | projectnewy's signed-in Chrome as MANAGER; the AI agent filled the name with a page script and clicked Create | 400, nothing created | `POST /templates` 400, "Request body is too large."; still 10 templates after a reload | PASS |
| #61, edit with a 110,000-character name | same; a template made for the test, `EXP-PT-61-edit` | 400, unchanged | `PUT /templates/11` 400, same message; unchanged after a reload | PASS |
| #60, mouse wheel on Max value | projectnewy, real mouse wheel | the value stays | stays 50 and the field loses focus (before the fix: 49.97) | PASS |
| #60, mouse wheel on Min value | projectnewy, real mouse wheel | the value stays | stays 1 (tester's observation; the screenshot shows the focused field, none after the scroll) | PASS |

**Which version these retests saw.** The app shows no revision. The fix of #61 was announced in revision `s65da36e2-00010-2mh` (`5d0e4ba`). When we tested #61, the latest successful deploy run was 45812026155 (`main` `b53e7bc`, the partner's Lab 7 release, which includes the fix); on closing #61 the partner named it revision `s65da36e2-00011-269`. For #60 the tester's tab had been loaded before the Lab 7 client, so we cannot name its revision for certain. We did not save screenshots of these retests in the repository.

**Our final Sprint 1 decision on the partner's product: Accepted with documented minor limitations** (2026-11-26; UAT Team phittayanan and projectnewy; version tested `0619c07`, `s65da36e2-00009-b4s`, with the retests above; no conditions). The limitation is the one in C.3: the correction AD-3 replaces the limitation line of AD-2 and leaves the decision unchanged. Changes after `b53e7bc`, including the partner's Lab 7 features, are outside the decision.

## D.5 Contributions

{{include:../resolution.md|## 4. Contributions}}

In the row "Write-up", "this file" is `docs/labs/lab-06/resolution.md`. The row also covers this PDF's source and build script (Issue #109, projectnewy; checker phittayanan).

## D.6 AI-use declaration

Both students used AI coding assistants (Claude Code; Codex for part of Issue #104). The row for each task, with what the AI did and what a student checked or changed, is in `docs/ai-use.md` in the repository.

| Area | What the AI did | What the students did |
|---|---|---|
| Part A | Drafted UAT cases, handoff, reset script and release check; made review fixes | Decided accounts and reset method, ran the live reset and checks, reviewed each other's PRs |
| Part B, UAT-01 to UAT-06 | Gave step instructions, compared screenshots with expected results, drafted the records. It did not operate the partner's app. It twice suspected a defect that was a tester's input error | Ran every step, took the screenshots, decided every result, corrected the AI |
| Part B, X-01 and X-02 | **Operated the partner's deployed app** in phittayanan's signed-in browser (page script and clicks), and read their public code. Consent reported before the test; written confirmation posted afterwards (E-B2X-09) | Chose the items, signed in, decided the results |
| Part C | Drafted triage comments, reports and records; posted Issues and comments after a student asked or approved. A first version of `findings.md` was out of date on the partner's answers until review | Classified findings, approved and sent the texts |
| Part D, fixes | Wrote spec changes, failing tests and fixes, ran them on disposable local databases | Reviewed the other student's fix, repeated or checked RED and GREEN, merged, released and deployed |
| Part D, retest of the partner's fixes | **Operated the partner's deployed app** in projectnewy's signed-in Chrome for #61, and created one template there. projectnewy reported that the partner allowed it; the agent saw no written confirmation for that day, and the written consent E-B2X-09 was for the earlier test. For #60 it did not operate the app | projectnewy signed in, ran the #60 check with a real mouse and approved the posted results |
| Reviews and this PDF | Drafted PR reviews, marked "AI-assisted"; assembled this PDF from the repository records | Students read and approved the reviews before posting; the PDF is checked by the other student |

No AI tool typed or was given a password.

## D.7 Limitations

{{include:../resolution.md|## 5. Limitations}}

Added for this PDF:

- **The partner's evidence** for its retest and UAT runs is in its repository, not in this PDF; the texts it posted to us are printed in the Appendix.
- **Partner version labels** come from the partner's package and deploy runs, because their app shows no revision text.
- **Our retests of the partner's fixes** have no screenshot in the repository (D.4).
- **Records written at different times.** Parts of the included files describe their own status time: the handoff (A.2), the "Status" and "to do" notes in `partner-uat/` records, and the report texts in C.4. Parts C.1 to C.3 and D.4 give the later state.
