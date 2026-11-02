import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MENU_ORDER,
  moveEntry,
  parseMenuOrder,
  serializeMenuOrder,
} from '@/shared/menu-order';
import { sectionOrderSchema, topicOrderSchema } from '@/shared/schemas';
import { moveSectionInTree, moveTopicInTree } from '@/shared/tree-order';
import type { StudyTree } from '@/shared/types';

const zero = { done: 0, total: 0, percent: 0 };

function section(id: string) {
  return { id, slug: id, title: id, counts: zero, items: [] };
}

function topic(id: string, sections: string[] = []) {
  return { id, slug: id, title: id, counts: zero, sections: sections.map(section) };
}

const tree: StudyTree = {
  overall: zero,
  tracks: [
    {
      track: 'se',
      counts: zero,
      topics: [topic('java', ['basic', 'oop', 'advanced']), topic('git')],
    },
    { track: 'ai', counts: zero, topics: [topic('ml')] },
  ],
};

describe('moveEntry', () => {
  it('moves one entry up or down and ignores moves past either end', () => {
    expect(moveEntry(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
    expect(moveEntry(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
    expect(moveEntry(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
    expect(moveEntry(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'b', 'c']);
  });
});

describe('menu order cookie', () => {
  it('reads back what it wrote', () => {
    const order = {
      tracks: moveEntry(DEFAULT_MENU_ORDER.tracks, 4, -1),
      theory: moveEntry(DEFAULT_MENU_ORDER.theory, 1, -1),
      languages: [...DEFAULT_MENU_ORDER.languages],
      system: moveEntry(DEFAULT_MENU_ORDER.system, 0, 1),
    };
    expect(parseMenuOrder(serializeMenuOrder(order))).toEqual(order);
  });

  it('falls back to the default order and repairs damaged values', () => {
    expect(parseMenuOrder(undefined)).toEqual(DEFAULT_MENU_ORDER);
    expect(parseMenuOrder('garbage')).toEqual(DEFAULT_MENU_ORDER);
    const repaired = parseMenuOrder('v1:data.data.nope|stats');
    expect(repaired.tracks).toEqual(['data', 'se', 'ai', 'devops', 'dataeng']);
    expect(repaired.languages).toEqual(['english', 'mandarin', 'malay', 'japanese']);
    expect(repaired.theory).toEqual(['stats', 'math']);
    expect(repaired.system).toEqual(DEFAULT_MENU_ORDER.system);
  });
});

describe('moving topics and sections', () => {
  it('moves a topic within its track and returns the new id list', () => {
    const change = moveTopicInTree(tree, 'se', 'git', -1);
    expect(change?.ids).toEqual(['git', 'java']);
    expect(change?.tree.tracks[1]).toBe(tree.tracks[1]);
  });

  it('moves a section within its topic', () => {
    const change = moveSectionInTree(tree, 'java', 'basic', 1);
    expect(change?.ids).toEqual(['oop', 'basic', 'advanced']);
  });

  it('returns null when nothing moves', () => {
    expect(moveTopicInTree(tree, 'se', 'java', -1)).toBeNull();
    expect(moveTopicInTree(tree, 'ai', 'ml', 1)).toBeNull();
    expect(moveSectionInTree(tree, 'java', 'advanced', 1)).toBeNull();
    expect(moveSectionInTree(tree, 'missing', 'basic', 1)).toBeNull();
  });
});

describe('order requests', () => {
  const id = '6f1d4c0e-3b8a-4c1e-9a55-2d3f4b5c6d7e';

  it('accepts a track or topic with a list of ids', () => {
    expect(topicOrderSchema.parse({ track: 'se', ids: [id.toUpperCase()] })).toEqual({
      track: 'se',
      ids: [id],
    });
    expect(sectionOrderSchema.safeParse({ topicId: id, ids: [] }).success).toBe(true);
  });

  it('rejects unknown tracks, bad ids, and extra fields', () => {
    expect(topicOrderSchema.safeParse({ track: 'finance', ids: [id] }).success).toBe(false);
    expect(topicOrderSchema.safeParse({ track: 'se', ids: ['x'] }).success).toBe(false);
    expect(sectionOrderSchema.safeParse({ topicId: id, ids: [], title: 'x' }).success).toBe(false);
  });
});

describe('closed menu groups cookie', () => {
  it('starts with System closed and reads back what it wrote', async () => {
    const { parseClosedGroups, serializeClosedGroups } = await import('@/shared/menu-order');
    expect(parseClosedGroups(undefined)).toEqual(['system']);
    expect(parseClosedGroups('nonsense')).toEqual(['system']);
    expect(parseClosedGroups(serializeClosedGroups([]))).toEqual([]);
    expect(parseClosedGroups(serializeClosedGroups(['system', 'theory']))).toEqual([
      'theory',
      'system',
    ]);
    expect(parseClosedGroups('v1:system.nope.system')).toEqual(['system']);
  });

  it('keeps an older three-group order and adds the languages group', () => {
    const order = parseMenuOrder('v1:ai.se.data.devops.dataeng|stats.math|health.finance');
    expect(order.tracks[0]).toBe('ai');
    expect(order.theory).toEqual(['stats', 'math']);
    expect(order.system.slice(0, 2)).toEqual(['health', 'finance']);
    expect(order.languages).toEqual(['english', 'mandarin', 'malay', 'japanese']);
  });
});
