// Tracks hold topics, sections, and items in the database (enum track_key). The menu shows
// practice tracks first, then theory and languages, each behind its own divider.
export const PRACTICE_TRACKS = ['se', 'ai', 'data', 'devops', 'dataeng'] as const;
export const THEORY_TRACKS = ['math', 'stats'] as const;
export const LANGUAGE_TRACKS = ['lang'] as const;
export const TRACKS = [...PRACTICE_TRACKS, ...THEORY_TRACKS, ...LANGUAGE_TRACKS] as const;

// System areas are read-only system maps shipped with the app; they have no database rows.
export const SYSTEM_AREAS = ['finance', 'logistics', 'retail', 'health', 'travel'] as const;

export type Track = (typeof TRACKS)[number];
export type SystemArea = (typeof SYSTEM_AREAS)[number];
export type Area = Track | SystemArea;

export const AREA_LABELS: Record<Area, string> = {
  se: 'Software Engineering',
  ai: 'Intelligence System',
  data: 'Data Science',
  devops: 'Development and Operations',
  dataeng: 'Data Engineering',
  lang: 'Languages',
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

// Readable URL path for each area. The short keys stay internal and in the database.
export const AREA_SLUGS: Record<Area, string> = {
  se: 'software-engineering',
  ai: 'intelligence-system',
  data: 'data-science',
  devops: 'development-and-operations',
  dataeng: 'data-engineering',
  lang: 'languages',
  math: 'mathematics',
  stats: 'statistics',
  finance: 'finance',
  logistics: 'logistics',
  retail: 'retail-and-commerce',
  health: 'health',
  travel: 'travel-and-hospitality',
};

const AREAS_BY_SLUG = new Map(
  (Object.entries(AREA_SLUGS) as [Area, string][]).map(([area, slug]) => [slug, area]),
);

export function areaHref(area: Area): string {
  return `/${AREA_SLUGS[area]}`;
}

export function areaFromSlug(slug: string): Area | null {
  return AREAS_BY_SLUG.get(slug) ?? null;
}

// Old links used the short keys, for example /se; they are redirected to the readable path.
export function areaFromLegacyKey(value: string): Area | null {
  return isTrack(value) || isSystemArea(value) ? value : null;
}
