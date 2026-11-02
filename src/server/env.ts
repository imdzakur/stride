import { z } from 'zod';
import { parsePasswordHash } from './auth/password-hash';

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

const secretSchema = z
  .string()
  .regex(BASE64_PATTERN)
  .transform((value) => Buffer.from(value, 'base64'))
  .refine((buffer) => buffer.length >= 32);

const envSchema = z.object({
  APP_USERNAME: z.string().min(1).max(256),
  APP_PASSWORD_HASH: z.string().refine((value) => parsePasswordHash(value) !== null),
  APP_URL: z
    .url()
    .transform((value) => new URL(value))
    .refine((url) => url.protocol === 'http:' || url.protocol === 'https:'),
  SESSION_SECRET: secretSchema,
  RATE_LIMIT_SECRET: secretSchema,
  SUPABASE_URL: z.url().refine((value) => value.startsWith('https://')),
  SUPABASE_SECRET_KEY: z.string().min(20),
});

export type ServerEnv = {
  appUsername: string;
  appPasswordHash: string;
  appOrigin: string;
  secureCookies: boolean;
  sessionSecret: Buffer;
  rateLimitSecret: Buffer;
  supabaseUrl: string;
  supabaseSecretKey: string;
};

export class EnvError extends Error {
  constructor(public readonly variables: string[]) {
    // Only variable names are reported; values are never printed.
    super(`Invalid server configuration: ${variables.join(', ')}`);
    this.name = 'EnvError';
  }
}

let cached: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cached) return cached;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const names = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    throw new EnvError(names);
  }
  const env = result.data;
  cached = {
    appUsername: env.APP_USERNAME,
    appPasswordHash: env.APP_PASSWORD_HASH,
    appOrigin: env.APP_URL.origin,
    secureCookies: env.APP_URL.protocol === 'https:',
    sessionSecret: env.SESSION_SECRET,
    rateLimitSecret: env.RATE_LIMIT_SECRET,
    supabaseUrl: env.SUPABASE_URL,
    supabaseSecretKey: env.SUPABASE_SECRET_KEY,
  };
  return cached;
}
