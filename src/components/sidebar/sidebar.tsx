'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppData } from '@/client/app-data';
import type { GlyphName } from '@/glyphs/paths';
import {
  AREA_LABELS,
  PRACTICE_TRACKS,
  areaHref,
  SYSTEM_AREAS,
  THEORY_TRACKS,
  isTrack,
  type Area,
} from '@/shared/tracks';
import { Wordmark } from '../glyph/wordmark';
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
};

// A menu row: the area glyph in its tone, the name, and the progress for tracks.
function NavLink({ href, label, glyph, active, tone, percent, loading }: NavLinkProps) {
  return (
    <li data-tone={tone}>
      <Link href={href} className={styles.link} aria-current={active ? 'page' : undefined}>
        <ToneGlyph glyph={glyph} size="menu" />
        <span className={styles.label}>{label}</span>
        {percent !== undefined ? (
          <span className={styles.count}>
            {percent !== null ? `${percent}%` : loading ? <Skeleton shape="count" /> : null}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

function AreaGroup({
  title,
  areas,
  pathname,
}: {
  title: string;
  areas: readonly Area[];
  pathname: string;
}) {
  const { status, trackNode } = useAppData();
  const headingId = `menu-group-${title.toLowerCase()}`;
  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.groupLabel}>
        {title}
      </h2>
      <ul className={styles.list}>
        {areas.map((area) => {
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
              percent={isTrack(area) ? (trackNode(area)?.counts.percent ?? null) : undefined}
              loading={status === 'loading'}
            />
          );
        })}
      </ul>
    </section>
  );
}

export function Sidebar() {
  const pathname = usePathname();

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
        <AreaGroup title="Tracks" areas={PRACTICE_TRACKS} pathname={pathname} />
        {/* Theory sits apart: it is studied differently from the practice tracks above. */}
        <AreaGroup title="Theory" areas={THEORY_TRACKS} pathname={pathname} />
        <AreaGroup title="System" areas={SYSTEM_AREAS} pathname={pathname} />
      </nav>
      <LogoutButton />
    </aside>
  );
}
