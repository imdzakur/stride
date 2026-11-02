import { z } from 'zod';
import { TRACKS } from './tracks';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Same shape the database generates from titles: lowercase words joined by hyphens.
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const trackSchema = z.enum(TRACKS, { error: 'Unknown track.' });

export const uuidSchema = z.string().regex(UUID_PATTERN, { error: 'Invalid ID.' });

// The app only ticks and unticks items; all other changes happen in the database.
export const itemUpdateSchema = z.strictObject({
  done: z.boolean({ error: 'done must be true or false.' }),
});

export const loginSchema = z.strictObject({
  username: z
    .string({ error: 'Username is required.' })
    .min(1, { error: 'Username is required.' })
    .max(256, { error: 'Username is too long.' }),
  password: z
    .string({ error: 'Password is required.' })
    .min(1, { error: 'Password is required.' })
    .max(1024, { error: 'Password is too long.' }),
});

// A new order is the full list of ids, first to last. Ids are lowercased like route ids.
const orderIdsSchema = z
  .array(
    uuidSchema.transform((id) => id.toLowerCase()),
    { error: 'ids must be a list.' },
  )
  .max(500, { error: 'Too many ids.' });

export const topicOrderSchema = z.strictObject({ track: trackSchema, ids: orderIdsSchema });

export const sectionOrderSchema = z.strictObject({
  topicId: uuidSchema.transform((id) => id.toLowerCase()),
  ids: orderIdsSchema,
});

export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>;

export function isSlug(value: string): boolean {
  return value.length <= 100 && SLUG_PATTERN.test(value);
}

export function firstIssueMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'Invalid data.';
  if (issue.code === 'unrecognized_keys') return `Unknown field: ${issue.keys.join(', ')}.`;
  if (issue.path.length === 0 && issue.code === 'invalid_type') return 'Invalid request body.';
  return issue.message;
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!(key in result)) result[key] = issue.message;
  }
  return result;
}
