import express from 'express';
import { requireRole, requireSession, sendError } from '../middleware/auth.js';
import { parseGoalCreate, parseGoalId } from '../services/goal-rules.js';
import { changeTarget, createGoal, listGoals } from '../services/goal.js';
export const goalRoutes = [
  ...['get', 'post'].map(method => ({ method, path: '/api/goals', roles: ['PARTICIPANT'] })),
  { method: 'patch', path: '/api/goals/:id', requestPath: '/api/goals/1', roles: ['PARTICIPANT'] },
];
export function registerGoals(app, db) {
  app.get('/api/goals', requireSession(db), requireRole('PARTICIPANT'), async (req, res, next) => {
    try { res.json({ goals: await listGoals(db, req.user) }); } catch (error) { next(error); }
  });
  app.post('/api/goals', requireSession(db), requireRole('PARTICIPANT'), express.json(), async (req, res, next) => {
    try {
      const parsed = parseGoalCreate(req.body);
      if (!parsed.ok) return sendError(res, parsed.status, parsed.code, parsed.message);
      const result = await createGoal(db, req.user, parsed.data);
      if (!result.ok) return sendError(res, result.status, result.code, result.message);
      res.status(201).json({ goal: result.goal });
    } catch (error) { next(error); }
  });
  // F-14 goal change (Issue #153). Only dailyTarget is read; other body fields are ignored.
  app.patch('/api/goals/:id', requireSession(db), requireRole('PARTICIPANT'), express.json(), async (req, res, next) => {
    try {
      const id = parseGoalId(req.params.id);
      if (id === null) return sendError(res, 404, 'GOAL_NOT_FOUND', 'Goal not found.');
      const result = await changeTarget(db, req.user, id, req.body);
      if (!result.ok) return sendError(res, result.status, result.code, result.message);
      res.json({ goal: result.goal });
    } catch (error) { next(error); }
  });
}
