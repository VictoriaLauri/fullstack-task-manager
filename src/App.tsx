// src/App.tsx
// This is your starting point. Build out the UI here.
// You're welcome to split this into multiple components if you'd like!

import { useEffect, useMemo, useState } from 'react'
import { createTask, deleteTask, getTasks, updateTask } from './api'
import { AddTaskForm } from './components/AddTaskForm'
import { AppLayout } from './components/AppLayout'
import { TaskList } from './components/TaskList'
import type { NewTask, Priority, Task } from './types'

type CompletedFilter = 'all' | 'active' | 'completed'
type PriorityFilter = 'all' | Priority
type SortBy = 'priority' | 'newest' | 'oldest'

const PRIORITY_RANK: Record<Priority, number> = { high: 3, medium: 2, low: 1 }

const FILTER_SORT_STORAGE_KEY = 'task-list-filter-sort'

const VALID_COMPLETED: CompletedFilter[] = ['all', 'active', 'completed']
const VALID_PRIORITY: PriorityFilter[] = ['all', 'high', 'medium', 'low']
const VALID_SORT: SortBy[] = ['priority', 'newest', 'oldest']

function readFilterSortFromStorage(): {
  completedFilter: CompletedFilter
  priorityFilter: PriorityFilter
  sortBy: SortBy
} {
  try {
    const raw = localStorage.getItem(FILTER_SORT_STORAGE_KEY)
    if (!raw) return { completedFilter: 'all', priorityFilter: 'all', sortBy: 'newest' }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const completedFilter = VALID_COMPLETED.includes(parsed.completedFilter as CompletedFilter)
      ? (parsed.completedFilter as CompletedFilter)
      : 'all'
    const priorityFilter = VALID_PRIORITY.includes(parsed.priorityFilter as PriorityFilter)
      ? (parsed.priorityFilter as PriorityFilter)
      : 'all'
    const sortBy = VALID_SORT.includes(parsed.sortBy as SortBy) ? (parsed.sortBy as SortBy) : 'newest'
    return { completedFilter, priorityFilter, sortBy }
  } catch {
    return { completedFilter: 'all', priorityFilter: 'all', sortBy: 'newest' }
  }
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedFilter, setCompletedFilter] = useState<CompletedFilter>(() =>
    readFilterSortFromStorage().completedFilter,
  )
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(() =>
    readFilterSortFromStorage().priorityFilter,
  )
  const [sortBy, setSortBy] = useState<SortBy>(() => readFilterSortFromStorage().sortBy)

  // Fetch tasks on mount
  useEffect(() => {
    void (async () => {
      try {
        const data = await getTasks()
        setTasks(data)
      } catch {
        setError('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Persist filter/sort to localStorage so they survive refresh
  useEffect(() => {
    try {
      localStorage.setItem(
        FILTER_SORT_STORAGE_KEY,
        JSON.stringify({ completedFilter, priorityFilter, sortBy }),
      )
    } catch {
      // Private mode or quota exceeded; ignore
    }
  }, [completedFilter, priorityFilter, sortBy])

  const handleAddTask = async (newTask: NewTask) => {
    const task = await createTask(newTask)
    setTasks((prev) => [...prev, task])
  }

  // TODO: Expand this if you add extra fields to update
  const handleToggleComplete = async (task: Task) => {
    const updated = await updateTask(task.id, { completed: !task.completed })
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  // TODO: Add a confirmation step, or an undo feature if you like!
  const handleDeleteTask = async (id: string) => {
    await deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks]
    if (completedFilter === 'active')
      result = result.filter((t) => !t.completed)
    else if (completedFilter === 'completed')
      result = result.filter((t) => t.completed)
    if (priorityFilter !== 'all')
      result = result.filter((t) => t.priority === priorityFilter)

    const byPriorityDesc = (a: Task, b: Task) =>
      PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]
    const byCreatedDesc = (a: Task, b: Task) =>
      b.createdAt.localeCompare(a.createdAt)
    const byCreatedAsc = (a: Task, b: Task) =>
      a.createdAt.localeCompare(b.createdAt)

    if (sortBy === 'priority') {
      // Active first, then completed; within each group: priority high→low, then newest first
      const byActiveFirst = (a: Task, b: Task) =>
        Number(a.completed) - Number(b.completed)
      result.sort(
        (a, b) =>
          byActiveFirst(a, b) || byPriorityDesc(a, b) || byCreatedDesc(a, b),
      )
    } else if (sortBy === 'newest') {
      result.sort((a, b) => byCreatedDesc(a, b) || byPriorityDesc(a, b))
    } else {
      result.sort((a, b) => byCreatedAsc(a, b) || byPriorityDesc(a, b))
    }
    return result
  }, [tasks, completedFilter, priorityFilter, sortBy])

  if (loading) {
    return (
      <AppLayout>
        <p>Loading tasks...</p>
      </AppLayout>
    )
  }
  if (error) {
    return (
      <AppLayout>
        <p className='text-danger-600' role='alert'>
          {error}
        </p>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className='mb-6'>
        <AddTaskForm onSubmit={handleAddTask} />
      </div>

      <div className='border-t border-gray-200 pt-4'>
        <div className='mb-4 flex items-end gap-2'>
          <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
            <label htmlFor='filter-status' className='text-xs font-medium text-gray-600'>
              Status
            </label>
            <select
              id='filter-status'
              value={completedFilter}
              onChange={(e) => setCompletedFilter(e.target.value as CompletedFilter)}
              aria-label='Filter by status'
              className='min-h-8 w-full min-w-0 rounded border border-primary-300 bg-white px-2 py-1 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1'
            >
              <option value='all'>All</option>
              <option value='active'>Active</option>
              <option value='completed'>Completed</option>
            </select>
          </div>
          <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
            <label htmlFor='filter-priority' className='text-xs font-medium text-gray-600'>
              Priority
            </label>
            <select
              id='filter-priority'
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
              aria-label='Filter by priority'
              className='min-h-8 w-full min-w-0 rounded border border-primary-300 bg-white px-2 py-1 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1'
            >
              <option value='all'>All</option>
              <option value='high'>High</option>
              <option value='medium'>Medium</option>
              <option value='low'>Low</option>
            </select>
          </div>
          <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
            <label htmlFor='sort-by' className='text-xs font-medium text-gray-600'>
              Sort
            </label>
            <select
              id='sort-by'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              aria-label='Sort by'
              className='min-h-8 w-full min-w-0 rounded border border-primary-300 bg-white px-2 py-1 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1'
            >
              <option value='priority'>Priority high to low</option>
              <option value='newest'>Newest first</option>
              <option value='oldest'>Oldest first</option>
            </select>
          </div>
        </div>

        <TaskList
          tasks={filteredAndSortedTasks}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTask}
        />
      </div>
    </AppLayout>
  )
}

export default App
