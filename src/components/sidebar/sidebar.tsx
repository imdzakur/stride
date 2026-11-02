'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAppData } from '@/client/app-data';
import { useMenuOrder } from '@/client/menu-order';
import type { MenuGroup } from '@/shared/menu-order';
import type { GlyphName } from '@/glyphs/paths';
import { AREA_LABELS, areaHref, isTrack } from '@/shared/tracks';
import { Glyph } from '../glyph/glyph';
import { Wordmark } from '../glyph/wordmark';
import { MoveButtons } from '../ui/move-buttons';
import { ToneGlyph } from '../glyph/tone-glyph';
import { Skeleton } from '../skeleton/skeleton';
import { LogoutButton } from './logout-button';
import styles from './sidebar.module.css';

type NavLinkProps = {
  href: string;
  label: string;
  glyph: GlyphName;
  active: boolean;
  tone: string;
  percent?: number | null;
  loading?: boolean;
  // Set in reorder mode: the row shows up and down buttons after its link.
  move?: { isFirst: boolean; isLast: boolean; onMove: (delta: -1 | 1) => void };
};

// A menu row: the area glyph in its tone, the name, and the progress for tracks.
function NavLink({ href, label, glyph, active, tone, percent, loading, move }: NavLinkProps) {
  return (
    <li data-tone={tone} className={move ? styles.moveRow : undefined}>
      <Link href={href} className={styles.link} aria-current={active ? 'page' : undefined}>
        <ToneGlyph glyph={glyph} size="menu" />
        <span className={styles.label}>{label}</span>
        {percent !== undefined ? (
          <span className={styles.count}>
            {percent !== null ? `${percent}%` : loading ? <Skeleton shape="count" /> : null}
          </span>
        ) : null}
      </Link>
      {move ? (
        <MoveButtons
          label={label}
          isFirst={move.isFirst}
          isLast={move.isLast}
          onMove={move.onMove}
        />
      ) : null}
    </li>
  );
}

function AreaGroup({
  title,
  group,
  pathname,
  editing,
}: {
  title: string;
  group: MenuGroup;
  pathname: string;
  editing: boolean;
}) {
  const { status, trackNode } = useAppData();
  const { order, move, closed, toggleGroup } = useMenuOrder();
  const areas = order[group];
  const open = !closed.includes(group);
  const listId = `menu-list-${group}`;
  const headingId = `menu-group-${title.toLowerCase()}`;
  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.groupHeading}>
        <button
          type="button"
          className={styles.groupLabel}
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => toggleGroup(group)}
        >
          {title}
          <span className={styles.groupChevron} aria-hidden="true">
            <Glyph name="chevron" size={16} />
          </span>
        </button>
      </h2>
      <ul id={listId} className={styles.list} hidden={!open}>
        {areas.map((area, index) => {
          const href = areaHref(area);
          return (
            <NavLink
              key={area}
              href={href}
              label={AREA_LABELS[area]}
              glyph={area}
              tone={area}
              active={pathname === href || pathname.startsWith(`${href}/`)}
              // System maps are for reading only, so they carry no progress.
              // While reordering, the percent makes room for the move buttons.
              percent={
                isTrack(area) && !editing ? (trackNode(area)?.counts.percent ?? null) : undefined
              }
              loading={status === 'loading'}
              move={
                editing
                  ? {
                      isFirst: index === 0,
                      isLast: index === areas.length - 1,
                      onMove: (delta) => move(group, index, delta),
                    }
                  : undefined
              }
            />
          );
        })}
      </ul>
    </section>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [editing, setEditing] = useState(false);

  return (
    <aside className={`glass ${styles.sidebar}`}>
      <Link href="/dashboard" className={styles.logoLink} aria-label="Stride, open Dashboard">
        <Wordmark />
      </Link>
      <nav className={styles.nav} aria-label="Main menu">
        <ul className={styles.list}>
          <NavLink
            href="/dashboard"
            label="Dashboard"
            glyph="dashboard"
            tone="neutral"
            active={pathname === '/dashboard'}
          />
        </ul>
        <AreaGroup title="Tracks" group="tracks" pathname={pathname} editing={editing} />
        {/* Theory sits apart: it is studied differently from the practice tracks above. */}
        <AreaGroup title="Theory" group="theory" pathname={pathname} editing={editing} />
        <AreaGroup title="Languages" group="languages" pathname={pathname} editing={editing} />
        <AreaGroup title="System" group="system" pathname={pathname} editing={editing} />
      </nav>
      <LogoutButton>
        <button
          type="button"
          className={styles.footerIcon}
          aria-pressed={editing}
          aria-label={editing ? 'Done reordering' : 'Reorder menu'}
          title={editing ? 'Done reordering' : 'Reorder menu'}
          onClick={() => setEditing((value) => !value)}
        >
          <Glyph name={editing ? 'check' : 'reorder'} size={20} />
        </button>
      </LogoutButton>
    </aside>
  );
}
