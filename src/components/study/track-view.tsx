'use client';

import Link from 'next/link';
import { AREA_LABELS, type Track } from '@/shared/tracks';
import { TopicIcon, hasTopicIcon } from '../glyph/topic-icon';
import { ProgressBar } from '../progress/progress-bar';
import { ProgressSummary } from '../progress/progress-summary';
import { Shape } from '../shape/shape';
import { ShapeBadge } from '../shape/shape-badge';
import { AREA_SHAPES, nestedShape } from '../shape/track-shapes';
import pageStyles from '../shell/page.module.css';
import { TreeState } from './tree-state';
import styles from './study.module.css';

export function TrackView({ track }: { track: Track }) {
  const label = AREA_LABELS[track];
  return (
    <div data-tone={track}>
      <header className={pageStyles.header}>
        <ShapeBadge shape={AREA_SHAPES[track]} glyph={track} />
        <div className={pageStyles.headerText}>
          <p className={pageStyles.crumbs}>Track</p>
          <h1 className={pageStyles.title}>{label}</h1>
        </div>
      </header>
      <TreeState>
        {(tree) => {
          const node = tree.tracks.find((t) => t.track === track);
          if (!node || node.topics.length === 0) {
            return (
              <div className={`glass ${pageStyles.card}`}>
                <div className={pageStyles.empty}>
                  <Shape kind={AREA_SHAPES[track]} className={pageStyles.emptyShape} />
                  <p>No topics yet. Add them in the Supabase database.</p>
                </div>
              </div>
            );
          }
          return (
            <>
              <div className={`glass ${pageStyles.card}`}>
                <ProgressSummary label={`${label} progress`} counts={node.counts} />
              </div>
              <ul className={styles.topicGrid}>
                {node.topics.map((topic, index) => (
                  <li key={topic.id} className={`glass ${styles.topicCard}`}>
                    <Link href={`/${track}/${topic.slug}`} className={styles.topicHead}>
                      {hasTopicIcon(topic.title) ? (
                        <span className={styles.topicIcon}>
                          <TopicIcon title={topic.title} size={20} />
                        </span>
                      ) : (
                        <Shape kind={nestedShape(index)} className={styles.topicShape} />
                      )}
                      <span className={styles.topicTitle}>{topic.title}</span>
                      <span className={styles.percent}>{topic.counts.percent}%</span>
                    </Link>
                    <ProgressBar label={`${topic.title} progress`} percent={topic.counts.percent} />
                    <ul className={styles.chips}>
                      {topic.sections.map((section) => (
                        <li key={section.id}>
                          <Link
                            href={`/${track}/${topic.slug}/${section.slug}`}
                            className={styles.chip}
                          >
                            {section.title}
                            <span className={styles.chipCount}>
                              {section.counts.done}/{section.counts.total}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          );
        }}
      </TreeState>
    </div>
  );
}
