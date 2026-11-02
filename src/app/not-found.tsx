import Link from 'next/link';
import styles from '@/components/device-gate/blocked-message.module.css';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={`glass ${styles.card}`}>
        <h1 className={styles.text}>Page not found.</h1>
        <Link href="/dashboard">Open Dashboard</Link>
      </div>
    </main>
  );
}
