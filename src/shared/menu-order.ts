import { LANGUAGE_TRACKS, PRACTICE_TRACKS, SYSTEM_AREAS, THEORY_TRACKS } from './tracks';

// The order of the main menu groups, kept in a cookie so the server renders it without a jump.
// Only known keys survive; keys added to the app later are appended at the end of their group.
export const MENU_COOKIE_NAME = 'stride_menu';
export const MENU_COOKIE_MAX_AGE = 31536000;

// Groups in the order the menu shows them.
const GROUPS = {
  tracks: PRACTICE_TRACKS,
  theory: THEORY_TRACKS,
  languages: LANGUAGE_TRACKS,
  system: SYSTEM_AREAS,
} as const;

export type MenuGroup = keyof typeof GROUPS;

export type MenuOrder = { [G in MenuGroup]: (typeof GROUPS)[G][number][] };

export const MENU_GROUPS = Object.keys(GROUPS) as MenuGroup[];

// Cookie segments keep their first order; languages came later and is appended.
const COOKIE_SEGMENTS: MenuGroup[] = ['tracks', 'theory', 'system', 'languages'];

export const DEFAULT_MENU_ORDER: MenuOrder = {
  tracks: [...PRACTICE_TRACKS],
  theory: [...THEORY_TRACKS],
  languages: [...LANGUAGE_TRACKS],
  system: [...SYSTEM_AREAS],
};

function normalize<T extends string>(given: readonly string[], all: readonly T[]): T[] {
  const known = new Set<string>(all);
  const seen = new Set<string>();
  const ordered: T[] = [];
  for (const key of given) {
    if (known.has(key) && !seen.has(key)) {
      seen.add(key);
      ordered.push(key as T);
    }
  }
  return [...ordered, ...all.filter((key) => !seen.has(key))];
}

// Format: v1:se.ai.data|math.stats|finance.logistics|lang, one segment per group.
export function parseMenuOrder(value: string | undefined): MenuOrder {
  if (!value?.startsWith('v1:')) return DEFAULT_MENU_ORDER;
  const segments = value.slice(3).split('|');
  return {
    tracks: normalize((segments[0] ?? '').split('.'), PRACTICE_TRACKS),
    theory: normalize((segments[1] ?? '').split('.'), THEORY_TRACKS),
    languages: normalize((segments[3] ?? '').split('.'), LANGUAGE_TRACKS),
    system: normalize((segments[2] ?? '').split('.'), SYSTEM_AREAS),
  };
}

export function serializeMenuOrder(order: MenuOrder): string {
  return `v1:${COOKIE_SEGMENTS.map((group) => order[group].join('.')).join('|')}`;
}

// Moves one entry up (-1) or down (+1); a move past either end leaves the list unchanged.
export function moveEntry<T>(list: readonly T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return [...list];
  const next = [...list];
  const [entry] = next.splice(index, 1);
  next.splice(target, 0, entry as T);
  return next;
}

// Menu groups the person closed, kept in their own cookie. All groups start open.
export const MENU_GROUPS_COOKIE_NAME = 'stride_menu_groups';

export function parseClosedGroups(value: string | undefined): MenuGroup[] {
  if (!value?.startsWith('v1:')) return [];
  const known = new Set<string>(MENU_GROUPS);
  return [...new Set(value.slice(3).split('.'))].filter((g): g is MenuGroup => known.has(g));
}

export function serializeClosedGroups(closed: readonly MenuGroup[]): string {
  return `v1:${MENU_GROUPS.filter((group) => closed.includes(group)).join('.')}`;
}
