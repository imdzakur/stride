import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrackView } from '@/components/study/track-view';
import { SystemView } from '@/components/system-map/system-view';
import { AREA_LABELS, AREA_SLUGS, areaFromSlug, isSystemArea, isTrack } from '@/shared/tracks';

// Only the tracks and the five System areas exist as routes, each under its readable slug.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(AREA_SLUGS).map((area) => ({ area }));
}

type PageProps = { params: Promise<{ area: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const area = areaFromSlug((await params).area);
  return { title: area ? AREA_LABELS[area] : 'Not found' };
}

export default async function AreaPage({ params }: PageProps) {
  const area = areaFromSlug((await params).area);
  if (area && isSystemArea(area)) return <SystemView area={area} />;
  if (!area || !isTrack(area)) notFound();
  return <TrackView track={area} />;
}
