import { Button } from '../ui/button';
import styles from './page.module.css';

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={styles.status} role="alert">
      <span>{message}</span>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
