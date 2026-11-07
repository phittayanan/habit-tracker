import express from 'express';
import { z } from 'zod';
import { authenticate, publicUser } from '../services/auth.js';
import { cookieOptions, sessionIdFrom } from '../services/session.js';
import { requireSession, sendError } from '../middleware/auth.js';

const credentials = z.object({ username: z.string().trim().min(1), password: z.string().min(1) });
export const protectedRoutes = [
  { method: 'post', path: '/api/auth/logout' },
  { method: 'get', path: '/api/auth/me' },
];
export const invalidLogin = res => sendError(res, 400, 'VALIDATION_ERROR', 'Enter your username and password.');

export function registerAuth(app, db) {
  app.post('/api/auth/login', express.json(), async (req, res) => {
    const parsed = credentials.safeParse(req.body);
    if (!req.is('application/json') || !parsed.success) return invalidLogin(res);
    const result = await authenticate(db, parsed.data, sessionIdFrom(req));
    if (!result) return sendError(res, 401, 'INVALID_CREDENTIALS', 'Username or password is incorrect.');
    res.cookie('sid', result.sessionId, cookieOptions()).json({ user: result.user });
  });
  const handlers = {
    '/api/auth/logout': async (req, res) => {
      await db.session.deleteMany({ where: { id: req.session.id } });
      res.cookie('sid', '', { ...cookieOptions(), maxAge: 0 }).status(204).end();
    },
    '/api/auth/me': (req, res) => res.json({ user: publicUser(req.user) }),
  };
  for (const route of protectedRoutes) app[route.method](route.path, requireSession(db), handlers[route.path]);
}
