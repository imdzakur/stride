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
  it('lists practice tracks, theory tracks, and the five System maps', async () => {
    const { PRACTICE_TRACKS, THEORY_TRACKS, SYSTEM_AREAS, AREA_LABELS, isTrack, isSystemArea } =
      await import('@/shared/tracks');
    expect(PRACTICE_TRACKS.map((t) => AREA_LABELS[t])).toEqual([
      'Software Engineering',
      'Intelligence System',
      'Data Science',
      'Development and Operations',
      'Data Engineering',
      'Languages',
    ]);
    expect(THEORY_TRACKS.map((t) => AREA_LABELS[t])).toEqual(['Mathematics', 'Statistics']);
    expect(SYSTEM_AREAS).toHaveLength(5);
    expect(isTrack('devops')).toBe(true);
    expect(isTrack('finance')).toBe(false);
    expect(isSystemArea('health')).toBe(true);
    expect(trackSchema.safeParse('finance').success).toBe(false);
  });
});

describe('area slugs', () => {
  it('gives every area a readable path and reads it back', async () => {
    const { AREA_SLUGS, areaFromSlug, areaHref, areaFromLegacyKey } =
      await import('@/shared/tracks');
    expect(areaHref('se')).toBe('/software-engineering');
    expect(areaHref('devops')).toBe('/development-and-operations');
    for (const [area, slug] of Object.entries(AREA_SLUGS)) {
      expect(isSlug(slug)).toBe(true);
      expect(areaFromSlug(slug)).toBe(area);
    }
    expect(new Set(Object.values(AREA_SLUGS)).size).toBe(Object.keys(AREA_SLUGS).length);
    expect(areaFromSlug('se')).toBeNull();
    expect(areaFromLegacyKey('se')).toBe('se');
    expect(areaFromLegacyKey('software-engineering')).toBeNull();
  });
});
