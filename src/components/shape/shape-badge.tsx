import type { GlyphName } from '@/glyphs/paths';
import type { ShapeKind } from '@/shapes/shapes';
import { Glyph, type GlyphSize } from '../glyph/glyph';
import { Shape } from './shape';
import styles from './shape.module.css';

type BadgeSize = 'menu' | 'badge';

type ShapeBadgeProps = {
  shape: ShapeKind;
  glyph: GlyphName;
  size?: BadgeSize;
  rotate?: number;
  className?: string;
};

const GLYPH_SIZE: Record<BadgeSize, GlyphSize> = { menu: 16, badge: 20 };

const SIZE_CLASS: Record<BadgeSize, string | undefined> = {
  menu: styles.menu,
  badge: styles.large,
};

// A glyph centered on an expressive shape. Colors come from the nearest data-tone.
export function ShapeBadge({ shape, glyph, size = 'badge', rotate, className }: ShapeBadgeProps) {
  return (
    <span
      className={[styles.badge, SIZE_CLASS[size], className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <Shape kind={shape} rotate={rotate} className={styles.badgeShape} />
      <span className={styles.badgeGlyph}>
        <Glyph name={glyph} size={GLYPH_SIZE[size]} />
      </span>
    </span>
  );
}
