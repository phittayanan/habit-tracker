import express from 'express';
import { requireRole, requireSession, sendError } from '../middleware/auth.js';
import { createTemplate, editTemplate, listTemplates, parseTemplateCreate, parseTemplateEdit, parseTemplateId, retireTemplate } from '../services/template.js';

export const templateRoutes = [
  { method: 'get', path: '/api/templates' },
  { method: 'post', path: '/api/templates', roles: ['MANAGER'] },
  { method: 'patch', path: '/api/templates/:id', requestPath: '/api/templates/1', roles: ['MANAGER'] },
  { method: 'post', path: '/api/templates/:id/retire', requestPath: '/api/templates/1/retire', roles: ['MANAGER'] },
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
  app.patch('/api/templates/:id', requireSession(db), requireRole('MANAGER'), express.json(), async (req, res, next) => {
    try {
      const parsed = parseTemplateEdit(req.params.id, req.body);
      if (!parsed.ok) return sendError(res, parsed.status, parsed.code, parsed.message);
      const edited = await editTemplate(db, parsed.id, parsed.data);
      if (!edited.ok) return sendError(res, edited.status, edited.code, edited.message);
      res.json({ template: edited.template });
    } catch (error) { next(error); }
  });
  app.post('/api/templates/:id/retire', requireSession(db), requireRole('MANAGER'), async (req, res, next) => {
    try {
      const parsed = parseTemplateId(req.params.id);
      if (!parsed.ok) return sendError(res, parsed.status, parsed.code, parsed.message);
      const result = await retireTemplate(db, parsed.id);
      if (!result.ok) return sendError(res, result.status, result.code, result.message);
      res.json({ template: result.template });
    } catch (error) { next(error); }
  });
}
