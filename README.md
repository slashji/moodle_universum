# IT Universe — Curriculum Knowledge Map

An interactive star-map / knowledge-universe visualization of an IT Specialist
curriculum, powered by live Moodle course completion data. Instead of a
traditional LMS dashboard, courses, technologies, and knowledge areas are
laid out as an explorable 2D/2.5D universe: domains form galaxies, courses
are bright stars, related knowledge areas cluster around them, and a
student's Moodle progress lights up the parts of the universe they've
discovered.

![status](https://img.shields.io/badge/status-MVP-blue)

## Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick start (Docker)](#quick-start-docker)
- [Local development (without Docker)](#local-development-without-docker)
- [Environment variables](#environment-variables)
- [Mock Moodle mode](#mock-moodle-mode)
- [Configuring a real Moodle server](#configuring-a-real-moodle-server)
- [Database migrations & seed data](#database-migrations--seed-data)
- [Backend development](#backend-development)
- [Frontend development](#frontend-development)
- [Testing](#testing)
- [API reference](#api-reference)
- [Known limitations / next steps](#known-limitations--next-steps)

## Overview

Users can:

- pan and zoom infinitely around the curriculum universe
- search for a course, technology, domain, or knowledge topic
- click a node to inspect it (course info, progress, related/recommended
  topics, a link to the Moodle course)
- see which parts of their curriculum are completed, in progress, or not
  started — communicated with icons, progress rings, brightness, and labels,
  not color alone
- (as an admin) drag nodes to reposition them, create/delete connections,
  edit descriptions & importance, and add new nodes

The visualization is primarily 2D, rendered with **PixiJS** for performance
(no per-node DOM elements), with 2.5D effects — parallax starfield, glow,
animated highlight/dim states, zoom-dependent labels ("semantic zoom") — to
give it depth without becoming an uncontrolled 3D scene.

## Architecture

```
/
├── frontend/    React + TypeScript + Vite + PixiJS
├── backend/     Node.js + TypeScript + Express + Prisma
├── shared/      TypeScript types shared by both (no build step; consumed as source)
└── docker-compose.yml
```

**Two data sources are kept deliberately separate:**

- **Moodle** answers: what courses exist, which the student is enrolled in,
  how complete each course is, and whether it's finished. All Moodle access
  goes through a `MoodleProvider` interface
  ([backend/src/providers/moodle](backend/src/providers/moodle)), with
  `MockMoodleProvider` (default, no server needed) and `RealMoodleProvider`
  (talks to Moodle's REST Web Services) implementations, selected by the
  `MOODLE_PROVIDER` env var. Moodle tokens never reach the browser — the
  frontend only ever talks to our own backend.
- **The application's PostgreSQL database** answers: where a node sits in
  the universe, what domain it belongs to, what it connects to
  (prerequisites, related topics, recommended-next), and its visual
  properties (size, importance). See
  [backend/prisma/schema.prisma](backend/prisma/schema.prisma).

A **merge service**
([backend/src/services/mergeService.ts](backend/src/services/mergeService.ts))
joins the two using `moodleCourseId` as the stable key, producing the graph
the frontend renders. The frontend never merges Moodle data itself.

```
Browser (React + PixiJS)
   │  REST (JSON)
   ▼
Backend (Express)
   ├── routes/         thin HTTP handlers
   ├── services/        universe CRUD, Moodle/universe merge, progress calc
   ├── providers/moodle/ MoodleProvider abstraction (mock | real)
   ├── auth/             AuthProvider abstraction (dev today, SSO-ready)
   └── database/         Prisma client
   │
   ├──► PostgreSQL (universe graph: nodes, edges, domains, layout)
   └──► Moodle REST Web Services (courses, completion) — server-side only
```

On the frontend, **visualization state lives inside the PixiJS renderer**
(`UniverseRenderer`, a plain class, not React state) — camera pan/zoom,
per-frame animation, and hit-testing all happen there so 60fps camera
movement never triggers React re-renders. **App state** (loaded graph data,
selection, search, editor mode) lives in a small Zustand store
(`frontend/src/state/store.ts`). The two talk to each other through a thin
`UniverseCanvas` React wrapper that mounts/updates the renderer imperatively.

## Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 16 (or Docker, which provides one for you)
- No Moodle server required for local development (mock provider is the
  default)

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

This starts PostgreSQL, the backend (port 4000), and the frontend dev server
(port 5173). On first run, apply migrations and seed the curriculum data:

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed
```

Then open **http://localhost:5173**.

## Local development (without Docker)

1. Install a local PostgreSQL and create a database + role, e.g.:

   ```bash
   createdb moodle_universum
   psql -d postgres -c "CREATE ROLE universum LOGIN PASSWORD 'universum' CREATEDB;"
   ```

2. Copy env files:

   ```bash
   cp .env.example backend/.env
   cp .env.example frontend/.env   # only VITE_* vars are read by the frontend
   ```

   Edit `backend/.env`'s `DATABASE_URL` to match your local Postgres.

3. Install dependencies (npm workspaces — installs `frontend`, `backend`,
   and `shared` together):

   ```bash
   npm install
   ```

4. Run migrations and seed the curriculum:

   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. Start both dev servers (in separate terminals):

   ```bash
   npm run dev:backend    # http://localhost:4000
   npm run dev:frontend   # http://localhost:5173
   ```

6. Open http://localhost:5173. You should land in the universe, flown in
   toward your most active in-progress course, with mock Moodle progress
   already applied.

## Environment variables

See [.env.example](.env.example) for the full annotated list. Highlights:

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | Postgres connection string (Prisma) |
| `MOODLE_PROVIDER` | backend | `mock` (default) or `real` |
| `MOODLE_BASE_URL` | backend | Moodle site URL (required if `real`) |
| `MOODLE_TOKEN` | backend | Moodle Web Services token (required if `real`, never sent to the browser) |
| `AUTH_MODE` | backend | Currently only `dev` — see [Authentication](#authentication-notes) |
| `DEV_DEFAULT_ROLE` | backend | `student` (default) or `admin` — controls whether the editor UI is available |
| `VITE_API_BASE_URL` | frontend | Backend API base URL, e.g. `http://localhost:4000/api` |
| `VITE_MOODLE_BASE_URL` | frontend | Used only to build "Open in Moodle" links |

### Authentication notes

The MVP uses a simple **dev auth provider**
(`backend/src/auth/devAuthProvider.ts`): it trusts whatever the Moodle
provider (mock or real) says the "current user" is, upserts a local `User`
row, and assigns the role from `DEV_DEFAULT_ROLE` (overridable per-request
with an `x-dev-role: admin|student|teacher` header, handy for `curl`
testing). This is intentionally swappable — `AuthProvider`
(`backend/src/auth/types.ts`) is the interface routes depend on, so a real
Moodle SSO / OAuth provider can be dropped in later without touching route
code. **Do not use dev auth in production.**

## Mock Moodle mode

`MOODLE_PROVIDER=mock` (the default) uses
[`MockMoodleProvider`](backend/src/providers/moodle/mockProvider.ts), which
returns a fixed student (`{ id: 123, fullname: "Example Student" }`) and 10
realistic enrolled courses with varying completion states — no network
calls, no Moodle server needed. This is what makes "start the app and see a
populated universe" possible without any external dependency.

## Configuring a real Moodle server

1. In Moodle: **Site administration → Server → Web services → Enable web
   services** (and enable the REST protocol under **Manage protocols**).
2. Create (or choose) a user with permission to view course completion, and
   under **External services**, either use "Moodle mobile web service" or
   create a custom service exposing at least:
   - `core_webservice_get_site_info`
   - `core_enrol_get_users_courses`
   - `core_course_get_categories`
3. Under **Manage tokens**, generate a token for that user/service.
4. Set in `backend/.env`:

   ```
   MOODLE_PROVIDER=real
   MOODLE_BASE_URL=https://your-moodle-site.example.org
   MOODLE_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. Restart the backend. No frontend changes are needed — the frontend only
   ever calls our own backend, which is exactly the point of the
   `MoodleProvider` abstraction.

Course **completion percentage** is read from `core_enrol_get_users_courses`'s
`progress`/`completed` fields, which Moodle only populates when completion
tracking is enabled on a course; otherwise `completion` is `null` and the
course is treated as not started. If Moodle is unreachable or the token is
invalid, the backend serves the universe layout anyway (with
`moodleStatus: "degraded"` in the `/api/universe` response) rather than
failing the whole page — see `backend/src/routes/universe.ts`.

## Database migrations & seed data

```bash
npm run prisma:migrate   # create/apply a migration from schema.prisma
npm run prisma:seed      # (re-)populate 10 domains, ~60 nodes, ~60 edges
```

The seed script (`backend/prisma/seed.ts`, data in
`backend/prisma/seedData.ts`) is idempotent (upserts by id), so re-running it
is safe. It lays domains out in a ring and spirals each domain's nodes
around its center (Vogel/sunflower spiral) so related topics start out
visually clustered — this is a starting layout only; positions are then
free-form and persisted whenever an admin drags a node (`PATCH
/api/admin/layout`).

## Backend development

```bash
cd backend
npm run dev     # tsx watch — restarts on change
npm test        # vitest
npx prisma studio   # inspect the database visually
```

Structure:

```
backend/src/
├── routes/        HTTP layer only — no business logic
├── services/       universeService (CRUD), mergeService, progressService
├── providers/moodle/  MoodleProvider, MockMoodleProvider, RealMoodleProvider
├── auth/            AuthProvider, DevAuthProvider
├── middleware/       attachUser, requireAdmin, errorHandler
└── database/         Prisma client singleton
```

## Frontend development

```bash
cd frontend
npm run dev      # Vite dev server
npm test         # vitest
```

Structure:

```
frontend/src/
├── components/
│   ├── universe/    UniverseRenderer (PixiJS engine), NodeSprite, edges,
│   │                 starfield, UniverseCanvas (React wrapper)
│   ├── panels/       NodePanel (selection detail + editor controls)
│   ├── search/       SearchBar
│   ├── hud/          HUD (progress overview)
│   └── TopBar.tsx, ZoomControls.tsx, Legend.tsx
├── state/store.ts    Zustand store — app state only (not camera/visualization)
├── api/              typed fetch client + query functions
├── hooks/            useUniverseData (initial load sequence)
└── utils/            pure helpers (e.g. search ranking) kept testable
```

Performance choices worth knowing about, since they shape the code:

- The universe is one PixiJS `Application`; nodes/edges are Pixi
  `Container`/`Graphics`/`Text` objects, **not** React DOM elements.
- Camera pan/zoom moves a single `world` container transform — not every
  node individually.
- Edges are redrawn into one batched `Graphics` object only when data,
  selection, or a dragged node's position changes — never per animation
  frame.
- Nodes outside the viewport (plus a margin) are marked `visible = false`
  each camera move (viewport culling); labels are only created/shown based
  on zoom level and importance ("semantic zoom") to avoid text overdraw.

## Testing

```bash
npm run --workspace backend test
npm run --workspace frontend test
```

Backend: `MockMoodleProvider`, the Moodle/universe merge (status/completion
derivation, cross-domain "soft discovery", per-domain aggregation), and
progress-summary calculation. Frontend: search ranking and the app-state
store's node/edge/selection logic. Kept intentionally light — this is not a
full test-pyramid, just coverage of the non-obvious logic.

## API reference

All routes are prefixed with `/api` and require no auth header in dev mode
(the dev auth provider resolves a user automatically).

| Method & path | Purpose |
|---|---|
| `GET /api/me` | Current user + role |
| `GET /api/moodle/courses` | Raw enrolled courses from Moodle |
| `GET /api/moodle/completion` | Lightweight completion-only view |
| `GET /api/universe` | Full merged graph (`nodes`, `edges`, `domains`, `progress`, `moodleStatus`) |
| `GET /api/universe/nodes` | Nodes only |
| `GET /api/universe/edges` | Edges only |
| `GET /api/domains` | Domains with computed completion |
| `POST /api/admin/nodes` | Create a node (admin) |
| `PATCH /api/admin/nodes/:id` | Update a node (admin) |
| `DELETE /api/admin/nodes/:id` | Delete a node + its edges (admin) |
| `POST /api/admin/edges` | Create an edge (admin) |
| `DELETE /api/admin/edges/:id` | Delete an edge (admin) |
| `PATCH /api/admin/layout` | Bulk-update node positions (admin) |

Admin routes require `role === "admin"` (403 otherwise) — see
`backend/src/middleware/auth.ts`.

## Known limitations / next steps

Deliberately out of scope for this MVP, but the architecture leaves room for
them:

- **Grades, activities, competencies, teachers, assignments, deadlines** —
  add methods to `MoodleProvider` and corresponding mock data; nothing about
  the merge/route layering needs to change.
- **Teacher/multi-student dashboards** — `progressService` already computes
  reusable aggregates (per-domain completion, counts); it just needs a
  student-selector at the route layer instead of always resolving "the
  current user".
- **Moodle activity drill-down** (Topic → Assignment/Quiz/Lab) — the
  `NodeType` enum and graph model support arbitrary node types and
  `contains` edges already; this would add new node types under a course
  rather than changing the schema.
- **Force-directed auto-layout** — layout is currently deterministic
  (ring + spiral) plus manual admin drag; an optional force-directed pass
  could be added as an admin tool without touching how positions are stored
  or rendered.
- **Real auth** — swap `DevAuthProvider` for a Moodle SSO/OAuth
  implementation of the same `AuthProvider` interface.
