import express from 'express';
import { requireRole, requireSession, sendError } from '../middleware/auth.js';
import { createTemplate, listTemplates, parseTemplateCreate } from '../services/template.js';

export const templateRoutes = [
  { method: 'get', path: '/api/templates' },
  { method: 'post', path: '/api/templates', roles: ['MANAGER'] },
];

export function registerTemplates(app, db) {
  app.get('/api/templates', requireSession(db), async (req, res, next) => {
    try { res.json({ templates: await listTemplates(db, req.user) }); }
    catch (error) { next(error); }
  });
  app.post('/api/templates', requireSession(db), requireRole('MANAGER'), express.json(), async (req, res, next) => {
    try {
      const parsed = parseTemplateCreate(req.body);
      if (!parsed.ok) return sendError(res, parsed.status, parsed.code, parsed.message);
      const created = await createTemplate(db, req.user, parsed.data);
      if (!created.ok) return sendError(res, created.status, created.code, created.message);
      res.status(201).json({ template: created.template });
    } catch (error) { next(error); }
  });
}
