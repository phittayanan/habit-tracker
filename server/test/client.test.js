import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import request from 'supertest';
import { createApp } from '../src/app.js';

test('built client serves contracted page addresses from the isolated checkout, without test pages', async () => {
  assert.ok(existsSync(new URL('../../client/dist/index.html', import.meta.url)), 'Run the client build first.');
  const app = createApp({ db: {} });
  for (const path of ['/login', '/templates', '/templates/new', '/templates/123/edit', '/goals']) {
    const response = await request(app).get(path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers['content-type'], /text\/html/);
    assert.match(response.text, /<div id="root"><\/div>/);
  }
  await request(app).get('/test/protected').expect(404);
  await request(app).get('/api/missing').expect(404);
});
