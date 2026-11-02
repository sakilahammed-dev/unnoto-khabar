import crypto from 'crypto';

const SALT = process.env.ADMIN_JWT_SECRET || 'unnoto_khabar_super_secure_secret_key_2026';

/**
 * Hash a password using PBKDF2 (SHA-512)
 */
export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SALT, 10000, 64, 'sha512').toString('hex');
}

/**
 * Verify a password against its hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const computed = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

/**
 * Create a simple tamper-proof signed session token
 */
export function createSessionToken(userId: string, username: string): string {
  const payload = JSON.stringify({
    userId,
    username,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  });
  const b64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', SALT).update(b64Payload).digest('base64url');
  return `${b64Payload}.${signature}`;
}

/**
 * Verify a session token
 */
export function verifySessionToken(token: string): { userId: string; username: string } | null {
  try {
    const [b64Payload, signature] = token.split('.');
    if (!b64Payload || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', SALT).update(b64Payload).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) return null;

    return { userId: payload.userId, username: payload.username };
  } catch {
    return null;
  }
}
