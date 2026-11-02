import type { ShapeKind } from '@/shapes/shapes';
import { localMidnight, remainingUntil, type Countdown } from '@/shared/countdowns';
import { Shape } from '../shape/shape';
import { Skeleton } from '../skeleton/skeleton';
import styles from './countdown.module.css';

const TONE_CLASS = {
  red: styles.red,
  orange: styles.orange,
  neutral: styles.neutral,
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

type CountdownCardProps = { countdown: Countdown; shape: ShapeKind; now: number | null };

export function CountdownCard({ countdown, shape, now }: CountdownCardProps) {
  const remaining = now === null ? null : remainingUntil(localMidnight(countdown.date), now);
  const units: [string, string][] = remaining
    ? [
        [pad(remaining.hours), 'hrs'],
        [pad(remaining.minutes), 'min'],
        [pad(remaining.seconds), 'sec'],
      ]
    : [];
  const readable = remaining
    ? `${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes left`
    : 'Loading';

  return (
    <li className={`glass ${styles.card} ${TONE_CLASS[countdown.tone]}`}>
      <span className={styles.days}>
        <Shape kind={shape} className={styles.daysShape} />
        <span className={styles.daysText} aria-hidden="true">
          {remaining === null ? null : (
            <>
              <span className={styles.daysValue}>{remaining.done ? '0' : remaining.days}</span>
              <span className={styles.daysUnit}>{remaining.days === 1 ? 'day' : 'days'}</span>
            </>
          )}
        </span>
      </span>
      <span className={styles.body}>
        <span className={styles.label}>{countdown.label}</span>
        <span className="sr-only">{readable}</span>
        {remaining === null ? (
          <span className={styles.units} aria-hidden="true">
            {[0, 1, 2].map((key) => (
              <span key={key} className={styles.unit}>
                <Skeleton shape="cell" width="2rem" />
              </span>
            ))}
          </span>
        ) : null}
        {remaining?.done ? <span className={styles.reached}>Reached</span> : null}
        {remaining && !remaining.done ? (
          <span className={styles.units} aria-hidden="true">
            {units.map(([value, unit]) => (
              <span key={unit} className={styles.unit}>
                <span className={styles.value}>{value}</span>
                <span className={styles.unitLabel}>{unit}</span>
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </li>
  );
}
