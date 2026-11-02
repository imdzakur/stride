import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TopicView } from '@/components/study/topic-view';
import { isSlug } from '@/shared/schemas';
import { AREA_LABELS, areaFromSlug, isTrack } from '@/shared/tracks';

type PageProps = { params: Promise<{ area: string; topic: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const area = areaFromSlug((await params).area);
  return { title: area ? AREA_LABELS[area] : 'Not found' };
}

// The URL is checked here; whether the topic exists is decided after DeviceGate loads the tree.
export default async function TopicPage({ params }: PageProps) {
  const { area: slug, topic } = await params;
  const area = areaFromSlug(slug);
  if (!area || !isTrack(area) || !isSlug(topic)) notFound();
  return <TopicView track={area} topicSlug={topic} />;
}
