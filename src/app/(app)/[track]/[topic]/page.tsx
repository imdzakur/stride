import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TopicView } from '@/components/study/topic-view';
import { isSlug } from '@/shared/schemas';
import { AREA_LABELS, isTrack } from '@/shared/tracks';

type PageProps = { params: Promise<{ track: string; topic: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { track } = await params;
  return { title: isTrack(track) ? AREA_LABELS[track] : 'Not found' };
}

// The URL is checked here; whether the topic exists is decided after DeviceGate loads the tree.
export default async function TopicPage({ params }: PageProps) {
  const { track, topic } = await params;
  if (!isTrack(track) || !isSlug(topic)) notFound();
  return <TopicView track={track} topicSlug={topic} />;
}
