import { requireRole, requireSession, sendError } from '../middleware/auth.js';
import { parseMonth, readCalendar } from '../services/calendar.js';

export const calendarRoutes = [{ method: 'get', path: '/api/calendar', roles: ['PARTICIPANT'] }];

// F-11 (ADR 0072). Session (401), then role (403), then validation (400), as SDS 2.2.
export function registerCalendar(app, db) {
  app.get('/api/calendar', requireSession(db), requireRole('PARTICIPANT'), async (req, res, next) => {
    try {
      const parsed = parseMonth(req.query);
      if (!parsed.ok) return sendError(res, parsed.status, parsed.code, parsed.message);
      res.json(await readCalendar(db, req.user, parsed.month));
    } catch (error) { next(error); }
  });
}
