import { getEnv } from '../env';
import { verifySessionToken } from './session';

// Broken configuration counts as an invalid session; there is no way in without the secret.
export function isValidSessionToken(token: string | undefined): boolean {
  try {
    return verifySessionToken(token, getEnv().sessionSecret);
  } catch {
    return false;
  }
}
