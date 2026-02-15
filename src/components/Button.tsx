// Button — reusable button with variant, visible focus, and touch-friendly size.

import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  children: ReactNode;
  /** Override or set accessible name (e.g. for icon-only buttons). When provided, used as aria-label. */
  ariaLabel?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-primary-400 bg-primary-100 text-primary-800 hover:bg-primary-200 hover:border-primary-500 focus:ring-primary-500',
  secondary:
    'border border-primary-300 bg-white text-primary-800 hover:bg-primary-50 hover:border-primary-400 focus:ring-primary-400',
  danger:
    'border border-danger-400 bg-danger-100 text-danger-800 hover:bg-danger-200 hover:border-danger-500 focus:ring-danger-500',
};

export function Button({
  children,
  ariaLabel,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
}: ButtonProps) {
  const base =
    'min-h-9 min-w-[36px] rounded border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClass = variantClasses[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${base} ${variantClass}`}
    >
      {children}
    </button>
  );
}
