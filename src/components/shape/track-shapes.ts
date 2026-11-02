import type { ShapeKind } from '@/shapes/shapes';
import type { Area } from '@/shared/tracks';

// Soft, symmetric silhouettes that stay clean at small sizes.
export const AREA_SHAPES: Record<Area, ShapeKind> = {
  se: 'cookie6',
  ai: 'clover4',
  data: 'cookie4',
  math: 'pentagon',
  stats: 'cookie9',
  finance: 'cookie7',
  logistics: 'puffy',
  retail: 'clover8',
  health: 'gem',
  travel: 'cookie12',
};

export const DASHBOARD_SHAPE: ShapeKind = 'cookie12';

// Topics and sections cycle through gentle shapes so neighbors look different.
const NESTED_SHAPES: ShapeKind[] = ['cookie7', 'puffy', 'clover8', 'cookie9', 'cookie4'];

export function nestedShape(index: number): ShapeKind {
  return NESTED_SHAPES[index % NESTED_SHAPES.length] ?? 'circle';
}
