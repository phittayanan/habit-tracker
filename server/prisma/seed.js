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
    const demoTemplates = process.env.SEED_DEMO_DATA === 'true' ? [
      ['Reading', 'pages', '1.00', '100.00'],
      ['Walking', 'steps', '0.00', '20000.00'],
      ['Water', 'glasses', '1.00', '12.00'],
    ] : [];
    await db.$transaction(async tx => {
      for (const [username, displayName, role, passwordHash] of [
        ['manager1', 'Manager One', 'MANAGER', managerHash],
        ['participant1', 'Participant One', 'PARTICIPANT', participantHash],
        ['participant2', 'Participant Two', 'PARTICIPANT', participantHash],
      ]) {
        const data = { username, displayName, role, passwordHash };
        await tx.user.upsert({ where: { username }, create: data, update: data });
      }
      if (demoTemplates.length) {
        const manager = await tx.user.findUniqueOrThrow({ where: { username: 'manager1' } });
        for (const [name, unit, minValue, maxValue] of demoTemplates) {
          const data = { unit, minValue, maxValue, createdBy: manager.id };
          await tx.template.upsert({ where: { name }, create: { name, ...data }, update: data });
        }
      }
    });
    console.log(demoTemplates.length ? 'Seeded three accounts and three templates.' : 'Seeded three accounts.');
  } catch {
    // Database errors can include SQL parameters; never log credentials or hashes.
    console.error('Could not seed accounts. Check database configuration.');
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}
