import { GLYPHS, type GlyphName } from '@/glyphs/paths';
import styles from './glyph.module.css';

export type GlyphSize = 16 | 20 | 24;

const SIZE_CLASS: Record<GlyphSize, string | undefined> = {
  16: styles.small,
  20: styles.medium,
  24: styles.large,
};

type GlyphProps = { name: GlyphName; size?: GlyphSize; className?: string };

// Glyphs are always decorative; the accessible name lives on the button or adjacent text.
export function Glyph({ name, size = 20, className }: GlyphProps) {
  return (
    <svg
      className={[styles.glyph, SIZE_CLASS[size], className].filter(Boolean).join(' ')}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      // The source is only constants from src/glyphs/paths.ts, never user input.
      dangerouslySetInnerHTML={{ __html: GLYPHS[name] }}
    />
  );
}
