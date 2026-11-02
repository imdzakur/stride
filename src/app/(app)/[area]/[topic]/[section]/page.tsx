import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SectionView } from '@/components/study/section-view';
import { isSlug } from '@/shared/schemas';
import { AREA_LABELS, areaFromSlug, isTrack } from '@/shared/tracks';

type PageProps = { params: Promise<{ area: string; topic: string; section: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const area = areaFromSlug((await params).area);
  return { title: area ? AREA_LABELS[area] : 'Not found' };
}

export default async function SectionPage({ params }: PageProps) {
  const { area: slug, topic, section } = await params;
  const area = areaFromSlug(slug);
  if (!area || !isTrack(area) || !isSlug(topic) || !isSlug(section)) notFound();
  return <SectionView track={area} topicSlug={topic} sectionSlug={section} />;
}
