import { randomBytes, scryptSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyCredentials } from '@/server/auth/credentials';
import { parsePasswordHash, verifyPassword } from '@/server/auth/password-hash';

function makeHash(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return ['scrypt', 16384, 8, 1, salt.toString('base64'), key.toString('base64')].join(':');
}

const stored = makeHash('a-long-test-password');

describe('password hash', () => {
  it('verifies the correct password and rejects others', async () => {
    expect(await verifyPassword('a-long-test-password', stored)).toBe(true);
    expect(await verifyPassword('wrong', stored)).toBe(false);
  });

  it('rejects malformed or weak hash formats before comparing', async () => {
    expect(parsePasswordHash('plaintext')).toBeNull();
    expect(parsePasswordHash(stored.replace('16384', '1024'))).toBeNull();
    expect(parsePasswordHash(stored.replace(':16384:', ':16000:'))).toBeNull();
    expect(await verifyPassword('a-long-test-password', 'scrypt:1:1:1:AA==:AA==')).toBe(false);
  });

  it('requires both username and password to match', async () => {
    const expected = { username: 'owner', passwordHash: stored };
    expect(await verifyCredentials('owner', 'a-long-test-password', expected)).toBe(true);
    expect(await verifyCredentials('someone-else', 'a-long-test-password', expected)).toBe(false);
    expect(await verifyCredentials('owner', 'wrong', expected)).toBe(false);
  });
});
