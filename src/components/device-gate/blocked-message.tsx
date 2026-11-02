import { Glyph } from '../glyph/glyph';
import { BrandGlyph } from '../glyph/wordmark';
import styles from './blocked-message.module.css';

export function BlockedMessage() {
  return (
    <main className={styles.page}>
      <div className={`glass ${styles.card}`}>
        <div className={styles.glyphs}>
          <BrandGlyph size={32} />
          <Glyph name="desktop" size={24} />
        </div>
        <h1 className={styles.text}>Stride only works on a laptop or desktop.</h1>
      </div>
    </main>
  );
}
