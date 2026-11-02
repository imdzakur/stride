import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { COUNTDOWN_COOKIE_NAME, parseLaterOpen } from '@/shared/countdowns';

export const metadata: Metadata = { title: 'Dashboard' };

// Reading the layout cookie on the server keeps the later countdowns from flickering.
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const initialLaterOpen = parseLaterOpen(cookieStore.get(COUNTDOWN_COOKIE_NAME)?.value);
  return <DashboardView initialLaterOpen={initialLaterOpen} />;
}
