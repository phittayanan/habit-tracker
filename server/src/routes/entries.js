import express from 'express';
import { requireRole, requireSession, sendError } from '../middleware/auth.js';
import { createEntry, listEntries } from '../services/entry.js';

export const entryRoutes = ['get', 'post'].map(method => ({
  method, path: '/api/goals/:id/entries', roles: ['PARTICIPANT'], requestPath: '/api/goals/1/entries',
}));

export function registerEntries(app, db) {
  app.get('/api/goals/:id/entries', requireSession(db), requireRole('PARTICIPANT'), async (req, res, next) => {
    try {
      const result = await listEntries(db, req.user, req.params.id);
      if (!result.ok) return sendError(res, result.status, result.code, result.message);
      res.json({ entries: result.entries });
    } catch (error) { next(error); }
  });
  app.post('/api/goals/:id/entries', requireSession(db), requireRole('PARTICIPANT'), express.json(), async (req, res, next) => {
    try {
      // The service checks ownership (404) before the body (400), then the rules.
      const result = await createEntry(db, req.user, req.params.id, req.body);
      if (!result.ok) return sendError(res, result.status, result.code, result.message);
      res.status(201).json({ entry: result.entry });
    } catch (error) { next(error); }
  });
}
