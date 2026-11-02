import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrackView } from '@/components/study/track-view';
import { SystemView } from '@/components/system-map/system-view';
import { AREA_LABELS, SYSTEM_AREAS, TRACKS, isSystemArea, isTrack } from '@/shared/tracks';

// Only the five tracks and the five System areas exist as routes.
export const dynamicParams = false;

export function generateStaticParams() {
  return [...TRACKS, ...SYSTEM_AREAS].map((track) => ({ track }));
}

type PageProps = { params: Promise<{ track: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { track } = await params;
  return { title: isTrack(track) || isSystemArea(track) ? AREA_LABELS[track] : 'Not found' };
}

export default async function AreaPage({ params }: PageProps) {
  const { track } = await params;
  if (isSystemArea(track)) return <SystemView area={track} />;
  if (!isTrack(track)) notFound();
  return <TrackView track={track} />;
}
