import 'server-only';
import { getClientIp, hashIp } from '../auth/client-ip';
import { verifyCredentials } from '../auth/credentials';
import { createSessionToken } from '../auth/session';
import { getEnv } from '../env';
import { DatabaseError, errors } from '../errors';
import { reserveLoginAttempt } from '../repositories/login-attempts-repository';

async function reserveAttempt(headers: Headers): Promise<void> {
  const env = getEnv();
  const ipHash = hashIp(getClientIp(headers), env.rateLimitSecret);
  let allowed: boolean;
  try {
    allowed = await reserveLoginAttempt(ipHash);
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error('rate_limit_unavailable', error.pgCode ?? 'unknown');
    }
    throw errors.unavailable();
  }
  if (!allowed) throw errors.tooManyAttempts();
}

export async function login(
  username: string,
  password: string,
  headers: Headers,
): Promise<{ token: string; maxAge: number; secure: boolean }> {
  const env = getEnv();
  // An attempt is reserved before checking the password; a DB failure stops the login.
  await reserveAttempt(headers);
  const ok = await verifyCredentials(username, password, {
    username: env.appUsername,
    passwordHash: env.appPasswordHash,
  });
  if (!ok) throw errors.invalidCredentials();
  const { token, maxAge } = createSessionToken(env.sessionSecret);
  return { token, maxAge, secure: env.secureCookies };
}
