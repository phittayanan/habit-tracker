import assert from 'node:assert/strict';
import { METHODS } from 'node:http';
import express from 'express';
import request from 'supertest';

const mountPaths = new WeakMap();
const publicRoutes = new Set(['post /api/auth/login', 'get /api/health', 'get /api/ready']);
const keyOf = route => `${route.registrationMethod || route.method} ${route.path}`;
const pathsOf = path => {
  const paths = Array.isArray(path) ? path : [path];
  assert.ok(paths.every(value => typeof value === 'string'), 'Route audit needs explicit string paths; unsupported paths must not be silently skipped');
  return paths;
};

export function createAuditedApp(build) {
  // Express 5 hides mount patterns in matcher closures. Record only mount paths at
  // registration; discover routes/methods independently from the actual layer tree.
  const originalUse = express.Router.prototype.use;
  express.Router.prototype.use = function (...args) {
    const first = Array.isArray(args[0]) ? args[0].flat(Infinity)[0] : args[0];
    const path = typeof first === 'function' ? '/' : args[0];
    const start = this.stack.length;
    const result = originalUse.apply(this, args);
    for (const layer of this.stack.slice(start)) {
      if (layer.handle.stack) mountPaths.set(layer, pathsOf(path));
    }
    return result;
  };
  try { return build(); }
  finally { express.Router.prototype.use = originalUse; }
}

function discoverApiRoutes(app) {
  const found = [];
  function walk(stack, prefix = '') {
    for (const layer of stack) {
      if (layer.route) {
        for (const path of pathsOf(layer.route.path)) {
          const fullPath = `${prefix}${path === '/' && prefix ? '' : path}`;
          if (!/^\/api(?:\/|$)/i.test(fullPath)) continue;
          const methods = layer.route.methods._all
            ? METHODS.map(method => method.toLowerCase()) : Object.keys(layer.route.methods);
          for (const method of methods) found.push({ method, path: fullPath });
          if (methods.includes('get') && !methods.includes('head')) {
            found.push({ method: 'head', path: fullPath, registrationMethod: 'get' });
          }
        }
      } else if (layer.handle.stack) {
        assert.ok(mountPaths.has(layer), 'Construct mounted routers inside createAuditedApp so their paths are audited');
        for (const path of mountPaths.get(layer)) walk(layer.handle.stack, `${prefix}${path === '/' ? '' : path.replace(/\/$/, '')}`);
      }
    }
  }
  walk(app.router.stack);
  return found;
}

export async function assertProtectedRouteCoverage(app, routes, cookie) {
  const discovered = discoverApiRoutes(app);
  const registered = new Map(routes.map(route => [keyOf(route), route]));
  assert.equal(registered.size, routes.length, 'Duplicate protected coverage entries');
  const protectedEndpoints = discovered.filter(route => !publicRoutes.has(keyOf(route)));
  for (const route of protectedEndpoints) {
    assert.ok(registered.has(keyOf(route)), `Uncovered API route: ${route.method} ${route.path}`);
  }
  for (const route of routes) {
    assert.ok(protectedEndpoints.some(found => keyOf(found) === keyOf(route)), `Stale protected coverage entry: ${keyOf(route)}`);
  }
  for (const route of protectedEndpoints) {
    const coverage = registered.get(keyOf(route));
    const path = coverage.requestPath || route.path;
    assert.ok(!path.includes(':'), `Supply a requestPath fixture for ${keyOf(route)}`);
    const anonymousRequest = request(app)[route.method](path);
    if (route.method !== 'head') anonymousRequest.send({ name: 'valid' });
    const anonymous = await anonymousRequest;
    assert.equal(anonymous.status, 401, `${route.method} ${path}: expected 401`);
    if (route.method !== 'head') assert.deepEqual(anonymous.body, { error: { code: 'UNAUTHENTICATED', message: 'Please log in.' } });
    if (coverage.roles?.length === 1) {
      const wrongRoleCookie = typeof cookie === 'function' ? await cookie(coverage.roles[0]) : cookie;
      const forbiddenRequest = request(app)[route.method](path).set('Cookie', wrongRoleCookie);
      if (route.method !== 'head') forbiddenRequest.send({ name: 'valid' });
      const forbidden = await forbiddenRequest;
      assert.equal(forbidden.status, 403);
      if (route.method !== 'head') assert.deepEqual(forbidden.body, { error: { code: 'FORBIDDEN', message: 'You do not have permission to do this.' } });
    }
  }
}
