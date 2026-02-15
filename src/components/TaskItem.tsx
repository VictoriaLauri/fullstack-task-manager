// TaskItem — one task: title on first row, badge + actions on second row. Inline edit for title and priority.

import { useEffect, useRef, useState } from 'react';
import type { Priority, Task, UpdateTask } from '../types';
import { PRIORITY_OPTIONS } from '../types';
import { Button } from './Button';
import { PriorityBadge } from './PriorityBadge';
import { Select } from './Select';

const priorityCardClasses: Record<Priority, string> = {
  low: 'border-accent-300',
  medium: 'border-primary-300',
  high: 'border-danger-300',
};

const textareaClasses = [
  'min-h-[4.5rem] w-full rounded border border-primary-300 bg-white px-3 py-2 text-sm transition-colors resize-y',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 focus:border-primary-500',
].join(' ');

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onUpdate: (id: string, updates: UpdateTask) => void | Promise<void>;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggleComplete, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [saving, setSaving] = useState(false);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);

  // When entering edit mode, sync from task and focus the textarea
  useEffect(() => {
    if (isEditing) {
      setEditTitle(task.title);
      setEditPriority(task.priority);
      titleInputRef.current?.focus();
    }
  }, [isEditing, task.title, task.priority]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditPriority(task.priority);
  };

  const handleSaveEdit = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await Promise.resolve(onUpdate(task.id, { title: trimmed, priority: editPriority }));
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <li
      className={`rounded border bg-white p-3 shadow-sm ${priorityCardClasses[task.priority]}`}
      aria-label={isEditing ? 'Editing task' : undefined}
    >
      {isEditing ? (
        <>
          <div className="flex flex-col gap-2">
            <label htmlFor={`edit-task-title-${task.id}`} className="sr-only">
              Task description
            </label>
            <textarea
              ref={titleInputRef}
              id={`edit-task-title-${task.id}`}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              rows={3}
              className={textareaClasses}
              aria-label="Task description"
              disabled={saving}
            />
            <div className="w-[120px]">
              <Select
                id={`edit-task-priority-${task.id}`}
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
                options={PRIORITY_OPTIONS}
                label="Priority"
                ariaLabel="Task priority"
                disabled={saving}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-gray-200 pt-3">
            <Button
              variant="secondary"
              onClick={handleCancelEdit}
              ariaLabel="Cancel editing"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              ariaLabel="Save changes"
              disabled={saving || !editTitle.trim()}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p
            className={`text-primary-900 ${task.completed ? 'line-through opacity-70' : ''}`}
          >
            {task.title}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 pt-3">
            <PriorityBadge priority={task.priority} completed={task.completed} />
            <Button
              variant="success"
              onClick={() => onToggleComplete(task)}
              ariaLabel={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
            >
              {task.completed ? 'Restore' : 'Complete'}
            </Button>
            {!task.completed && (
              <Button
                variant="secondary"
                onClick={handleStartEdit}
                ariaLabel={`Edit task: ${task.title}`}
              >
                Edit
              </Button>
            )}
            <Button
              variant="danger"
              onClick={() => onDelete(task.id)}
              ariaLabel={`Delete task: ${task.title}`}
            >
              Delete
            </Button>
          </div>
        </>
      )}
    </li>
  );
}
