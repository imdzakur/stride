import 'server-only';
import type { Track } from '@/shared/tracks';
import type { Item, StudyTree } from '@/shared/types';
import { errors } from '../errors';
import { setItemDone } from '../repositories/items-repository';
import { reorderSections, reorderTopics } from '../repositories/order-repository';
import { fetchTopicTree } from '../repositories/tree-repository';
import { buildTree } from './progress-calc';
import { withDbErrors } from './db-error-map';

export async function getTree(): Promise<StudyTree> {
  return buildTree(await withDbErrors(fetchTopicTree));
}

export async function tickItem(id: string, done: boolean): Promise<Item> {
  const item = await withDbErrors(() => setItemDone(id, done));
  if (!item) throw errors.itemNotFound();
  return item;
}

export async function orderTopics(track: Track, ids: string[]): Promise<void> {
  await withDbErrors(() => reorderTopics(track, ids));
}

export async function orderSections(topicId: string, ids: string[]): Promise<void> {
  await withDbErrors(() => reorderSections(topicId, ids));
}
