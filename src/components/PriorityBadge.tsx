// PriorityBadge — small pill/chip showing task priority. Theme colours: low (accent), medium (primary), high (danger).

import type { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
}

const priorityClasses: Record<Priority, string> = {
  low: 'border border-accent-400 bg-accent-100 text-accent-800',
  medium: 'border border-primary-400 bg-primary-100 text-primary-800',
  high: 'border border-danger-400 bg-danger-100 text-danger-800',
};

const labels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const label = labels[priority];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityClasses[priority]}`}
      aria-label={`Priority: ${label}`}
    >
      {label}
    </span>
  );
}
