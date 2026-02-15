// TaskList — semantic list of TaskItems with empty state.

import type { Task, UpdateTask } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onUpdate: (id: string, updates: UpdateTask) => void | Promise<void>;
  onDelete: (id: string) => void;
  /** Message when there are no tasks. */
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  onToggleComplete,
  onUpdate,
  onDelete,
  emptyMessage = "No tasks here. Add one above!",
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
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
