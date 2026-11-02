import 'server-only';
import { z } from 'zod';
import type { Track } from '@/shared/tracks';
import { DatabaseError } from '../errors';

export const itemRowSchema = z.object({
  id: z.string(),
  title: z.string(),
  note: z.string().nullable(),
  done: z.boolean(),
});

export const sectionRowSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  items: z.array(itemRowSchema),
});

// The track is read as text and checked afterwards, so an unknown value never fails the tree.
export const rawTopicRowSchema = z.object({
  id: z.string(),
  track: z.string(),
  slug: z.string(),
  title: z.string(),
  sections: z.array(sectionRowSchema),
});

export type ItemRow = z.infer<typeof itemRowSchema>;
export type TopicRow = Omit<z.infer<typeof rawTopicRowSchema>, 'track'> & { track: Track };

export const ITEM_COLUMNS = 'id,title,note,done';
// One embedded select reads the whole tree in a single statement, so all counts share a snapshot.
export const TREE_COLUMNS = `id,track,slug,title,sections(id,slug,title,items(${ITEM_COLUMNS}))`;

type PostgrestErrorLike = { code?: string; message: string } | null;

export function throwIfError(error: PostgrestErrorLike): void {
  if (error) throw new DatabaseError(error.code, error.message);
}

export function parseRows<T>(schema: z.ZodType<T>, data: unknown): T[] {
  const result = z.array(schema).safeParse(data ?? []);
  if (!result.success) throw new DatabaseError('row_shape', 'unexpected row shape');
  return result.data;
}

export function parseRow<T>(schema: z.ZodType<T>, data: unknown): T | null {
  if (data === null || data === undefined) return null;
  const result = schema.safeParse(data);
  if (!result.success) throw new DatabaseError('row_shape', 'unexpected row shape');
  return result.data;
}
