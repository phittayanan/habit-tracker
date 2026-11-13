import { defineConfig } from 'vite';
// Build label (ADR 0052): the deploy job passes the commit; any other build shows "dev".
process.env.VITE_BUILD_SHA = (process.env.VITE_BUILD_SHA || 'dev').slice(0, 7);
export default defineConfig({ server: { proxy: { '/api': 'http://127.0.0.1:3000' } } });
