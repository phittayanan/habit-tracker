import { PrismaClient } from '@prisma/client';
import { createApp } from './app.js';

const db = new PrismaClient();
const app = createApp({ db });
const server = app.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Habit Tracker server started.'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  server.close(async () => { await db.$disconnect(); process.exit(0); });
});
