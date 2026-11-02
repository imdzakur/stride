import type { ReactNode } from 'react';
import { MenuOrderProvider } from '@/client/menu-order';
import type { MenuOrder } from '@/shared/menu-order';
import { AreaPanel } from '../sidebar/area-panel';
import { Sidebar } from '../sidebar/sidebar';
import styles from './app-shell.module.css';

export function AppShell({
  children,
  initialPanelOpen,
  initialPanelWidth,
  initialMenuOrder,
}: {
  children: ReactNode;
  initialPanelOpen: boolean;
  initialPanelWidth: number;
  initialMenuOrder: MenuOrder;
}) {
  return (
    <MenuOrderProvider initial={initialMenuOrder}>
      <div className={styles.shell}>
        <Sidebar />
        <AreaPanel initialOpen={initialPanelOpen} initialWidth={initialPanelWidth} />
        <main className={styles.main}>
          <div className={styles.content}>{children}</div>
        </main>
      </div>
    </MenuOrderProvider>
  );
}
