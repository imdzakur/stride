import type { ReactNode } from 'react';
import { AreaPanel } from '../sidebar/area-panel';
import { Sidebar } from '../sidebar/sidebar';
import styles from './app-shell.module.css';

export function AppShell({
  children,
  initialPanelOpen,
}: {
  children: ReactNode;
  initialPanelOpen: boolean;
}) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <AreaPanel initialOpen={initialPanelOpen} />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
