'use client';

import { useState } from 'react';
import type { ShapeKind } from '@/shapes/shapes';
import {
  COUNTDOWN_COOKIE_MAX_AGE,
  COUNTDOWN_COOKIE_NAME,
  LATER_COUNTDOWNS,
  PRIMARY_COUNTDOWNS,
  serializeLaterOpen,
} from '@/shared/countdowns';
import { Glyph } from '../glyph/glyph';
import pageStyles from '../shell/page.module.css';
import { CountdownCard } from './countdown-row';
import styles from './countdown.module.css';
import { useSecond } from './use-second';

// Each deadline gets its own expressive shape so the cards are told apart at a glance.
const SHAPES: Record<string, ShapeKind> = {
  'dec-2026': 'cookie12',
  'jan-2027': 'cookie9',
  'oct-2027': 'clover8',
  'oct-2028': 'puffy',
};

function saveLaterOpen(open: boolean): void {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COUNTDOWN_COOKIE_NAME}=${serializeLaterOpen(open)}; Max-Age=${COUNTDOWN_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // The browser refused the cookie: the toggle still works for this visit.
  }
}

export function Countdowns({ initialLaterOpen }: { initialLaterOpen: boolean }) {
  const now = useSecond();
  const [laterOpen, setLaterOpen] = useState(initialLaterOpen);

  function toggleLater() {
    const next = !laterOpen;
    setLaterOpen(next);
    saveLaterOpen(next);
  }

  return (
    <section className={pageStyles.block} aria-labelledby="countdown-heading">
      <div className={styles.heading}>
        <h2 id="countdown-heading" className={pageStyles.sectionTitle}>
          Countdowns
        </h2>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={laterOpen}
          aria-controls="later-countdowns"
          onClick={toggleLater}
        >
          {laterOpen ? 'Hide later' : 'Show later'}
          <span className={laterOpen ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron}>
            <Glyph name="chevron" size={16} />
          </span>
        </button>
      </div>
      <ul className={styles.grid}>
        {PRIMARY_COUNTDOWNS.map((countdown) => (
          <CountdownCard
            key={countdown.id}
            countdown={countdown}
            shape={SHAPES[countdown.id] ?? 'cookie9'}
            now={now}
          />
        ))}
      </ul>
      <ul id="later-countdowns" className={styles.grid} hidden={!laterOpen}>
        {LATER_COUNTDOWNS.map((countdown) => (
          <CountdownCard
            key={countdown.id}
            countdown={countdown}
            shape={SHAPES[countdown.id] ?? 'cookie9'}
            now={now}
          />
        ))}
      </ul>
    </section>
  );
}
