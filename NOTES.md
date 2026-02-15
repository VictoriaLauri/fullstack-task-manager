Notes on Part 1 - Backend

1. **Add a priority field (low / medium / high) to tasks**
   - Already in place: `Task` type, POST and PATCH accept/merge `priority`.
   - **GET filtering:** GET `/api/tasks` supports optional query params:
     - `?priority=low|medium|high` — only applied when the value is valid; invalid or missing values are ignored.
     - `?completed=true|false` — only applied when the value is exactly `"true"` or `"false"`.
   - Filters run on a copy of the task list (`[...tasks]`), so the in-memory store is never mutated.
   - Examples: `GET /api/tasks?priority=high`; `GET /api/tasks?completed=true`; `GET /api/tasks?priority=medium&completed=false`.

2. **Validation**
   - POST: if `priority` is sent, it must be one of `low`, `medium`, `high`; otherwise 400 with a clear error. Omitted or empty `priority` is allowed.
   - PATCH: same rule when updating `priority`; invalid values return 400.
   - Ensures only valid priorities are stored so GET filtering stays consistent.

3. **Defensive validation and input handling**
   - **req.body guard:** POST and PATCH require `req.body` to be a plain JSON object (not null, array, or primitive). Otherwise 400: "Request body must be a JSON object."
   - **Title length cap:** POST and PATCH enforce a max title length of 500 characters (trimmed). Longer titles return 400 with a clear error.
   - **PATCH: only known fields and type checks:** PATCH merges only `title`, `completed`, and `priority`. Other keys in the body are ignored. When present: `title` must be a non-empty string (and ≤ 500 chars); `completed` must be a boolean; `priority` must be one of the three allowed values. Wrong types or unknown keys are never persisted.

4. **Error messages: raw on backend, translate on frontend**
   - Backend returns clear, technical messages in `{ error: "..." }` (e.g. "title must be at most 500 characters", "priority must be one of: low, medium, high"). These are stable and machine-friendly for any API consumer.
   - Frontend could map these for user-friendly copy (see **Future improvements**).

5. **Persistence: JSON file store**
   - Tasks are persisted to `data/tasks.json`. On startup we load from the file; after each create, update, or delete we write the current list back. Data survives server restarts.
   - **Why:** In-memory only meant all tasks were lost on restart. A single JSON file is simple, has no extra dependencies, and is enough for a single-instance app or tech demo.
   - For production we'd use a proper database (see **Future improvements**).

6. **Global error handler**
   - A central error middleware catches any unhandled errors (e.g. thrown in a route) and responds with **500** and `{ error: "Internal server error" }` in JSON.
   - **Why:** Without it, Express would send its default HTML 500 page on unexpected errors. The handler keeps the API contract consistent (always JSON, same `error` shape), avoids leaking stack traces or internals to the client, and logs the error on the server for debugging.

---

Notes on Part 2 — Frontend

- **AppLayout component:** We introduced a layout component (`src/components/AppLayout.tsx`) that wraps the page in semantic `<header>` and `<main>`, provides a skip-to-content link for keyboard users, and applies the mobile-first container (max-width, padding). We chose it so the shell (landmarks, a11y, layout) lives in one place, loading and error states get the same structure, and `App.tsx` can focus on task logic instead of repeated layout markup.

- **Tailwind and accessibility:** Tailwind v4 with `@theme` in `src/index.css` defines a single palette (primary blue, accent green, danger red, surface grey) so we don't repeat colours. Palette and surface are chosen for **WCAG 2 Level AA** contrast (e.g. primary-600/700 on white) and a **dyslexia-friendly** light grey background (`--color-surface`) instead of pure white. Components use visible focus rings, sufficient touch targets (e.g. 44px min), and semantic structure; layout includes a skip-to-content link.

- **Button, Input, Select:** Reusable primitives in `src/components/` with shared decisions: (1) **Styling** — smaller, less bright, with a border (theme-aligned; primary/secondary/danger variants for Button). (2) **Accessibility** — native elements (`<button>`, `<input>`, `<select>`), visible focus rings, optional `ariaLabel` for when there's no visible label (e.g. icon-only buttons), and optional `required` / `error` so invalid and required state are announced to screen readers (Input and Select). (3) **Select for priority** — options are only low, medium, high (no "no priority"); we require a choice so users grade tasks up front; default is medium. Server requires `priority` on create to match.

