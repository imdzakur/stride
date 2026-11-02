'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAppData } from '@/client/app-data';
import {
  PANEL_COOKIE_MAX_AGE,
  PANEL_COOKIE_NAME,
  PANEL_WIDTH_COOKIE_NAME,
  serializePanelOpen,
  serializePanelWidth,
} from '@/shared/panel';
import { AREA_LABELS, areaFromSlug, areaHref, isTrack } from '@/shared/tracks';
import { Glyph } from '../glyph/glyph';
import { TopicIcon, hasTopicIcon } from '../glyph/topic-icon';
import { Skeleton } from '../skeleton/skeleton';
import { MoveButtons } from '../ui/move-buttons';
import styles from './area-panel.module.css';
import { PanelResizer } from './panel-resizer';

function saveCookie(name: string, value: string): void {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${value}; Max-Age=${PANEL_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // The browser refused the cookie: the setting still holds for this visit.
  }
}

// The submenu opens beside the sidebar: topics of the current track, each opening to its
// sections. Only one topic is open at a time; on the track page all start closed. Closed,
// the panel shrinks to a line in the track color along the edge of the main sidebar.
export function AreaPanel({
  initialOpen,
  initialWidth,
}: {
  initialOpen: boolean;
  initialWidth: number;
}) {
  const pathname = usePathname();
  const { status, trackNode, moveTopic, moveSection } = useAppData();
  const [open, setOpen] = useState(initialOpen);
  const [width, setWidth] = useState(initialWidth);
  const [editing, setEditing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
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
    saveCookie(PANEL_COOKIE_NAME, serializePanelOpen(next));
  };

  const toggleTopic = (slug: string) => {
    setPicked({ path: pathname, slug: openSlug === slug ? null : slug });
  };

  // Each move shows at once; a failed save puts it back and explains why.
  const report = (result: Promise<string | null>) => {
    setOrderError(null);
    void result.then(setOrderError);
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
    <>
      <aside
        className={`glass ${styles.panel}`}
        style={{ width: `${width}px` }}
        data-tone={area}
        aria-label={`${label} topics`}
      >
        <div className={styles.head}>
          <div className={styles.headRow}>
            <p className={styles.eyebrow}>Track</p>
            <button
              type="button"
              className={styles.reorder}
              aria-pressed={editing}
              onClick={() => {
                setEditing((value) => !value);
                setOrderError(null);
              }}
            >
              {editing ? 'Done' : 'Reorder'}
            </button>
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
          {orderError ? (
            <p className={styles.error} role="alert">
              {orderError}
            </p>
          ) : null}
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
              {node.topics.map((topic, topicIndex) => {
                const topicHref = `${base}/${topic.slug}`;
                const expanded = openSlug === topic.slug;
                const listId = `panel-topic-${topic.id}`;
                return (
                  <li key={topic.id} className={styles.topic}>
                    <div className={styles.topicRow}>
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
                        {editing ? null : (
                          <>
                            <span className={styles.count}>{topic.counts.percent}%</span>
                            <span className={styles.chevron} aria-hidden="true">
                              <Glyph name="chevron" size={16} />
                            </span>
                          </>
                        )}
                      </button>
                      {editing ? (
                        <MoveButtons
                          label={topic.title}
                          isFirst={topicIndex === 0}
                          isLast={topicIndex === node.topics.length - 1}
                          onMove={(delta) => report(moveTopic(area, topic.id, delta))}
                        />
                      ) : null}
                    </div>
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
                        {topic.sections.map((section, sectionIndex) => {
                          const sectionHref = `${topicHref}/${section.slug}`;
                          return (
                            <li key={section.id} className={editing ? styles.moveRow : undefined}>
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
                              {editing ? (
                                <MoveButtons
                                  label={section.title}
                                  isFirst={sectionIndex === 0}
                                  isLast={sectionIndex === topic.sections.length - 1}
                                  onMove={(delta) =>
                                    report(moveSection(topic.id, section.id, delta))
                                  }
                                />
                              ) : null}
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
      <PanelResizer
        label={label}
        width={width}
        onResize={setWidth}
        onCommit={(value) => saveCookie(PANEL_WIDTH_COOKIE_NAME, serializePanelWidth(value))}
      />
    </>
  );
}
