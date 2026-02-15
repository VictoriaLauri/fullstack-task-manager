// TaskList — semantic list of TaskItems with empty state.

import type { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onDelete: (id: string) => void;
  /** Message when there are no tasks. */
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  onToggleComplete,
  onDelete,
  emptyMessage = "Let's start by adding your first task!",
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-primary-800" role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3 list-none p-0" aria-label="Task list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