- **PriorityBadge, TaskItem, TaskList, AddTaskForm:** Task-specific components to keep the UI reusable and scannable. (1) **PriorityBadge** — Small pill showing Low / Medium / High with theme colours (accent, primary, danger). **Why:** So priority is visible at a glance without reading the select label; reusable in the list and anywhere we show priority. (2) **TaskItem** — One task: title on the first row, then a separated row (border-top) with badge and Complete/Delete buttons, right-aligned. Card has a subtle priority-coloured border so the list isn't noisy but priority is still clear. **Why:** Long task text stays readable; actions are grouped and don't compete with the title. (3) **TaskList** — Renders a list of `TaskItem`s and an empty-state message when there are no tasks. Semantic `<ul>`, `aria-label="Task list"`, empty state with `role="status"`. **Why:** Single place for list structure and empty copy; `App` just passes `tasks` and callbacks. (4) **AddTaskForm** — Textarea (not single-line input) for the task, plus priority Select and Add button. Owns local state; calls `onSubmit(NewTask)` and clears only after submit succeeds (so failed API doesn't lose input). **Why:** Textarea supports longer tasks and will work for a future edit view where the full task text is shown; one form component for add (and later edit with initial values).

- **Filter and sort (App.tsx):** In-memory: one fetch on mount, then `useMemo` for `filteredAndSortedTasks`. **Filters:** Status (All / Active / Completed), Priority (All / High / Medium / Low). Applied in that order. **Sort:** Priority first, Newest first, Oldest first; default Newest. Priority sort: active tasks first, then completed; within each group priority high→low, tie-break by `createdAt` desc. Newest/Oldest: sort by `createdAt` (desc/asc), tie-break by priority desc. **UI:** A `border-t` separates the add-task form from the list area. Three labelled native selects in one row (Status, Priority, Sort), compact so they fit on mobile; labels keep filter vs sort clear. **Persistence:** Filter/sort choices are saved to `localStorage` (`task-list-filter-sort`) so they survive refresh; invalid or missing values fall back to defaults. Task data stays server-side only (no double persistence). Further ideas are in **Future improvements**.

- **Edit tasks:** Users can change a task's title and priority after creation. **Logic:** (1) **TaskItem** has an "Edit" button (only for active tasks; completed tasks show Complete/Undo and Delete only). Clicking Edit toggles inline edit mode: the card shows a textarea (current title) and the priority Select, plus Save and Cancel. (2) On Save we call the existing **PATCH** API via `updateTask(id, { title, priority })`; App's `handleUpdateTask` replaces the task in state with the API response so the list stays in sync. (3) Cancel discards local edits and exits without calling the API. (4) **Why inline:** Edit lives on the row so context is clear and we don't need a separate edit form or modal; we reuse the same Select and validation as add. **A11y:** Edit only when `!task.completed`; focus moves to the textarea when entering edit mode; sr-only label and aria-labels on actions.

- **Task count:** The UI shows how many tasks are currently visible. **Logic:** A line above the list displays "1 task" or "X tasks" using `filteredAndSortedTasks.length`. That array is already filtered by Status and Priority (and sorted), so the count always matches what the user sees — e.g. "Active" + "High" shows the number of active high-priority tasks. **Why:** Users get immediate feedback on filter impact and list size. Implemented as a `<p role="status" aria-live="polite">` so the count is announced to screen readers when it changes.

- **Reset preferences:** A control to clear saved filter/sort and revert to defaults. **Logic:** (1) A "Reset preferences" control (text-styled like the Delete button: `text-danger-800`, no underline) sits in the same row as the task count, right-aligned. (2) On click, `handleResetPreferences` removes `task-list-filter-sort` from `localStorage` and sets React state to defaults: `completedFilter: 'all'`, `priorityFilter: 'all'`, `sortBy: 'newest'`. (3) The next localStorage write (from the existing `useEffect` that persists filter/sort) will store these defaults, so behaviour stays consistent. **Why:** If a user has narrowed the list (e.g. only Completed) and forgets, or wants a clean slate, one click restores "all tasks, newest first" without touching task data. **Focus:** We use `focus-visible` for the ring so the focus indicator appears only for keyboard users, not after a mouse click, avoiding a persistent bright ring.

---

What was tricky or interesting

- **Filter/sort persistence and validation:** I wanted filter and sort choices to survive refresh without persisting task data twice (server is the source of truth). So I store only preferences in `localStorage` under a single key. The tricky part was making that robust: on load I read the stored JSON and validate each value against the same allowlists used in the UI (`VALID_COMPLETED`, `VALID_PRIORITY`, `VALID_SORT`). Invalid or missing values fall back to defaults; the existing `useEffect` that runs when state changes then writes those defaults back, so after a "Reset preferences" or a corrupted storage the app stays in a known state. I had to think through the order of operations (read → validate → set state → persist on state change) so that one source of truth (React state) drives both the UI and what gets saved.

- **Priority vs date sorting logic:** I wanted three clear options: "Priority high to low", "Newest first", and "Oldest first". For "Priority first" the goal was to surface active, high-priority tasks at the top, so I defined a multi-level sort: active before completed, then by priority rank (high→low), then by `createdAt` desc as tie-break. For "Newest first" and "Oldest first" the primary axis is time, with priority as tie-break so the list stays stable when two tasks share the same timestamp. I kept the logic in one `useMemo` with small comparator helpers so adding or changing a sort option wouldn't scatter conditionals. Getting the semantics right so the labels matched the behaviour took a couple of iterations.

- **User perspective and UX:** I found it useful to step back and use the app as if I were someone coming to it fresh. That led to a few concrete choices: (1) A visible task count so users immediately see how many items match the current filters (and aren't left wondering if the list is empty because of filters). (2) "Reset preferences" so that if someone has narrowed to e.g. "Completed" and then forgets, they have a one-click way back to "all tasks, newest first" without touching data. (3) Inline edit on the row instead of a modal or separate screen, so context is clear and the flow stays in one place. (4) Filter/sort in one compact row with clear labels (Status, Priority, Sort) so the controls are scannable and the difference between filtering and sorting is obvious. Optimising for that user perspective helped decide what to build next and what to leave for future improvements.

---

Future improvements

- **Map backend error messages on the frontend:** Show user-friendly copy (e.g. "Task name" instead of "title"), surface messages in context (e.g. next to the field), and keep the option to localise later. Use the server message as a fallback when there is no mapping.
- **Use a proper database in production:** Replace the JSON file store with e.g. PostgreSQL or SQLite for concurrent access, transactions, and scale.
- **Task cache in localStorage for offline fallback:** Allow the list to be read or updated when the server is unavailable, then sync when back online.
- **URL params for filter/sort:** Encode Status, Priority, and Sort in the URL so views are shareable and the back button behaves as expected.
