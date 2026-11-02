import type { CSSProperties } from 'react';
import styles from './skeleton.module.css';

type Shape = 'title' | 'line' | 'meta' | 'count' | 'cell' | 'bar';

// Visual placeholder only: never focusable and hidden from screen readers.
export function Skeleton({ shape, width }: { shape: Shape; width?: string }) {
  const style: CSSProperties | undefined = width ? { width } : undefined;
  return <span className={`${styles.block} ${styles[shape]}`} style={style} aria-hidden="true" />;
}

// Widths vary to resemble task titles of different lengths.
const ROW_WIDTHS = ['70%', '55%', '62%'];

export function TaskListSkeleton() {
  return (
    <div aria-hidden="true">
      {ROW_WIDTHS.map((width) => (
        <div key={width} className={styles.taskRow}>
          <span className={`${styles.block} ${styles.taskBox}`} />
          <span className={styles.taskText}>
            <span className={`${styles.block} ${styles.line}`} style={{ width }} />
            <span className={`${styles.block} ${styles.meta}`} style={{ width: '25%' }} />
          </span>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className={styles.stack} aria-hidden="true">
      <span className={`${styles.block} ${styles.title}`} />
      <span className={`${styles.block} ${styles.bar}`} />
      <TaskListSkeleton />
    </div>
  );
}
