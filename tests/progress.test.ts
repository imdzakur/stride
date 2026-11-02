import { describe, expect, it } from 'vitest';
import { buildTree, progressPercent } from '@/server/services/progress-calc';
import type { TopicRow } from '@/server/repositories/rows';

let next = 0;
const id = () => `id-${(next += 1)}`;

function items(done: number, total: number) {
  return Array.from({ length: total }, (_, i) => ({
    id: id(),
    title: `Item ${i}`,
    note: null,
    done: i < done,
  }));
}

function topic(track: TopicRow['track'], title: string, sections: [string, number, number][]) {
  return {
    id: id(),
    track,
    slug: title.toLowerCase(),
    title,
    sections: sections.map(([name, done, total]) => ({
      id: id(),
      slug: name.toLowerCase(),
      title: name,
      items: items(done, total),
    })),
  } satisfies TopicRow;
}

describe('progressPercent', () => {
  it('returns 0 for empty groups instead of NaN or 100', () => {
    expect(progressPercent(0, 0)).toBe(0);
  });

  it('rounds only the final value', () => {
    expect(progressPercent(1, 3)).toBe(33);
    expect(progressPercent(2, 3)).toBe(67);
  });
});

describe('buildTree', () => {
  it('counts items up through section, topic, and track', () => {
    const java = topic('se', 'Java', [
      ['Basic', 4, 6],
      ['Intermediate', 1, 6],
      ['Advanced', 0, 6],
    ]);
    const tree = buildTree([java]);
    const se = tree.tracks.find((t) => t.track === 'se');
    expect(se?.topics[0]?.sections.map((s) => s.counts)).toEqual([
      { done: 4, total: 6, percent: 67 },
      { done: 1, total: 6, percent: 17 },
      { done: 0, total: 6, percent: 0 },
    ]);
    expect(se?.topics[0]?.counts).toEqual({ done: 5, total: 18, percent: 28 });
    expect(se?.counts).toEqual({ done: 5, total: 18, percent: 28 });
  });

  it('uses raw sums, not the average of percentages', () => {
    const tree = buildTree([
      topic('se', 'Java', [['Basic', 1, 2]]),
      topic('ai', 'Basics', [['Intro', 9, 10]]),
    ]);
    expect(tree.overall).toEqual({ done: 10, total: 12, percent: 83 });
  });

  it('always lists every track in order, empty ones at zero', () => {
    const tree = buildTree([]);
    expect(tree.tracks.map((t) => t.track)).toEqual([
      'se',
      'ai',
      'data',
      'devops',
      'dataeng',
      'math',
      'stats',
    ]);
    expect(tree.tracks.every((t) => t.counts.total === 0 && t.counts.percent === 0)).toBe(true);
    expect(tree.overall).toEqual({ done: 0, total: 0, percent: 0 });
  });

  it('keeps topics under their own track and in the given order', () => {
    const tree = buildTree([
      topic('se', 'Java', []),
      topic('math', 'Algebra', []),
      topic('se', 'Python', []),
    ]);
    expect(tree.tracks.find((t) => t.track === 'se')?.topics.map((t) => t.title)).toEqual([
      'Java',
      'Python',
    ]);
    expect(tree.tracks.find((t) => t.track === 'math')?.topics).toHaveLength(1);
  });
});
