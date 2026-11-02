import { Glyph } from '../glyph/glyph';
import styles from './ui.module.css';

type MoveButtonsProps = {
  label: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (delta: -1 | 1) => void;
};

// Up and down buttons shown in reorder mode; the end of a list disables the matching button.
export function MoveButtons({ label, isFirst, isLast, onMove }: MoveButtonsProps) {
  return (
    <span className={styles.moveButtons}>
      <button
        type="button"
        className={styles.moveButton}
        aria-label={`Move ${label} up`}
        disabled={isFirst}
        onClick={() => onMove(-1)}
      >
        <Glyph name="chevron" size={16} className={styles.moveUp} />
      </button>
      <button
        type="button"
        className={styles.moveButton}
        aria-label={`Move ${label} down`}
        disabled={isLast}
        onClick={() => onMove(1)}
      >
        <Glyph name="chevron" size={16} className={styles.moveDown} />
      </button>
    </span>
  );
}
