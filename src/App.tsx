// src/App.tsx
// This is your starting point. Build out the UI here.
// You're welcome to split this into multiple components if you'd like!

import { useState, useEffect } from 'react';
import { Task } from './types';
import { getTasks, createTask, updateTask, deleteTask } from './api';
import { AppLayout } from './components/AppLayout';
import { Button } from './components/Button';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

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

  // TODO: Customise this — add priority, due dates, or anything else you like!
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    const task = await createTask({ title: newTaskTitle, completed: false });
    setTasks((prev) => [...prev, task]);
    setNewTaskTitle('');
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
      {/* TODO: Improve this input — add priority, labels, due date, etc. */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
        />
        <Button onClick={handleAddTask}>Add</Button>
      </div>

      {/* TODO: Style this list — make it your own! */}
      {tasks.length === 0 ? (
        <p>No tasks yet. Add one above!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map((task) => (
            <li key={task.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span style={{ textDecoration: task.completed ? 'line-through' : 'none', flex: 1 }}>
                {task.title}
              </span>
              <Button variant="secondary" onClick={() => handleToggleComplete(task)}>
                {task.completed ? 'Undo' : 'Complete'}
              </Button>
              <Button variant="danger" onClick={() => handleDeleteTask(task.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
}

export default App;
