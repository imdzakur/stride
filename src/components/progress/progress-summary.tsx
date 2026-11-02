import type { Counts } from '@/shared/types';
import { Skeleton } from '../skeleton/skeleton';
import { ProgressBar } from './progress-bar';
import styles from './progress.module.css';

type ProgressSummaryProps = { label: string; counts: Counts | null };

// counts null means data is not available yet; numbers never fall back to 0.
export function ProgressSummary({ label, counts }: ProgressSummaryProps) {
  return (
    <section className={styles.summary} aria-label={label}>
      <div className={styles.summaryText}>
        <span className={styles.summaryLabel}>{label}</span>
        {counts ? (
          <span className={styles.numbers}>
            {counts.done}/{counts.total} done, {counts.percent}%
          </span>
        ) : (
          <Skeleton shape="meta" width="7rem" />
        )}
      </div>
      {counts ? <ProgressBar label={label} percent={counts.percent} /> : <Skeleton shape="bar" />}
    </section>
  );
}
