import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export const SESSION_COOKIE_NAME = 'stride_session';
export const SESSION_MAX_AGE_SECONDS = 604800;

const SESSION_SUBJECT = 'owner';
const CLOCK_SKEW_SECONDS = 60;
const TOKEN_PART = /^[A-Za-z0-9_-]+$/;

const payloadSchema = z.strictObject({
  v: z.literal(1),
  sub: z.literal(SESSION_SUBJECT),
  iat: z.number().int().nonnegative(),
  exp: z.number().int().positive(),
});

function sign(data: string, secret: Buffer): Buffer {
  return createHmac('sha256', secret).update(data, 'utf8').digest();
}

export function createSessionToken(
  secret: Buffer,
  nowMs = Date.now(),
): { token: string; maxAge: number } {
  const iat = Math.floor(nowMs / 1000);
  const payload = { v: 1, sub: SESSION_SUBJECT, iat, exp: iat + SESSION_MAX_AGE_SECONDS };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = sign(encoded, secret).toString('base64url');
  return { token: `${encoded}.${signature}`, maxAge: SESSION_MAX_AGE_SECONDS };
}

function decodePayload(encoded: string): z.infer<typeof payloadSchema> | null {
  try {
    const json: unknown = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    const result = payloadSchema.safeParse(json);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function verifySessionToken(
  token: string | undefined,
  secret: Buffer,
  nowMs = Date.now(),
): boolean {
  if (!token || token.length > 1024) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [encoded, signatureText] = parts as [string, string];
  if (!TOKEN_PART.test(encoded) || !TOKEN_PART.test(signatureText)) return false;

  const expected = sign(encoded, secret);
  const actual = Buffer.from(signatureText, 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;

  const payload = decodePayload(encoded);
  if (!payload) return false;
  const now = Math.floor(nowMs / 1000);
  if (payload.exp - payload.iat !== SESSION_MAX_AGE_SECONDS) return false;
  if (payload.iat > now + CLOCK_SKEW_SECONDS) return false;
  return payload.exp > now;
}
