import 'server-only';
import type { Item } from '@/shared/types';
import { getSupabase } from '../db/supabase';
import { ITEM_COLUMNS, itemRowSchema, parseRow, throwIfError } from './rows';

// The backend role may only change items.done; null means the item does not exist.
export async function setItemDone(id: string, done: boolean): Promise<Item | null> {
  const { data, error } = await getSupabase()
    .from('items')
    .update({ done })
    .eq('id', id)
    .select(ITEM_COLUMNS)
    .maybeSingle();
  throwIfError(error);
  return parseRow(itemRowSchema, data);
}
