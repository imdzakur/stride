'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useGateAllowed } from '@/components/device-gate/device-gate';
import type { Track } from '@/shared/tracks';
import type { Counts, Item, StudyTree, TrackNode } from '@/shared/types';
import { moveSectionInTree, moveTopicInTree } from '@/shared/tree-order';
import { apiRequest, errorMessage, isAbortError } from './api';

type Status = 'loading' | 'ready' | 'error';

type AppDataValue = {
  status: Status;
  tree: StudyTree | null;
  refresh: () => Promise<void>;
  trackNode: (track: Track) => TrackNode | null;
  // Returns an error message when the save fails; the tick is rolled back.
  toggleItem: (itemId: string, done: boolean) => Promise<string | null>;
  // Move one topic or section up (-1) or down (+1); an error message comes back on failure.
  moveTopic: (track: Track, topicId: string, delta: -1 | 1) => Promise<string | null>;
  moveSection: (topicId: string, sectionId: string, delta: -1 | 1) => Promise<string | null>;
};

const AppDataContext = createContext<AppDataValue | null>(null);

type TreeResult = { kind: 'ok'; tree: StudyTree } | { kind: 'error' } | { kind: 'aborted' };

async function requestTree(signal: AbortSignal): Promise<TreeResult> {
  try {
    const tree = await apiRequest<StudyTree>('/api/tree', { signal });
    return signal.aborted ? { kind: 'aborted' } : { kind: 'ok', tree };
  } catch (error) {
    return isAbortError(error) || signal.aborted ? { kind: 'aborted' } : { kind: 'error' };
  }
}

function percent(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((100 * done) / total);
}

function shift(counts: Counts, delta: number): Counts {
  const done = counts.done + delta;
  return { done, total: counts.total, percent: percent(done, counts.total) };
}

// Applies one tick locally so the checkbox, bars, and sidebar react at once.
function applyTick(tree: StudyTree, itemId: string, done: boolean): StudyTree {
  let delta = 0;
  const tracks = tree.tracks.map((trackNode) => {
    let trackDelta = 0;
    const topics = trackNode.topics.map((topic) => {
      let topicDelta = 0;
      const sections = topic.sections.map((section) => {
        let sectionDelta = 0;
        const items = section.items.map((item): Item => {
          if (item.id !== itemId || item.done === done) return item;
          sectionDelta = done ? 1 : -1;
          return { ...item, done };
        });
        if (sectionDelta === 0) return section;
        topicDelta += sectionDelta;
        return { ...section, items, counts: shift(section.counts, sectionDelta) };
      });
      if (topicDelta === 0) return topic;
      trackDelta += topicDelta;
      return { ...topic, sections, counts: shift(topic.counts, topicDelta) };
    });
    if (trackDelta === 0) return trackNode;
    delta += trackDelta;
    return { ...trackNode, topics, counts: shift(trackNode.counts, trackDelta) };
  });
  return delta === 0 ? tree : { tracks, overall: shift(tree.overall, delta) };
}

// The study tree feeds the sidebar, Dashboard, and every track page from one request.
export function AppDataProvider({ children }: { children: ReactNode }) {
  const allowed = useGateAllowed();
  const [status, setStatus] = useState<Status>('loading');
  const [tree, setTree] = useState<StudyTree | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const start = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return { controller, request: requestTree(controller.signal) };
  }, []);

  // Existing data stays if a refresh fails; the error only shows when there is no data yet.
  const apply = useCallback((result: TreeResult) => {
    if (result.kind === 'aborted') return;
    if (result.kind === 'ok') {
      setTree(result.tree);
      setStatus('ready');
    } else {
      setStatus((current) => (current === 'ready' ? current : 'error'));
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    const { controller, request } = start();
    request.then(apply);
    return () => controller.abort();
  }, [allowed, start, apply]);

  const refresh = useCallback(async () => {
    setStatus((current) => (current === 'error' ? 'loading' : current));
    apply(await start().request);
  }, [start, apply]);

  const toggleItem = useCallback(async (itemId: string, done: boolean) => {
    setTree((current) => (current ? applyTick(current, itemId, done) : current));
    try {
      await apiRequest(`/api/items/${itemId}`, { method: 'PATCH', body: { done } });
      return null;
    } catch (error) {
      setTree((current) => (current ? applyTick(current, itemId, !done) : current));
      return errorMessage(error, 'Could not save the tick.');
    }
  }, []);

  // The new order shows at once and is saved in the background. A failed save moves the entry
  // back on the current tree, so ticks made in the meantime are kept.
  const moveTopic = useCallback(
    async (track: Track, topicId: string, delta: -1 | 1) => {
      const change = tree ? moveTopicInTree(tree, track, topicId, delta) : null;
      if (!change) return null;
      setTree(change.tree);
      try {
        await apiRequest('/api/topics/order', {
          method: 'PATCH',
          body: { track, ids: change.ids },
        });
        return null;
      } catch (error) {
        setTree(
          (current) =>
            moveTopicInTree(current ?? change.tree, track, topicId, delta === 1 ? -1 : 1)?.tree ??
            current,
        );
        return errorMessage(error, 'Could not save the order.');
      }
    },
    [tree],
  );

  const moveSection = useCallback(
    async (topicId: string, sectionId: string, delta: -1 | 1) => {
      const change = tree ? moveSectionInTree(tree, topicId, sectionId, delta) : null;
      if (!change) return null;
      setTree(change.tree);
      try {
        await apiRequest('/api/sections/order', {
          method: 'PATCH',
          body: { topicId, ids: change.ids },
        });
        return null;
      } catch (error) {
        setTree(
          (current) =>
            moveSectionInTree(current ?? change.tree, topicId, sectionId, delta === 1 ? -1 : 1)
              ?.tree ?? current,
        );
        return errorMessage(error, 'Could not save the order.');
      }
    },
    [tree],
  );

  const value = useMemo<AppDataValue>(
    () => ({
      status,
      tree,
      refresh,
      toggleItem,
      moveTopic,
      moveSection,
      trackNode: (track) => tree?.tracks.find((node) => node.track === track) ?? null,
    }),
    [status, tree, refresh, toggleItem, moveTopic, moveSection],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData used outside AppDataProvider');
  return value;
}
