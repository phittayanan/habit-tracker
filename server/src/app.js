import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { requireOrigin, sendError } from './middleware/auth.js';
import { registerAuth, invalidLogin, protectedRoutes as authRoutes } from './routes/auth.js';
import { registerTemplates, templateRoutes } from './routes/templates.js';
import { registerGoals, goalRoutes } from './routes/goals.js';
export const protectedRoutes = [...authRoutes, ...templateRoutes, ...goalRoutes];

export function createApp({ db, registerTestRoutes, serveClient = true } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use(requireOrigin);
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/ready', async (req, res) => {
    try { await db.$queryRaw`SELECT 1`; res.json({ status: 'ready' }); }
    catch { sendError(res, 503, 'NOT_READY', 'Service is not ready.'); }
  });
  registerAuth(app, db);
  registerTemplates(app, db);
  registerGoals(app, db);
  // Explicit injection by test harness only. Runtime startup never supplies this callback.
  if (registerTestRoutes) registerTestRoutes(app);
  app.use('/api', (req, res) => sendError(res, 404, 'NOT_FOUND', 'Not found.'));
  const clientDir = fileURLToPath(new URL('../../client/dist/', import.meta.url));
  if (serveClient && existsSync(clientDir)) {
    app.use(express.static(clientDir));
    app.get(['/login', '/', '/templates', '/templates/new', '/templates/:id/edit', '/goals', '/goals/new'], (req, res) => {
      res.set('Cache-Control', 'no-store').sendFile('index.html', { root: clientDir });
    });
  }
  app.use((err, req, res, next) => {
    if ((req.path === '/api' || req.path.startsWith('/api/'))
      && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')) {
      if (req.path === '/api/auth/login') return invalidLogin(res);
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid JSON body.');
    }
    // Do not print ORM errors: they may include sensitive query parameters.
    sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
  });
  return app;
}
