import type { Metadata } from 'next';
import { BlockedMessage } from '@/components/device-gate/blocked-message';

export const metadata: Metadata = { title: 'Device not supported' };

export default function BlockedPage() {
  return <BlockedMessage />;
}
