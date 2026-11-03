'use client';

import Link from 'next/link';
import { AREA_LABELS, type Track, areaHref } from '@/shared/tracks';
import { ProgressBar } from '../progress/progress-bar';
import { ProgressSummary } from '../progress/progress-summary';
import { ToneGlyph } from '../glyph/tone-glyph';
import pageStyles from '../shell/page.module.css';
import { NotFoundCard, TreeState } from './tree-state';
import styles from './study.module.css';

export function TopicView({ track, topicSlug }: { track: Track; topicSlug: string }) {
  return (
    <div data-tone={track}>
      <TreeState>
        {(tree) => {
          const topic = tree.tracks
            .find((t) => t.track === track)
            ?.topics.find((t) => t.slug === topicSlug);
          return (
            <>
              <header className={pageStyles.header}>
                <ToneGlyph glyph={track} />
                <div className={pageStyles.headerText}>
                  <p className={pageStyles.crumbs}>
                    <Link href={areaHref(track)}>{AREA_LABELS[track]}</Link>
                  </p>
                  <h1 className={pageStyles.title}>{topic?.title ?? 'Topic'}</h1>
                </div>
              </header>
              {!topic ? (
                <NotFoundCard message="Topic not found." />
              ) : (
                <>
                  <div className={`glass ${pageStyles.card}`}>
                    <ProgressSummary label={`${topic.title} progress`} counts={topic.counts} />
                  </div>
                  <ul className={styles.sectionList}>
                    {topic.sections.map((section, index) => (
                      <li key={section.id}>
                        <Link
                          href={`${areaHref(track)}/${topic.slug}/${section.slug}`}
                          className={`glass ${styles.sectionRow}`}
                        >
                          <span className={styles.number}>{index + 1}</span>
                          <span className={styles.sectionText}>
                            <span className={styles.topicTitle}>{section.title}</span>
                            <span className={styles.meta}>
                              {section.counts.done} of {section.counts.total} done
                            </span>
                          </span>
                          <span className={styles.rowBar}>
                            <ProgressBar
                              label={`${section.title} progress`}
                              percent={section.counts.percent}
                            />
                          </span>
                          <span className={styles.percent}>{section.counts.percent}%</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          );
        }}
      </TreeState>
    </div>
  );
}
