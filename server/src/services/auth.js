import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { SESSION_LENGTH_MS } from './session.js';

// Precomputed cost-10 hash of discarded random data, never an account credential.
const dummyPasswordHash = '$2b$10$0Sws8kjkBK5Qv3gczi7V9eke046vZR.oOXw2rVjfbQ3I4iSCEfe/e';

export const publicUser = ({ id, username, displayName, role }) => ({ id, username, displayName, role });

export async function authenticate(db, credentials, previousSessionId) {
  const user = await db.user.findUnique({ where: { username: credentials.username } });
  // OP-01.12: perform comparable bcrypt work for unknown usernames too.
  const matches = await bcrypt.compare(credentials.password, user ? user.passwordHash : dummyPasswordHash);
  if (!user || !matches) return null;
  const createdAt = new Date();
  const id = randomBytes(32).toString('base64url');
  await db.$transaction(async tx => {
    if (previousSessionId) await tx.session.deleteMany({ where: { id: previousSessionId } });
    await tx.session.create({ data: {
      id, userId: user.id, createdAt, expiresAt: new Date(createdAt.getTime() + SESSION_LENGTH_MS),
    } });
  });
  return { user: publicUser(user), sessionId: id };
}
