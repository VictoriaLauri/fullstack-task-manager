// AddTaskForm — textarea (for longer tasks and future edit) + priority Select + submit button.
// Local state; calls onSubmit(NewTask) then clears. Designed so edit can reuse with initial values later.

import { useState, type ChangeEventHandler } from 'react';
import type { NewTask, Priority } from '../types';
import { DEFAULT_PRIORITY, PRIORITY_OPTIONS } from '../types';
import { Button } from './Button';
import { Select } from './Select';

interface AddTaskFormProps {
  /** Called with the new task; may be async. Form clears only after submit succeeds. */
  onSubmit: (task: NewTask) => void | Promise<void>;
}

const textareaClasses = [
  'min-h-[4.5rem] w-full rounded border border-primary-300 bg-white px-3 py-2 text-sm transition-colors resize-y',
  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:border-primary-500',
  'placeholder:text-gray-500',
].join(' ');

export function AddTaskForm({ onSubmit }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(DEFAULT_PRIORITY);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      await Promise.resolve(onSubmit({ title: trimmed, completed: false, priority }));
      setTitle('');
      setPriority(DEFAULT_PRIORITY);
    } catch {
      // Leave form as is so user can retry or edit
    }
  };

  const handleTitleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setTitle(e.target.value);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className="flex flex-col gap-4"
      aria-label="Add new task"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="add-task-title" className="text-sm font-medium text-primary-900">
          Task
        </label>
        <textarea
          id="add-task-title"
          value={title}
          onChange={handleTitleChange}
          placeholder="What do you need to do?"
          rows={3}
          className={textareaClasses}
          aria-label="Task description"
        />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-[120px]">
          <Select
            id="add-task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            options={PRIORITY_OPTIONS}
            label="Task Priority"
            ariaLabel="Task Priority"
            required
          />
        </div>
        <Button type="submit">Add</Button>
      </div>
    </form>
  );
}
