import type { GlyphName } from '@/glyphs/paths';
import { Glyph } from './glyph';
import styles from './glyph.module.css';

type ToneGlyphProps = { glyph: GlyphName; size?: 'menu' | 'header'; className?: string };

// An area glyph in the nearest data-tone color, with nothing drawn behind it.
export function ToneGlyph({ glyph, size = 'header', className }: ToneGlyphProps) {
  return (
    <span
      className={[styles.tone, size === 'menu' ? undefined : styles.toneHeader, className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <Glyph name={glyph} size={size === 'menu' ? 20 : 24} />
    </span>
  );
}
