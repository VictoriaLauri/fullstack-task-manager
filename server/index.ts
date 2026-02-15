// server/index.ts
// This Express server is fully wired up and working.
// The four core routes are implemented — run it and the frontend will connect straight away.
//
// TODO: This is where you can get creative!
//   - Add a priority field to tasks (low / medium / high)
//   - Add filtering: GET /api/tasks?priority=high or ?completed=true
//   - Add input validation and better error messages
//   - Anything else you think would make this better!

import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  priority?: Priority;
}

// ─── JSON file store ─────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

function loadTasks(): Task[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Task[];
  } catch {
    return [];
  }
}

function saveTasks(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save tasks:', err);
  }
}

let tasks: Task[] = loadTasks();

// ─── Routes ───────────────────────────────────────────────────────────────────

// Single source of truth for valid priority values so the same set is used for validation and typing.
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

const MAX_TITLE_LENGTH = 500;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// GET /api/tasks — return all tasks (optional: ?priority=high & ?completed=true|false)
app.get('/api/tasks', (req: Request, res: Response) => {
  const { priority: priorityParam, completed: completedParam } = req.query;

  let result = [...tasks];

  if (typeof priorityParam === 'string' && PRIORITIES.includes(priorityParam as Priority)) {
    result = result.filter((t) => t.priority === priorityParam);
  }

  if (completedParam === 'true' || completedParam === 'false') {
    const completed = completedParam === 'true';
    result = result.filter((t) => t.completed === completed);
  }

  res.json(result);
});

// POST /api/tasks — create a new task
app.post('/api/tasks', (req: Request, res: Response) => {
  if (!isPlainObject(req.body)) {
    res.status(400).json({ error: 'Request body must be a JSON object' });
    return;
  }

  const { title, priority } = req.body as { title?: string; priority?: string };

  if (!title || typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ error: 'title is required and must be a non-empty string' });
    return;
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    res.status(400).json({ error: `title must be at most ${MAX_TITLE_LENGTH} characters` });
    return;
  }

  if (priority != null && priority !== '' && !PRIORITIES.includes(priority as Priority)) {
    res.status(400).json({ error: `priority must be one of: ${PRIORITIES.join(', ')}` });
    return;
  }

  const newTask: Task = {
    id: uuidv4(),
    title: trimmedTitle,
    completed: false,
    createdAt: new Date().toISOString(),
    ...(priority && { priority: priority as Priority }),
  };

  tasks.push(newTask);
  saveTasks();
  res.status(201).json(newTask);
});

// PATCH /api/tasks/:id — update a task (only title, completed, priority; types validated)
app.patch('/api/tasks/:id', (req: Request, res: Response) => {
  if (!isPlainObject(req.body)) {
    res.status(400).json({ error: 'Request body must be a JSON object' });
    return;
  }

  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    res.status(404).json({ error: `Task with id "${id}" not found` });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const updates: Partial<Pick<Task, 'title' | 'completed' | 'priority'>> = {};

  if ('title' in body) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      res.status(400).json({ error: 'title must be a non-empty string' });
      return;
    }
    const trimmed = body.title.trim();
    if (trimmed.length > MAX_TITLE_LENGTH) {
      res.status(400).json({ error: `title must be at most ${MAX_TITLE_LENGTH} characters` });
      return;
    }
    updates.title = trimmed;
  }

  if ('completed' in body) {
    if (typeof body.completed !== 'boolean') {
      res.status(400).json({ error: 'completed must be a boolean' });
      return;
    }
    updates.completed = body.completed;
  }

  const priorityUpdate = body.priority as string | undefined;
  if (priorityUpdate != null && priorityUpdate !== '') {
    if (!PRIORITIES.includes(priorityUpdate as Priority)) {
      res.status(400).json({ error: `priority must be one of: ${PRIORITIES.join(', ')}` });
      return;
    }
    updates.priority = priorityUpdate as Priority;
  }

  tasks[index] = { ...tasks[index], ...updates };
  saveTasks();
  res.json(tasks[index]);
});

// DELETE /api/tasks/:id — delete a task
app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    res.status(404).json({ error: `Task with id "${id}" not found` });
    return;
  }

  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  res.status(204).send();
});

// ─── Global error handler ──────────────────────────────────────────────────────
// Catches any thrown errors so the API always returns JSON, never HTML.
app.use((err: Error, _req: Request, res: Response, _next: () => void) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
