'use client';

import Link from 'next/link';
import { AREA_LABELS, type Track, areaHref } from '@/shared/tracks';
import { ProgressSummary } from '../progress/progress-summary';
import { ToneGlyph } from '../glyph/tone-glyph';
import pageStyles from '../shell/page.module.css';
import { Checklist } from './checklist';
import { NotFoundCard, TreeState } from './tree-state';

type SectionViewProps = { track: Track; topicSlug: string; sectionSlug: string };

export function SectionView({ track, topicSlug, sectionSlug }: SectionViewProps) {
  return (
    <div data-tone={track}>
      <TreeState>
        {(tree) => {
          const topic = tree.tracks
            .find((t) => t.track === track)
            ?.topics.find((t) => t.slug === topicSlug);
          const section = topic?.sections.find((s) => s.slug === sectionSlug);
          return (
            <>
              <header className={pageStyles.header}>
                <ToneGlyph glyph={track} />
                <div className={pageStyles.headerText}>
                  <p className={pageStyles.crumbs}>
                    <Link href={areaHref(track)}>{AREA_LABELS[track]}</Link>
                    {topic ? (
                      <>
                        <span aria-hidden="true">/</span>
                        <Link href={`${areaHref(track)}/${topic.slug}`}>{topic.title}</Link>
                      </>
                    ) : null}
                  </p>
                  <h1 className={pageStyles.title}>{section?.title ?? 'Section'}</h1>
                </div>
              </header>
              {!topic || !section ? (
                <NotFoundCard message="Section not found." />
              ) : (
                <>
                  <div className={`glass ${pageStyles.card}`}>
                    <ProgressSummary label={`${section.title} progress`} counts={section.counts} />
                  </div>
                  <div className={`glass ${pageStyles.card}`}>
                    <Checklist title={`${topic.title} ${section.title}`} items={section.items} />
                  </div>
                </>
              )}
            </>
          );
        }}
      </TreeState>
    </div>
  );
}
