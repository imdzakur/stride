import { shapePath, type ShapeKind } from '@/shapes/shapes';

type ShapeProps = { kind: ShapeKind; rotate?: number; className?: string };

// Decorative fill shape; color comes from currentColor so CSS decides the tone.
export function Shape({ kind, rotate = 0, className }: ShapeProps) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <path d={shapePath(kind, rotate)} fill="currentColor" />
    </svg>
  );
}
