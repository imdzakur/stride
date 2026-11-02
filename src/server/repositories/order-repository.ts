import 'server-only';
import type { Track } from '@/shared/tracks';
import { getSupabase } from '../db/supabase';
import { throwIfError } from './rows';

// Both functions write the whole order at once and reject a list that does not match.
export async function reorderTopics(track: Track, ids: string[]): Promise<void> {
  const { error } = await getSupabase().rpc('reorder_topics', { p_track: track, p_ids: ids });
  throwIfError(error);
}

export async function reorderSections(topicId: string, ids: string[]): Promise<void> {
  const { error } = await getSupabase().rpc('reorder_sections', {
    p_topic: topicId,
    p_ids: ids,
  });
  throwIfError(error);
}
