// src/types.ts
// These are your core types. Feel free to extend them as needed!

export type Priority = 'low' | 'medium' | 'high';

/** Options for priority select; medium is default. No "no priority" — we require a choice. */
export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const DEFAULT_PRIORITY: Priority = 'medium';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  priority: Priority;
}

// Used when creating a new task (no id or createdAt yet). Priority is required.
export type NewTask = Omit<Task, 'id' | 'createdAt'> & { priority: Priority };

// Used when updating a task
export type UpdateTask = Partial<Omit<Task, 'id' | 'createdAt'>>;
