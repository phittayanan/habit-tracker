import { PrismaClient } from '../../server/node_modules/@prisma/client/default.js';
import { createApp } from '../../server/src/app.js';
import { createServer } from 'vite';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
  throw new Error('Set a separate disposable TEST_DATABASE_URL.');
}
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
const app = createApp({ db, serveClient: false });
// Test-only HTML entry imports the real app and enables only the contract test page.
app.get('/test/protected', async (req, res, next) => {
  try {
    res.type('html').send(await vite.transformIndexHtml(req.originalUrl,
      '<html lang="en"><meta name="viewport" content="width=device-width, initial-scale=1"><div id="root"></div><script type="module" src="/test/entry.jsx"></script></html>'));
  } catch (error) { next(error); }
});
app.use(vite.middlewares);
const server = app.listen(33132, '127.0.0.1');
async function stop() { server.close(); await vite.close(); await db.$disconnect(); process.exit(0); }
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
