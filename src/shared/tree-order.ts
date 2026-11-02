import { moveEntry } from './menu-order';
import type { StudyTree } from './types';
import type { Track } from './tracks';

export type OrderChange = { tree: StudyTree; ids: string[] };

// Moves one topic within its track. Returns null when nothing moves, for example at either end.
export function moveTopicInTree(
  tree: StudyTree,
  track: Track,
  topicId: string,
  delta: -1 | 1,
): OrderChange | null {
  const node = tree.tracks.find((t) => t.track === track);
  const index = node?.topics.findIndex((topic) => topic.id === topicId) ?? -1;
  if (!node || index < 0) return null;
  const topics = moveEntry(node.topics, index, delta);
  if (topics[index] === node.topics[index]) return null;
  return {
    tree: { ...tree, tracks: tree.tracks.map((t) => (t === node ? { ...t, topics } : t)) },
    ids: topics.map((topic) => topic.id),
  };
}

// Moves one section within its topic, with the same rules as topics.
export function moveSectionInTree(
  tree: StudyTree,
  topicId: string,
  sectionId: string,
  delta: -1 | 1,
): OrderChange | null {
  for (const node of tree.tracks) {
    const topic = node.topics.find((t) => t.id === topicId);
    if (!topic) continue;
    const index = topic.sections.findIndex((section) => section.id === sectionId);
    if (index < 0) return null;
    const sections = moveEntry(topic.sections, index, delta);
    if (sections[index] === topic.sections[index]) return null;
    const topics = node.topics.map((t) => (t === topic ? { ...t, sections } : t));
    return {
      tree: { ...tree, tracks: tree.tracks.map((t) => (t === node ? { ...t, topics } : t)) },
      ids: sections.map((section) => section.id),
    };
  }
  return null;
}
