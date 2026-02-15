// TaskItem — one task: title on first row, badge + actions on second row. Background tint matches priority.

import type { Priority, Task } from '../types';
import { Button } from './Button';
import { PriorityBadge } from './PriorityBadge';

const priorityCardClasses: Record<Priority, string> = {
  low: 'border-accent-300',
  medium: 'border-primary-300',
  high: 'border-danger-300',
};

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  return (
    <li className={`rounded border bg-white p-3 shadow-sm ${priorityCardClasses[task.priority]}`}>
      <p
        className={`text-primary-900 ${task.completed ? 'line-through opacity-70' : ''}`}
      >
        {task.title}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 pt-3">
        <PriorityBadge priority={task.priority} />
        <Button
          variant="secondary"
          onClick={() => onToggleComplete(task)}
          ariaLabel={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
        >
          {task.completed ? 'Undo' : 'Complete'}
        </Button>
        <Button
          variant="danger"
          onClick={() => onDelete(task.id)}
          ariaLabel={`Delete task: ${task.title}`}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}
