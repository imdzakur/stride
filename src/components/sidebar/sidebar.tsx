'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppData } from '@/client/app-data';
import type { GlyphName } from '@/glyphs/paths';
import type { ShapeKind } from '@/shapes/shapes';
import { AREA_LABELS, SYSTEM_AREAS, TRACKS, isTrack, type Area } from '@/shared/tracks';
import { Wordmark } from '../glyph/wordmark';
import { ShapeBadge } from '../shape/shape-badge';
import { DASHBOARD_SHAPE, AREA_SHAPES } from '../shape/track-shapes';
import { Skeleton } from '../skeleton/skeleton';
import { LogoutButton } from './logout-button';
import styles from './sidebar.module.css';

type NavLinkProps = {
  href: string;
  label: string;
  glyph: GlyphName;
  shape: ShapeKind;
  active: boolean;
  tone: string;
  percent?: number | null;
  loading?: boolean;
};

// Only the shape of the active link turns; the glyph on it stays still.
function NavLink({ href, label, glyph, shape, active, tone, percent, loading }: NavLinkProps) {
  return (
    <li data-tone={tone}>
      <Link href={href} className={styles.link} aria-current={active ? 'page' : undefined}>
        <ShapeBadge shape={shape} glyph={glyph} size="menu" className={styles.badge} />
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
          const href = `/${area}`;
          return (
            <NavLink
              key={area}
              href={href}
              label={AREA_LABELS[area]}
              glyph={area}
              shape={AREA_SHAPES[area]}
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
            shape={DASHBOARD_SHAPE}
            tone="neutral"
            active={pathname === '/dashboard'}
          />
        </ul>
        <AreaGroup title="Tracks" areas={TRACKS} pathname={pathname} />
        <AreaGroup title="System" areas={SYSTEM_AREAS} pathname={pathname} />
      </nav>
      <LogoutButton />
    </aside>
  );
}
