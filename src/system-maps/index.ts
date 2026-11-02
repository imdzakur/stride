import type { SystemArea } from '@/shared/tracks';
import { FINANCE_MAP } from './finance';
import { LOGISTICS_MAP } from './logistics';
import type { SystemMap } from './types';

// Areas without rules and source documents yet show an empty state instead of a map.
export const SYSTEM_MAPS: Partial<Record<SystemArea, SystemMap>> = {
  finance: FINANCE_MAP,
  logistics: LOGISTICS_MAP,
};

export function systemMap(area: SystemArea): SystemMap | null {
  return SYSTEM_MAPS[area] ?? null;
}
