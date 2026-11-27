import express from 'express';
import { requireRole, requireSession, sendError } from '../middleware/auth.js';
import { createEntry, deleteEntry, editEntry, listEntries } from '../services/entry.js';

export const entryRoutes = [
  ...['get', 'post'].map(method => ({ method, path: '/api/goals/:id/entries', roles: ['PARTICIPANT'], requestPath: '/api/goals/1/entries' })),
  // F-13 (Issue #154).
  ...['patch', 'delete'].map(method => ({ method, path: '/api/goals/:id/entries/:entryId', roles: ['PARTICIPANT'], requestPath: '/api/goals/1/entries/1' })),
];

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
  app.patch('/api/goals/:id/entries/:entryId', requireSession(db), requireRole('PARTICIPANT'), express.json(), async (req, res, next) => {
    try {
      const result = await editEntry(db, req.user, req.params.id, req.params.entryId, req.body);
      if (!result.ok) return sendError(res, result.status, result.code, result.message);
      res.json({ entry: result.entry });
    } catch (error) { next(error); }
  });
  app.delete('/api/goals/:id/entries/:entryId', requireSession(db), requireRole('PARTICIPANT'), async (req, res, next) => {
    try {
      const result = await deleteEntry(db, req.user, req.params.id, req.params.entryId);
      if (!result.ok) return sendError(res, result.status, result.code, result.message);
      res.status(204).end();
    } catch (error) { next(error); }
  });
}
