import { TRACKS } from '@/shared/tracks';
import type { Counts, Section, StudyTree, Topic, TrackNode } from '@/shared/types';
import type { TopicRow } from '../repositories/rows';

export function progressPercent(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((100 * done) / total);
}

function counts(done: number, total: number): Counts {
  return { done, total, percent: progressPercent(done, total) };
}

// Sums raw counts upward; percentages are never averaged.
function sum(list: Counts[]): Counts {
  const done = list.reduce((acc, c) => acc + c.done, 0);
  const total = list.reduce((acc, c) => acc + c.total, 0);
  return counts(done, total);
}

function buildTopic(row: TopicRow): Topic {
  const sections: Section[] = row.sections.map((section) => ({
    id: section.id,
    slug: section.slug,
    title: section.title,
    items: section.items,
    counts: counts(section.items.filter((item) => item.done).length, section.items.length),
  }));
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    sections,
    counts: sum(sections.map((section) => section.counts)),
  };
}

export function buildTree(rows: TopicRow[]): StudyTree {
  const tracks: TrackNode[] = TRACKS.map((track) => {
    const topics = rows.filter((row) => row.track === track).map(buildTopic);
    return { track, topics, counts: sum(topics.map((topic) => topic.counts)) };
  });
  return { tracks, overall: sum(tracks.map((track) => track.counts)) };
}
