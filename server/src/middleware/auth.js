import { isSessionValid, sessionIdFrom } from '../services/session.js';

export function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

export function requireSession(db) {
  return async (req, res, next) => {
    const id = sessionIdFrom(req);
    const session = id ? await db.session.findUnique({ where: { id }, include: { user: { select: { id: true, username: true, displayName: true, role: true } } } }) : null;
    if (session && !isSessionValid(session, new Date())) {
      await db.session.deleteMany({ where: { id } });
    } else if (session) {
      req.session = session;
      req.user = session.user;
      return next();
    }
    return sendError(res, 401, 'UNAUTHENTICATED', 'Please log in.');
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to do this.');
    next();
  };
}

export function requireOrigin(req, res, next) {
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method) || req.headers.origin === undefined) return next();
  try {
    const origin = new URL(req.headers.origin);
    if (origin.host && origin.host === req.headers.host) return next();
  } catch { /* Malformed origins receive the same refusal as foreign hosts. */ }
  return sendError(res, 403, 'ORIGIN_NOT_ALLOWED', 'This request is not allowed from another site.');
}
