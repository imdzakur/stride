import 'server-only';
import { isTrack } from '@/shared/tracks';
import { getSupabase } from '../db/supabase';
import { TREE_COLUMNS, parseRows, rawTopicRowSchema, throwIfError, type TopicRow } from './rows';

const BY_ORDER = { ascending: true } as const;

export async function fetchTopicTree(): Promise<TopicRow[]> {
  const { data, error } = await getSupabase()
    .from('topics')
    .select(TREE_COLUMNS)
    .order('track', BY_ORDER)
    .order('sort_order', BY_ORDER)
    .order('title', BY_ORDER)
    .order('id', BY_ORDER)
    .order('sort_order', { ...BY_ORDER, referencedTable: 'sections' })
    .order('title', { ...BY_ORDER, referencedTable: 'sections' })
    .order('sort_order', { ...BY_ORDER, referencedTable: 'sections.items' })
    .order('created_at', { ...BY_ORDER, referencedTable: 'sections.items' })
    .order('id', { ...BY_ORDER, referencedTable: 'sections.items' });
  throwIfError(error);
  // Topics on a retired track, such as lang, are skipped. This filter runs here rather than in
  // the query, because a query naming an enum value the database lacks fails as a whole.
  return parseRows(rawTopicRowSchema, data).filter((row): row is TopicRow => isTrack(row.track));
}
