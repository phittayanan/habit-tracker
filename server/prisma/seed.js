import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const managerPassword = process.env.SEED_MANAGER_PASSWORD;
const participantPassword = process.env.SEED_PARTICIPANT_PASSWORD;
if (!managerPassword || !participantPassword) {
  console.error('Both SEED_MANAGER_PASSWORD and SEED_PARTICIPANT_PASSWORD are required.');
  process.exitCode = 1;
} else {
  const db = new PrismaClient();
  try {
    const [managerHash, participantHash] = await Promise.all([
      bcrypt.hash(managerPassword, 10), bcrypt.hash(participantPassword, 10),
    ]);
    await db.$transaction([
      ['manager1', 'Manager One', 'MANAGER', managerHash],
      ['participant1', 'Participant One', 'PARTICIPANT', participantHash],
      ['participant2', 'Participant Two', 'PARTICIPANT', participantHash],
    ].map(([username, displayName, role, passwordHash]) => {
      const data = { username, displayName, role, passwordHash };
      return db.user.upsert({ where: { username }, create: data, update: data });
    }));
    console.log('Seeded three accounts.');
  } catch {
    // Database errors can include SQL parameters; never log credentials or hashes.
    console.error('Could not seed accounts. Check database configuration.');
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}
