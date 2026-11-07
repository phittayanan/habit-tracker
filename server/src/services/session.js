export const SESSION_LENGTH_MS = 8 * 60 * 60 * 1000;

export function isSessionValid(session, now) {
  return now.getTime() < session.expiresAt.getTime();
}

export function cookieOptions(environment = process.env.NODE_ENV) {
  return {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: SESSION_LENGTH_MS,
    secure: environment === 'production',
  };
}

export function sessionIdFrom(req) {
  const value = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith('sid='));
  if (!value) return undefined;
  try { return decodeURIComponent(value.slice(4)); } catch { return undefined; }
}
