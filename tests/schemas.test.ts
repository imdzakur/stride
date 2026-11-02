import { describe, expect, it } from 'vitest';
import { isSlug, itemUpdateSchema, trackSchema } from '@/shared/schemas';

describe('item updates', () => {
  it('only accepts a done flag', () => {
    expect(itemUpdateSchema.parse({ done: true })).toEqual({ done: true });
    expect(itemUpdateSchema.safeParse({}).success).toBe(false);
    expect(itemUpdateSchema.safeParse({ done: 'yes' }).success).toBe(false);
  });

  it('rejects content changes, which belong in the database', () => {
    expect(itemUpdateSchema.safeParse({ done: true, title: 'x' }).success).toBe(false);
    expect(itemUpdateSchema.safeParse({ done: true, section_id: 'x' }).success).toBe(false);
  });
});

describe('route segments', () => {
  it('accepts slugs the database generates', () => {
    expect(isSlug('java')).toBe(true);
    expect(isSlug('java-basics')).toBe(true);
    expect(isSlug('c2')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isSlug('Java')).toBe(false);
    expect(isSlug('java_basics')).toBe(false);
    expect(isSlug('-java')).toBe(false);
    expect(isSlug('java--basics')).toBe(false);
    expect(isSlug('')).toBe(false);
    expect(isSlug('a'.repeat(101))).toBe(false);
  });

  it('accepts only known areas', () => {
    expect(trackSchema.safeParse('se').success).toBe(true);
    expect(trackSchema.safeParse('history').success).toBe(false);
  });
});

describe('area groups', () => {
  it('keeps five database tracks apart from the five System maps', async () => {
    const { TRACKS, SYSTEM_AREAS, AREA_LABELS, isTrack, isSystemArea } =
      await import('@/shared/tracks');
    expect(TRACKS).toHaveLength(5);
    expect(SYSTEM_AREAS.map((area) => AREA_LABELS[area])).toEqual([
      'Finance',
      'Logistics',
      'Retail and Commerce',
      'Health',
      'Travel and Hospitality',
    ]);
    expect(isTrack('se')).toBe(true);
    expect(isTrack('finance')).toBe(false);
    expect(isSystemArea('health')).toBe(true);
    expect(trackSchema.safeParse('finance').success).toBe(false);
  });
});
