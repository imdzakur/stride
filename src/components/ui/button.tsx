import type { ComponentProps } from 'react';
import styles from './ui.module.css';

type Variant = 'primary' | 'secondary' | 'tonal' | 'danger' | 'text';

type ButtonProps = ComponentProps<'button'> & { variant?: Variant };

export function Button({
  variant = 'secondary',
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}

type IconButtonProps = ComponentProps<'button'> & { label: string };

export function IconButton({ label, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={[styles.iconButton, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
