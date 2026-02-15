// src/App.tsx
// This is your starting point. Build out the UI here.
// You're welcome to split this into multiple components if you'd like!

import { useState, useEffect } from 'react';
import type { NewTask, Task } from './types';
import { getTasks, createTask, updateTask, deleteTask } from './api';
import { AddTaskForm } from './components/AddTaskForm';
import { AppLayout } from './components/AppLayout';
import { TaskList } from './components/TaskList';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks on mount
  useEffect(() => {
    void (async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch {
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddTask = async (newTask: NewTask) => {
    const task = await createTask(newTask);
    setTasks((prev) => [...prev, task]);
  };

  // TODO: Expand this if you add extra fields to update
  const handleToggleComplete = async (task: Task) => {
    const updated = await updateTask(task.id, { completed: !task.completed });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // TODO: Add a confirmation step, or an undo feature if you like!
  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <AppLayout>
        <p>Loading tasks...</p>
      </AppLayout>
    );
  }
  if (error) {
    return (
      <AppLayout>
        <p className="text-danger-600" role="alert">{error}</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <AddTaskForm onSubmit={handleAddTask} />
      </div>

      <TaskList
        tasks={tasks}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDeleteTask}
      />
    </AppLayout>
  );
}

export default App;
