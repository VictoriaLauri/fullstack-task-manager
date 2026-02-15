// Input — controlled text input with optional label and error. Accessible, theme-aligned.

import type { ChangeEventHandler } from 'react';

interface InputProps {
  id: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  /** Visible label; use for explicit accessible name (preferred over placeholder). */
  label?: string;
  /** Accessible name when no visible label. Prefer this over placeholder so SR gets a stable name. */
  ariaLabel?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'search';
}

export function Input({
  id,
  value,
  onChange,
  label,
  ariaLabel,
  placeholder,
  error = '',
  disabled = false,
  required = false,
  type = 'text',
}: InputProps) {
  const hasError = Boolean(error);
  const errorId = hasError ? `${id}-error` : undefined;
  // Accessible name: visible label wins; else explicit ariaLabel; else placeholder or generic (for screen readers).
  const accessibleName = label ? undefined : (ariaLabel ?? placeholder ?? 'Input');

  const inputClasses = [
    'min-h-9 w-full rounded border px-3 py-1.5 text-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    hasError
      ? 'border-danger-400 bg-danger-50 focus:ring-danger-500 focus:border-danger-500'
      : 'border-primary-300 bg-white focus:ring-primary-500 focus:border-primary-500',
  ].join(' ');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-primary-900">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-required={required}
        aria-describedby={errorId}
        aria-label={accessibleName}
        className={inputClasses}
      />
      {hasError && (
        <span id={errorId} className="text-sm text-danger-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
