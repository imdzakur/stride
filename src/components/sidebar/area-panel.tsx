'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAppData } from '@/client/app-data';
import { PANEL_COOKIE_MAX_AGE, PANEL_COOKIE_NAME, serializePanelOpen } from '@/shared/panel';
import { AREA_LABELS, isTrack } from '@/shared/tracks';
import { Glyph } from '../glyph/glyph';
import { TopicIcon, hasTopicIcon } from '../glyph/topic-icon';
import { ShapeBadge } from '../shape/shape-badge';
import { AREA_SHAPES } from '../shape/track-shapes';
import { Skeleton } from '../skeleton/skeleton';
import styles from './area-panel.module.css';

function savePanelOpen(open: boolean): void {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${PANEL_COOKIE_NAME}=${serializePanelOpen(open)}; Max-Age=${PANEL_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // The browser refused the cookie: the toggle still works for this visit.
  }
}

// The submenu opens beside the sidebar: topics of the current track, each with its sections.
// It can be closed to a slim rail; the main menu always stays open.
export function AreaPanel({ initialOpen }: { initialOpen: boolean }) {
  const pathname = usePathname();
  const { status, trackNode } = useAppData();
  const [open, setOpen] = useState(initialOpen);
  const [, area = ''] = pathname.split('/');
  if (!isTrack(area)) return null;

  const node = trackNode(area);
  const base = `/${area}`;
  const label = AREA_LABELS[area];

  const toggle = () => {
    const next = !open;
    setOpen(next);
    savePanelOpen(next);
  };

  if (!open) {
    return (
      <aside
        className={`glass ${styles.panel} ${styles.closed}`}
        data-tone={area}
        aria-label={`${label} topics, closed`}
      >
        <button
          type="button"
          className={styles.toggle}
          onClick={toggle}
          aria-expanded={false}
          aria-label={`Open ${label} topics`}
          title="Open topics"
        >
          <Glyph name="chevron" size={16} />
        </button>
        <Link href={base} className={styles.railBadge} aria-label={label}>
          <ShapeBadge shape={AREA_SHAPES[area]} glyph={area} size="menu" />
        </Link>
      </aside>
    );
  }

  return (
    <aside className={`glass ${styles.panel}`} data-tone={area} aria-label={`${label} topics`}>
      <div className={styles.head}>
        <div className={styles.headRow}>
          <p className={styles.eyebrow}>Track</p>
          <button
            type="button"
            className={`${styles.toggle} ${styles.toggleClose}`}
            onClick={toggle}
            aria-expanded={true}
            aria-controls="area-panel-content"
            aria-label={`Close ${label} topics`}
            title="Close topics"
          >
            <Glyph name="chevron" size={16} />
          </button>
        </div>
        <Link
          href={base}
          className={styles.title}
          aria-current={pathname === base ? 'page' : undefined}
        >
          {label}
        </Link>
        {node ? (
          <p className={styles.meta}>
            {node.counts.done}/{node.counts.total} items, {node.counts.percent}%
          </p>
        ) : null}
      </div>

      <div id="area-panel-content">
        {!node && status === 'loading' ? (
          <div className={styles.loading} aria-hidden="true">
            <Skeleton shape="line" width="70%" />
            <Skeleton shape="line" width="50%" />
            <Skeleton shape="line" width="60%" />
          </div>
        ) : null}

        {node && node.topics.length === 0 ? (
          <p className={styles.empty}>No topics yet. Add them in the database.</p>
        ) : null}

        {node ? (
          <ul className={styles.topics}>
            {node.topics.map((topic) => {
              const topicHref = `${base}/${topic.slug}`;
              return (
                <li key={topic.id} className={styles.topic}>
                  <Link
                    href={topicHref}
                    className={styles.topicLink}
                    aria-current={pathname === topicHref ? 'page' : undefined}
                  >
                    {hasTopicIcon(topic.title) ? (
                      <TopicIcon title={topic.title} size={16} />
                    ) : (
                      <span className={styles.dot} aria-hidden="true" />
                    )}
                    <span className={styles.label}>{topic.title}</span>
                    <span className={styles.count}>{topic.counts.percent}%</span>
                  </Link>
                  {topic.sections.length > 0 ? (
                    <ul className={styles.sections}>
                      {topic.sections.map((section) => {
                        const sectionHref = `${topicHref}/${section.slug}`;
                        return (
                          <li key={section.id}>
                            <Link
                              href={sectionHref}
                              className={styles.sectionLink}
                              aria-current={pathname === sectionHref ? 'page' : undefined}
                            >
                              <span className={styles.label}>{section.title}</span>
                              <span className={styles.fraction}>
                                {section.counts.done}/{section.counts.total}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </aside>
  );
}
