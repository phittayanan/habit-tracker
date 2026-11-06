import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { SESSION_LENGTH_MS } from './session.js';

export const publicUser = ({ id, username, displayName, role }) => ({ id, username, displayName, role });

export async function authenticate(db, credentials, previousSessionId) {
  const user = await db.user.findUnique({ where: { username: credentials.username } });
  // OP-01.12 is open: do not adopt the proposed dummy hash without agreement.
  if (!user || !await bcrypt.compare(credentials.password, user.passwordHash)) return null;
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
