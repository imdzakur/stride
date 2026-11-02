// Learning tracks hold topics, sections, and items in the database (enum track_key).
export const TRACKS = ['se', 'ai', 'data', 'math', 'stats'] as const;

// System areas are read-only system maps shipped with the app; they have no database rows.
export const SYSTEM_AREAS = ['finance', 'logistics', 'retail', 'health', 'travel'] as const;

export type Track = (typeof TRACKS)[number];
export type SystemArea = (typeof SYSTEM_AREAS)[number];
export type Area = Track | SystemArea;

export const AREA_LABELS: Record<Area, string> = {
  se: 'Software Engineering',
  ai: 'Artificial Intelligence',
  data: 'Data Science',
  math: 'Mathematics',
  stats: 'Statistics',
  finance: 'Finance',
  logistics: 'Logistics',
  retail: 'Retail and Commerce',
  health: 'Health',
  travel: 'Travel and Hospitality',
};

export function isTrack(value: string): value is Track {
  return (TRACKS as readonly string[]).includes(value);
}

export function isSystemArea(value: string): value is SystemArea {
  return (SYSTEM_AREAS as readonly string[]).includes(value);
}
