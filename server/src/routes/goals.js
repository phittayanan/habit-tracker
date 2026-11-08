import express from 'express';
import { requireRole, requireSession, sendError } from '../middleware/auth.js';
import { parseGoalCreate } from '../services/goal-rules.js';
import { createGoal, listGoals } from '../services/goal.js';
export const goalRoutes = ['get', 'post'].map(method => ({ method, path: '/api/goals', roles: ['PARTICIPANT'] }));
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
}
