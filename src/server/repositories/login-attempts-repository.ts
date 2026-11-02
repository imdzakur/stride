import 'server-only';
import { z } from 'zod';
import { DatabaseError } from '../errors';
import { getSupabase } from '../db/supabase';
import { throwIfError } from './rows';

export async function reserveLoginAttempt(ipHash: string): Promise<boolean> {
  const { data, error } = await getSupabase().rpc('reserve_login_attempt', { p_ip_hash: ipHash });
  throwIfError(error);
  const result = z.boolean().safeParse(data);
  if (!result.success) throw new DatabaseError('row_shape', 'unexpected rpc result');
  return result.data;
}
