'use client';

import { useState } from 'react';
import { apiRequest, errorMessage } from '@/client/api';
import { Glyph } from '../glyph/glyph';
import { ConfirmDialog } from '../ui/confirm-dialog';
import styles from './sidebar.module.css';

export function LogoutButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    setBusy(true);
    setError(null);
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      // A full reload discards React state that holds task data.
      window.location.replace('/login');
    } catch (err) {
      setError(errorMessage(err, 'Could not sign out.'));
      setBusy(false);
    }
  }

  return (
    <div className={styles.footer}>
      <button type="button" className={styles.footerButton} onClick={() => setConfirmOpen(true)}>
        <Glyph name="logout" size={20} />
        <span className={styles.label}>Sign out</span>
      </button>
      <ConfirmDialog
        open={confirmOpen}
        icon="logout"
        title="Sign out of Stride?"
        description="You will need your username and password to sign in again. Your tasks stay saved."
        confirmLabel="Sign out"
        busyLabel="Signing out."
        busy={busy}
        error={error}
        onConfirm={logout}
        onCancel={() => {
          setConfirmOpen(false);
          setError(null);
        }}
      />
    </div>
  );
}
