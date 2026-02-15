// Select — controlled native select. Accessible, theme-aligned. For priority: low, medium, high only.

import type { ChangeEventHandler } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: SelectOption[];
  /** Visible label. */
  label?: string;
  /** Accessible name when no visible label. */
  ariaLabel?: string;
  /** Error message; exposes aria-invalid and aria-describedby for screen readers. */
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Select({
  id,
  value,
  onChange,
  options,
  label,
  ariaLabel,
  error = '',
  disabled = false,
  required = false,
}: SelectProps) {
  const hasError = Boolean(error);
  const errorId = hasError ? `${id}-error` : undefined;
  const accessibleName = label ? undefined : (ariaLabel ?? 'Select');

  const selectClasses = [
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
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-label={accessibleName}
        aria-invalid={hasError}
        aria-required={required}
        aria-describedby={errorId}
        className={selectClasses}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError && (
        <span id={errorId} className="text-sm text-danger-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
