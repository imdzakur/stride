import { createHash, timingSafeEqual } from 'node:crypto';
import { verifyPassword } from './password-hash';

// Fixed-size digests avoid timing differences caused by username length.
function usernameMatches(input: string, expected: string): boolean {
  const a = createHash('sha256').update(input, 'utf8').digest();
  const b = createHash('sha256').update(expected, 'utf8').digest();
  return timingSafeEqual(a, b);
}

export async function verifyCredentials(
  username: string,
  password: string,
  expected: { username: string; passwordHash: string },
): Promise<boolean> {
  const userOk = usernameMatches(username, expected.username);
  // The password is checked even when the username is wrong so failure paths look the same.
  const passwordOk = await verifyPassword(password, expected.passwordHash);
  return userOk && passwordOk;
}
