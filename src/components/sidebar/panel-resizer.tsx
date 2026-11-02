'use client';

import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import {
  PANEL_WIDTH_DEFAULT,
  PANEL_WIDTH_MAX,
  PANEL_WIDTH_MIN,
  clampPanelWidth,
} from '@/shared/panel';
import styles from './area-panel.module.css';

const KEY_STEP = 16;

type PanelResizerProps = {
  label: string;
  width: number;
  // Called while dragging; commit is called once the new width is final.
  onResize: (width: number) => void;
  onCommit: (width: number) => void;
};

// The right edge of the topic panel: drag it, use the arrow keys, or double-click to reset.
export function PanelResizer({ label, width, onResize, onCommit }: PanelResizerProps) {
  const drag = useRef<{ id: number; startX: number; startWidth: number; last: number } | null>(
    null,
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, startX: event.clientX, startWidth: width, last: width };
    // The whole page shows the resize cursor and stops selecting text while dragging.
    document.documentElement.dataset.resizing = 'true';
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    state.last = clampPanelWidth(state.startWidth + event.clientX - state.startX);
    onResize(state.last);
  };

  const finish = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    drag.current = null;
    delete document.documentElement.dataset.resizing;
    onCommit(state.last);
  };

  const set = (next: number) => {
    const value = clampPanelWidth(next);
    onResize(value);
    onCommit(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => set(width - KEY_STEP),
      ArrowRight: () => set(width + KEY_STEP),
      Home: () => set(PANEL_WIDTH_MIN),
      End: () => set(PANEL_WIDTH_MAX),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${label} topics. Double-click to reset.`}
      aria-valuemin={PANEL_WIDTH_MIN}
      aria-valuemax={PANEL_WIDTH_MAX}
      aria-valuenow={width}
      tabIndex={0}
      className={styles.resizer}
      title="Drag to resize, double-click to reset"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
      onKeyDown={onKeyDown}
      onDoubleClick={() => set(PANEL_WIDTH_DEFAULT)}
    >
      <span className={styles.resizerLine} aria-hidden="true" />
    </div>
  );
}
