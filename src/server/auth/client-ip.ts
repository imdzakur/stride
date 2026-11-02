import { createHmac } from 'node:crypto';

const LOCAL_BUCKET = 'local';

// On Vercel, x-forwarded-for is overwritten by the platform, so clients cannot spoof it.
// Elsewhere anyone can send that header, so all requests share one bucket.
export function getClientIp(headers: Headers): string {
  if (process.env.VERCEL !== '1') return LOCAL_BUCKET;
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  const realIp = headers.get('x-real-ip')?.trim();
  return realIp || LOCAL_BUCKET;
}

export function hashIp(ip: string, secret: Buffer): string {
  return createHmac('sha256', secret).update(ip, 'utf8').digest('hex');
}
