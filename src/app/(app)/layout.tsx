import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppDataProvider } from '@/client/app-data';
import { DeviceGate } from '@/components/device-gate/device-gate';
import { AppShell } from '@/components/shell/app-shell';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';
import { isValidSessionToken } from '@/server/auth/session-check';
import { PANEL_COOKIE_NAME, parsePanelOpen } from '@/shared/panel';

// This layout only checks the session. It never queries tasks;
// data loads in the browser after DeviceGate passes. The panel cookie is read here so
// the topic panel renders open or closed without a jump.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  if (!isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)) redirect('/login');

  return (
    <DeviceGate>
      <AppDataProvider>
        <AppShell initialPanelOpen={parsePanelOpen(cookieStore.get(PANEL_COOKIE_NAME)?.value)}>
          {children}
        </AppShell>
      </AppDataProvider>
    </DeviceGate>
  );
}
