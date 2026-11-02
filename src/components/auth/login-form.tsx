'use client';

import { useState, type FormEvent } from 'react';
import { apiRequest, errorMessage } from '@/client/api';
import { useGateAllowed } from '@/components/device-gate/device-gate';
import { fieldErrors, loginSchema } from '@/shared/schemas';
import { Glyph } from '../glyph/glyph';
import { Wordmark } from '../glyph/wordmark';
import { Button, IconButton } from '../ui/button';
import { FormError, TextField } from '../ui/field';
import styles from './login-form.module.css';

export function LoginForm() {
  const allowed = useGateAllowed();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !allowed) return;
    const parsed = loginSchema.safeParse({ username, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFormError(null);
    setSaving(true);
    try {
      await apiRequest('/api/auth/login', { method: 'POST', body: parsed.data });
      window.location.replace('/dashboard');
    } catch (error) {
      setPassword('');
      setShowPassword(false);
      setFormError(errorMessage(error, 'Sign-in failed.'));
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <form className={`glass ${styles.card}`} onSubmit={submit} noValidate>
        <div className={styles.header}>
          <Wordmark />
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subtitle}>Use the account set in your Stride environment.</p>
        </div>
        <div className={styles.fields}>
          <TextField
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            error={errors.username}
            autoCapitalize="none"
            spellCheck={false}
          />
          <TextField
            id="password"
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            trailing={
              <IconButton
                label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                aria-controls="password"
                onClick={() => setShowPassword((current) => !current)}
              >
                <Glyph name={showPassword ? 'eye-off' : 'eye'} size={20} />
              </IconButton>
            }
          />
        </div>
        <FormError message={formError} />
        <Button
          type="submit"
          variant="primary"
          disabled={saving || !allowed}
          className={styles.submit}
        >
          {saving ? 'Signing in.' : 'Sign in'}
        </Button>
      </form>
    </main>
  );
}
