import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from '@/server/auth/session';

const secret = randomBytes(32);
const now = Date.UTC(2026, 10, 2, 8, 0, 0);

describe('session token', () => {
  it('accepts a fresh token signed with the same secret', () => {
    const { token, maxAge } = createSessionToken(secret, now);
    expect(maxAge).toBe(SESSION_MAX_AGE_SECONDS);
    expect(verifySessionToken(token, secret, now + 1000)).toBe(true);
  });

  it('stays valid across requests until expiry and is rejected after 7 days', () => {
    const { token } = createSessionToken(secret, now);
    expect(verifySessionToken(token, secret, now + (SESSION_MAX_AGE_SECONDS - 1) * 1000)).toBe(
      true,
    );
    expect(verifySessionToken(token, secret, now + SESSION_MAX_AGE_SECONDS * 1000)).toBe(false);
  });

  it('rejects tokens signed with another secret', () => {
    const { token } = createSessionToken(randomBytes(32), now);
    expect(verifySessionToken(token, secret, now)).toBe(false);
  });

  it('rejects a modified payload', () => {
    const { token } = createSessionToken(secret, now);
    const [, signature] = token.split('.');
    const forged = Buffer.from(
      JSON.stringify({ v: 1, sub: 'owner', iat: now / 1000, exp: now / 1000 + 10 ** 9 }),
    ).toString('base64url');
    expect(verifySessionToken(`${forged}.${signature}`, secret, now)).toBe(false);
  });

  it('rejects missing, malformed, and cookie-only values', () => {
    expect(verifySessionToken(undefined, secret, now)).toBe(false);
    expect(verifySessionToken('', secret, now)).toBe(false);
    expect(verifySessionToken('abc', secret, now)).toBe(false);
    expect(verifySessionToken('a.b.c', secret, now)).toBe(false);
    expect(verifySessionToken('true', secret, now)).toBe(false);
  });
});
