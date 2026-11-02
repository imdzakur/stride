import { INTERNSHIP_COUNTDOWN, daysUntil } from '@/shared/countdowns';
import { Skeleton } from '../skeleton/skeleton';
import styles from './countdown.module.css';

// Time left in the internship, in whole days only.
export function InternshipCard({ now }: { now: number | null }) {
  const days = now === null ? null : daysUntil(INTERNSHIP_COUNTDOWN.date, now);

  return (
    <div className={`glass ${styles.internship}`}>
      <span className={styles.internshipDays}>
        {days === null ? (
          <Skeleton shape="cell" width="3rem" />
        ) : (
          <span className={styles.internshipValue}>{days}</span>
        )}
        <span className={styles.internshipUnit}>{days === 1 ? 'day left' : 'days left'}</span>
      </span>
      <span className={styles.body}>
        <span className={styles.internshipTitle}>{INTERNSHIP_COUNTDOWN.label}</span>
        <span className={styles.internshipDate}>Ends {INTERNSHIP_COUNTDOWN.dateLabel}</span>
      </span>
    </div>
  );
}
