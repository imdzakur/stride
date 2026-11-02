'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAppData } from '@/client/app-data';
import { PANEL_COOKIE_MAX_AGE, PANEL_COOKIE_NAME, serializePanelOpen } from '@/shared/panel';
import { AREA_LABELS, areaFromSlug, areaHref, isTrack } from '@/shared/tracks';
import { Glyph } from '../glyph/glyph';
import { TopicIcon, hasTopicIcon } from '../glyph/topic-icon';
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

// The submenu opens beside the sidebar: topics of the current track, each opening to its
// sections. Only one topic is open at a time; on the track page all start closed. Closed,
// the panel shrinks to a line in the track color along the edge of the main sidebar.
export function AreaPanel({ initialOpen }: { initialOpen: boolean }) {
  const pathname = usePathname();
  const { status, trackNode } = useAppData();
  const [open, setOpen] = useState(initialOpen);
  // A topic picked by hand applies to the page it was picked on; a new page opens the
  // topic that page belongs to, or none on the track page.
  const [picked, setPicked] = useState<{ path: string; slug: string | null } | null>(null);
  const [, areaSlug = '', activeSlug = null] = pathname.split('/');
  const area = areaFromSlug(areaSlug);
  if (!area || !isTrack(area)) return null;

  const node = trackNode(area);
  const base = areaHref(area);
  const label = AREA_LABELS[area];
  const openSlug = picked && picked.path === pathname ? picked.slug : activeSlug;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    savePanelOpen(next);
  };

  const toggleTopic = (slug: string) => {
    setPicked({ path: pathname, slug: openSlug === slug ? null : slug });
  };

  if (!open) {
    return (
      <button
        type="button"
        className={styles.edge}
        data-tone={area}
        onClick={toggle}
        aria-expanded={false}
        aria-label={`Open ${label} topics`}
        title="Open topics"
      >
        <span className={styles.edgeLine} aria-hidden="true" />
      </button>
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
              const expanded = openSlug === topic.slug;
              const listId = `panel-topic-${topic.id}`;
              return (
                <li key={topic.id} className={styles.topic}>
                  <button
                    type="button"
                    className={styles.topicButton}
                    aria-expanded={expanded}
                    aria-controls={listId}
                    data-active={activeSlug === topic.slug || undefined}
                    onClick={() => toggleTopic(topic.slug)}
                  >
                    {hasTopicIcon(topic.title) ? (
                      <TopicIcon title={topic.title} size={16} />
                    ) : (
                      <span className={styles.dot} aria-hidden="true" />
                    )}
                    <span className={styles.label}>{topic.title}</span>
                    <span className={styles.count}>{topic.counts.percent}%</span>
                    <span className={styles.chevron} aria-hidden="true">
                      <Glyph name="chevron" size={16} />
                    </span>
                  </button>
                  {expanded ? (
                    <ul id={listId} className={styles.sections}>
                      <li>
                        <Link
                          href={topicHref}
                          className={styles.sectionLink}
                          aria-current={pathname === topicHref ? 'page' : undefined}
                        >
                          <span className={styles.label}>All sections</span>
                        </Link>
                      </li>
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
