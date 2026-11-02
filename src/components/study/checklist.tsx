'use client';

import { useState } from 'react';
import { useAppData } from '@/client/app-data';
import type { Item } from '@/shared/types';
import { Glyph } from '../glyph/glyph';
import pageStyles from '../shell/page.module.css';
import styles from './study.module.css';

// Ticking is the only change the app makes; items themselves are managed in the database.
export function Checklist({ title, items }: { title: string; items: Item[] }) {
  const { toggleItem } = useAppData();
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  async function toggle(item: Item, done: boolean) {
    setError(null);
    setBusy((current) => new Set(current).add(item.id));
    const failure = await toggleItem(item.id, done);
    setBusy((current) => {
      const next = new Set(current);
      next.delete(item.id);
      return next;
    });
    if (failure) setError(failure);
    else setAnnouncement(`${item.title} ${done ? 'done' : 'not done'}.`);
  }

  if (items.length === 0) {
    return <p className={pageStyles.empty}>No items yet. Add them in the Supabase database.</p>;
  }

  return (
    <>
      <ul className={styles.items} aria-label={`${title} items`}>
        {items.map((item) => (
          <li key={item.id} className={styles.item} data-done={item.done ? 'true' : undefined}>
            <label className={styles.check}>
              <input
                type="checkbox"
                className={styles.box}
                checked={item.done}
                disabled={busy.has(item.id)}
                onChange={(event) => void toggle(item, event.target.checked)}
              />
              <span className={styles.mark} aria-hidden="true">
                <Glyph name="check" size={16} />
              </span>
              <span className={styles.itemText}>
                <span className={styles.itemTitle}>{item.title}</span>
                {item.note ? <span className={styles.note}>{item.note}</span> : null}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {error ? (
        <p className={pageStyles.status} role="alert">
          {error}
        </p>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}
