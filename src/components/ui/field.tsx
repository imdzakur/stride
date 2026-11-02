import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import styles from './ui.module.css';

type FieldShellProps = { id: string; label: string; error?: string; children: ReactNode };

function FieldShell({ id, label, error, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.fieldError}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function errorProps(id: string, error?: string) {
  return error ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {};
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  // A control inside the field edge, such as the show password button.
  trailing?: ReactNode;
};

export function TextField({ id, label, error, trailing, ...rest }: TextFieldProps) {
  const className = trailing ? `${styles.input} ${styles.withTrailing}` : styles.input;
  return (
    <FieldShell id={id} label={label} error={error}>
      <div className={styles.control}>
        <input id={id} className={className} {...errorProps(id, error)} {...rest} />
        {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
      </div>
    </FieldShell>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  error?: string;
};

export function TextAreaField({ id, label, error, ...rest }: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error}>
      <textarea id={id} className={styles.textarea} {...errorProps(id, error)} {...rest} />
    </FieldShell>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  error?: string;
};

export function SelectField({ id, label, error, children, ...rest }: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error}>
      <select id={id} className={styles.select} {...errorProps(id, error)} {...rest}>
        {children}
      </select>
    </FieldShell>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className={styles.formError} role="alert">
      {message}
    </p>
  );
}
