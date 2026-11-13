// Temporary proof for Lab 5 step 6 (Issue #65, check C-02). This test fails on purpose so the
// required check `test-and-docker` fails and the merge is blocked. The branch is never merged.
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('C-02 proof: this test fails on purpose and must never be merged', () => {
  assert.equal(1 + 1, 3);
});
