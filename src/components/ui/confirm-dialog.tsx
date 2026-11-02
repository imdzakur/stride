'use client';

import { useEffect, useId, useRef } from 'react';
import type { GlyphName } from '@/glyphs/paths';
import { Glyph } from '../glyph/glyph';
import { Button } from './button';
import styles from './ui.module.css';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busyLabel?: string;
  icon?: GlyphName;
  tone?: 'primary' | 'danger';
  busy: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busyLabel = 'Saving.',
  icon,
  tone = 'primary',
  busy,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const textId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Focus returns to the trigger however the dialog closes.
  function handleClose() {
    const trigger = triggerRef.current;
    if (trigger && trigger.isConnected) trigger.focus();
    if (open) onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      className={`glass ${styles.dialog}`}
      aria-labelledby={titleId}
      aria-describedby={textId}
      onClose={handleClose}
      onCancel={(event) => {
        if (busy) event.preventDefault();
      }}
    >
      {icon ? (
        <span className={styles.dialogIcon}>
          <Glyph name={icon} size={24} />
        </span>
      ) : null}
      <h2 id={titleId} className={styles.dialogTitle}>
        {title}
      </h2>
      <p id={textId} className={styles.dialogText}>
        {description}
      </p>
      {error ? (
        <p className={styles.dialogError} role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.dialogActions}>
        <Button ref={cancelRef} variant="text" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant={tone} onClick={onConfirm} disabled={busy}>
          {busy ? busyLabel : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
