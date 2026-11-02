import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SectionView } from '@/components/study/section-view';
import { isSlug } from '@/shared/schemas';
import { AREA_LABELS, isTrack } from '@/shared/tracks';

type PageProps = { params: Promise<{ track: string; topic: string; section: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { track } = await params;
  return { title: isTrack(track) ? AREA_LABELS[track] : 'Not found' };
}

export default async function SectionPage({ params }: PageProps) {
  const { track, topic, section } = await params;
  if (!isTrack(track) || !isSlug(topic) || !isSlug(section)) notFound();
  return <SectionView track={track} topicSlug={topic} sectionSlug={section} />;
}
