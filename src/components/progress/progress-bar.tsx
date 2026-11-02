import styles from './progress.module.css';

type ProgressBarProps = { label: string; percent: number; inline?: boolean };

export function ProgressBar({ label, percent, inline = false }: ProgressBarProps) {
  const value = Math.min(100, Math.max(0, percent));
  return (
    <div
      className={inline ? `${styles.track} ${styles.inline}` : styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`${value}%`}
    >
      <div className={styles.fill} style={{ width: `${value}%` }} />
    </div>
  );
}
