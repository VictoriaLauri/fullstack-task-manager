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
   - We plan to **map these on the frontend** and control the copy the user sees. That gives us: user-friendly wording (e.g. "Task name" instead of "title"), messages in context (e.g. next to the field), and the option to localise later. The server message can be used as a fallback when we don’t have a mapping.

5. **Persistence: JSON file store**
   - Tasks are persisted to `data/tasks.json`. On startup we load from the file; after each create, update, or delete we write the current list back. Data survives server restarts.
   - **Why:** In-memory only meant all tasks were lost on restart. A single JSON file is simple, has no extra dependencies, and is enough for a single-instance app or tech demo.
   - **In a real app** we’d use a database (e.g. PostgreSQL, SQLite) for concurrent access, transactions, and scale — the JSON store is for this project only.

6. **Global error handler**
   - A central error middleware catches any unhandled errors (e.g. thrown in a route) and responds with **500** and `{ error: "Internal server error" }` in JSON.
   - **Why:** Without it, Express would send its default HTML 500 page on unexpected errors. The handler keeps the API contract consistent (always JSON, same `error` shape), avoids leaking stack traces or internals to the client, and logs the error on the server for debugging.

---

Notes on Part 2 — Frontend

- **AppLayout component:** We introduced a layout component (`src/components/AppLayout.tsx`) that wraps the page in semantic `<header>` and `<main>`, provides a skip-to-content link for keyboard users, and applies the mobile-first container (max-width, padding). We chose it so the shell (landmarks, a11y, layout) lives in one place, loading and error states get the same structure, and `App.tsx` can focus on task logic instead of repeated layout markup.

- **Tailwind and accessibility:** Tailwind v4 with `@theme` in `src/index.css` defines a single palette (primary blue, accent green, danger red, surface grey) so we don’t repeat colours. Palette and surface are chosen for **WCAG 2 Level AA** contrast (e.g. primary-600/700 on white) and a **dyslexia-friendly** light grey background (`--color-surface`) instead of pure white. Components use visible focus rings, sufficient touch targets (e.g. 44px min), and semantic structure; layout includes a skip-to-content link.
