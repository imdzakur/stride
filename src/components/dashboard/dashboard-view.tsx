'use client';

import Link from 'next/link';
import { useAppData } from '@/client/app-data';
import { useMenuOrder } from '@/client/menu-order';
import { AREA_LABELS, type Track, areaHref } from '@/shared/tracks';
import { systemMap } from '@/system-maps';
import type { Counts } from '@/shared/types';
import { ProgressBar } from '../progress/progress-bar';
import { ToneGlyph } from '../glyph/tone-glyph';
import { DASHBOARD_SHAPE } from '../shape/track-shapes';
import { Shape } from '../shape/shape';
import { LoadError } from '../shell/load-error';
import pageStyles from '../shell/page.module.css';
import { Skeleton } from '../skeleton/skeleton';
import { Countdowns } from './countdowns';
import styles from './dashboard.module.css';

function Overall({ counts }: { counts: Counts | null }) {
  return (
    <section
      className={`glass ${pageStyles.card} ${styles.overall}`}
      aria-label="Overall progress"
      data-tone="neutral"
    >
      <span className={styles.percentBadge}>
        <Shape kind={DASHBOARD_SHAPE} className={styles.percentShape} />
        <span className={styles.percentText}>
          {counts ? `${counts.percent}%` : <Skeleton shape="cell" />}
        </span>
      </span>
      <div className={styles.overallBody}>
        <h2 className={pageStyles.sectionTitle}>Overall progress</h2>
        <p className={pageStyles.subtitle}>
          {counts ? `${counts.done} of ${counts.total} items done.` : 'Loading progress.'}
        </p>
        {counts ? (
          <ProgressBar label="Overall progress" percent={counts.percent} />
        ) : (
          <Skeleton shape="bar" />
        )}
      </div>
    </section>
  );
}

type AreaCardProps = { title: string; areas: readonly Track[] };

function AreaCard({ title, areas }: AreaCardProps) {
  const { trackNode } = useAppData();
  const headingId = `dashboard-${title.toLowerCase()}`;
  return (
    <section className={`glass ${pageStyles.card}`} aria-labelledby={headingId}>
      <h2 id={headingId} className={pageStyles.sectionTitle}>
        {title}
      </h2>
      <ul className={styles.tracks}>
        {areas.map((track) => {
          const node = trackNode(track);
          return (
            <li key={track} data-tone={track}>
              <Link href={areaHref(track)} className={styles.trackRow}>
                <ToneGlyph glyph={track} size="menu" />
                <span className={styles.trackName}>{AREA_LABELS[track]}</span>
                <span className={styles.trackMeta}>
                  {node ? (
                    `${node.topics.length} ${node.topics.length === 1 ? 'topic' : 'topics'}, ${node.counts.done}/${node.counts.total} items`
                  ) : (
                    <Skeleton shape="meta" width="8rem" />
                  )}
                </span>
                <span className={styles.trackBar}>
                  {node ? (
                    <ProgressBar
                      label={`${AREA_LABELS[track]} progress`}
                      percent={node.counts.percent}
                    />
                  ) : (
                    <Skeleton shape="bar" />
                  )}
                </span>
                <span className={styles.trackPercent}>
                  {node ? `${node.counts.percent}%` : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// System areas are overviews to read, so they carry no progress.
function SystemCard() {
  const { order } = useMenuOrder();
  return (
    <section className={`glass ${pageStyles.card}`} aria-labelledby="dashboard-system">
      <h2 id="dashboard-system" className={pageStyles.sectionTitle}>
        System
      </h2>
      <ul className={styles.tracks}>
        {order.system.map((area) => {
          const map = systemMap(area);
          return (
            <li key={area} data-tone={area}>
              <Link href={areaHref(area)} className={`${styles.trackRow} ${styles.systemRow}`}>
                <ToneGlyph glyph={area} size="menu" />
                <span className={styles.trackName}>{AREA_LABELS[area]}</span>
                <span className={styles.trackMeta}>{map ? 'System overview' : 'No map yet'}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function DashboardView({ initialLaterOpen }: { initialLaterOpen: boolean }) {
  const { status, tree, refresh } = useAppData();
  // The cards follow the order chosen in the sidebar.
  const { order } = useMenuOrder();
  const loading = status === 'loading' && !tree;

  return (
    <>
      <header className={pageStyles.header} data-tone="neutral">
        <ToneGlyph glyph="dashboard" />
        <div className={pageStyles.headerText}>
          <p className={pageStyles.crumbs}>Overview</p>
          <h1 className={pageStyles.title}>Dashboard</h1>
        </div>
      </header>
      <Countdowns initialLaterOpen={initialLaterOpen} />
      {status === 'error' && !tree ? (
        <div className={`glass ${pageStyles.card}`}>
          <LoadError message="Could not load progress." onRetry={() => void refresh()} />
        </div>
      ) : (
        <div aria-busy={loading}>
          {loading ? <p className="sr-only">Loading data.</p> : null}
          <Overall counts={tree?.overall ?? null} />
          <AreaCard title="Tracks" areas={order.tracks} />
          <AreaCard title="Theory" areas={order.theory} />
          <AreaCard title="Languages" areas={order.languages} />
          <SystemCard />
        </div>
      )}
    </>
  );
}
