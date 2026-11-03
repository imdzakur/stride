// Tracks hold topics, sections, and items in the database (enum track_key). The menu shows
// practice tracks first, then theory and languages, each behind its own divider.
export const PRACTICE_TRACKS = ['se', 'ai', 'data', 'devops', 'dataeng'] as const;
export const THEORY_TRACKS = ['math', 'stats'] as const;
export const LANGUAGE_TRACKS = ['english', 'mandarin', 'malay', 'japanese'] as const;
export const TRACKS = [...PRACTICE_TRACKS, ...THEORY_TRACKS, ...LANGUAGE_TRACKS] as const;

// System areas are read-only system maps shipped with the app; they have no database rows.
export const SYSTEM_AREAS = ['finance', 'logistics', 'retail', 'health', 'travel'] as const;

export type Track = (typeof TRACKS)[number];
export type SystemArea = (typeof SYSTEM_AREAS)[number];
export type Area = Track | SystemArea;

export const AREA_LABELS: Record<Area, string> = {
  se: 'Software Engineering',
  ai: 'Intelligent System',
  data: 'Data Science',
  devops: 'Development and Operations',
  dataeng: 'Data Engineering',
  math: 'Mathematics',
  stats: 'Statistics',
  english: 'English',
  mandarin: 'Mandarin',
  malay: 'Malay',
  japanese: 'Japanese',
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
  ai: 'intelligent-system',
  data: 'data-science',
  devops: 'development-and-operations',
  dataeng: 'data-engineering',
  math: 'mathematics',
  stats: 'statistics',
  english: 'english',
  mandarin: 'mandarin',
  malay: 'malay',
  japanese: 'japanese',
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

// Earlier readable paths that were renamed since.
const RENAMED_SLUGS: Record<string, Area> = { 'intelligence-system': 'ai' };

// Old links used the short keys, for example /se, or a renamed path; both are redirected to
// the current readable path.
export function areaFromLegacyKey(value: string): Area | null {
  if (isTrack(value) || isSystemArea(value)) return value;
  return RENAMED_SLUGS[value] ?? null;
}
