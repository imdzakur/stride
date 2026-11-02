import type { Track } from './tracks';

// Done and total items below a node; percent is rounded only at the end.
export type Counts = { done: number; total: number; percent: number };

export type Item = {
  id: string;
  title: string;
  note: string | null;
  done: boolean;
};

export type Section = {
  id: string;
  slug: string;
  title: string;
  counts: Counts;
  items: Item[];
};

export type Topic = {
  id: string;
  slug: string;
  title: string;
  counts: Counts;
  sections: Section[];
};

export type TrackNode = {
  track: Track;
  counts: Counts;
  topics: Topic[];
};

export type StudyTree = {
  overall: Counts;
  tracks: TrackNode[];
};

export type ApiErrorBody = {
  error: { code: string; message: string };
};
