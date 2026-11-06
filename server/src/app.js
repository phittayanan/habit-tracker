import express from 'express';
import { requireOrigin, sendError } from './middleware/auth.js';
import { registerAuth, invalidLogin } from './routes/auth.js';
export { protectedRoutes } from './routes/auth.js';

export function createApp({ db, registerTestRoutes } = {}) {
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
  // Explicit injection by test harness only. Runtime startup never supplies this callback.
  if (registerTestRoutes) registerTestRoutes(app);
  app.use('/api', (req, res) => sendError(res, 404, 'NOT_FOUND', 'Not found.'));
  app.use((err, req, res, next) => {
    if (req.path === '/api/auth/login' && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')) return invalidLogin(res);
    // Do not print ORM errors: they may include sensitive query parameters.
    sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
  });
  return app;
}
