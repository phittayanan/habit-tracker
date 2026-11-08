// Test-only child process for restart persistence; production build copies src only.
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const server = createApp({ db }).listen(0, '127.0.0.1', () => process.send({ port: server.address().port }));
process.on('SIGTERM', () => server.close(async () => { await db.$disconnect(); process.exit(0); }));
