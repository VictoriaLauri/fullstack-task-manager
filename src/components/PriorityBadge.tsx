// PriorityBadge — small pill/chip showing task priority, or grey "Completed" when task is done.

import type { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
  completed?: boolean;
}

const priorityClasses: Record<Priority, string> = {
  low: 'border border-accent-400 bg-accent-100 text-accent-800',
  medium: 'border border-primary-400 bg-primary-100 text-primary-800',
  high: 'border border-danger-400 bg-danger-100 text-danger-800',
};

const completedClasses = 'border border-gray-300 bg-gray-100 text-gray-700';

const labels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function PriorityBadge({ priority, completed = false }: PriorityBadgeProps) {
  if (completed) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${completedClasses}`}
        aria-label="Completed"
      >
        Completed
      </span>
    );
  }

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
