# Beads UI — Design Spec
**Date:** 2026-04-16  
**Status:** Approved

---

## Overview

A browser-based graphical interface for the `bd` (beads) CLI issue tracker. Supports multiple projects with a unified view, full CRUD parity with the CLI, and git context per project. Lives at `~/beads-ui/` as a standalone global tool independent of any single project.

---

## Architecture

### Repository Layout

```
~/beads-ui/
├── package.json           # root — scripts to start both server and client
├── server/
│   ├── index.js           # Express app entry point
│   ├── routes/
│   │   ├── projects.js    # project discovery + git status
│   │   └── issues.js      # all bd command wrappers
│   └── lib/
│       ├── scanner.js     # scans /home/shoaib for .beads/metadata.json
│       ├── bd.js          # shells out to bd CLI, returns parsed JSON
│       └── git.js         # runs git commands in project dirs
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/
│       │   ├── Sidebar.jsx          # project list with health dots
│       │   ├── TopBar.jsx           # git status + issue stats
│       │   ├── IssuesTable.jsx      # filterable/sortable issues list
│       │   ├── IssueDetailPanel.jsx # slide-in full detail + actions
│       │   ├── CreateIssueModal.jsx # new issue form
│       │   └── DependencyGraph.jsx  # visual dependency tree
│       └── hooks/
│           ├── useProjects.js       # project list + polling
│           └── useIssues.js         # issues for active project + polling
└── README.md
```

### Data Flow

```
React → GET/POST /api/:projectId/... → Express → bd CLI (--json) → Express → React
```

- Express shells out to `bd` using the project's `.beads/` path via `--db` flag
- All issue state lives in beads' Dolt DB — beads-ui stores nothing
- Git info fetched via `git` commands run in the project directory
- 30-second polling on the active project; other projects polled at 2-minute intervals

### Project Discovery

On server startup, `scanner.js` walks `/home/shoaib` up to 3 directory levels deep looking for dirs containing `.beads/metadata.json`. Each discovered dir becomes a "project" entry with:
- `id` — from `metadata.json` (`dolt_database` field)
- `path` — absolute path to project root
- `name` — derived from `dolt_database` or directory name

A `GET /api/projects/refresh` endpoint re-runs the scan on demand (triggered by the UI refresh button).

---

## Backend

### Express Server (`server/index.js`)

- Port: `3131`
- CORS enabled for Vite dev server (`localhost:5173`)
- All routes under `/api/`
- Errors from `bd` CLI returned as `{ error: string, stderr: string }`

### `bd.js` — CLI Wrapper

Runs `bd --db <beads-path> <command> --json` as a child process from the project directory. Parses stdout as JSON. Captures stderr for error reporting. Timeout: 10 seconds per command.

### Routes

**Projects**
- `GET /api/projects` — list all discovered projects with git status + bd stats
- `GET /api/projects/refresh` — re-scan for new projects

**Issues (per project, prefix `/api/:projectId`)**
- `GET /issues` — `bd list --json` (supports `?status=`, `?priority=`, `?type=` filters)
- `GET /issues/ready` — `bd ready --json`
- `GET /issues/blocked` — `bd blocked --json`
- `GET /issues/:id` — `bd show <id> --json`
- `POST /issues` — `bd create` with body fields
- `PATCH /issues/:id` — `bd update <id>` (status, priority, title, description, notes, assignee)
- `DELETE /issues/:id` — `bd close <id>`
- `POST /issues/:id/comments` — `bd comment <id>`
- `GET /issues/:id/comments` — `bd comments <id> --json`
- `POST /issues/:id/deps` — `bd dep add`
- `DELETE /issues/:id/deps/:depId` — `bd dep remove`
- `POST /issues/:id/defer` — `bd defer <id>`
- `POST /issues/:id/labels` — `bd label <id>`
- `GET /issues/stats` — `bd stats --json`

**Git (per project)**
- `GET /api/:projectId/git` — branch, dirty status, last 5 commits

---

## Frontend

### Layout

```
┌─────────────┬──────────────────────────────┬───────────────────────┐
│  Sidebar    │  Top Bar (git + stats)        │                       │
│             ├──────────────────────────────│  Detail Panel         │
│  Projects   │  Issues Table                │  (slide-in on         │
│  with       │  + filters                   │   issue click)        │
│  health     │                              │                       │
│  dots       │                              │                       │
└─────────────┴──────────────────────────────┴───────────────────────┘
```

### Sidebar (`Sidebar.jsx`)

- Lists all discovered projects
- Health dot per project:
  - 🟢 Green — no blocked issues
  - 🟡 Yellow — some blocked
  - 🔴 Red — P0 issues blocked
- Active project highlighted
- Refresh button at bottom to re-scan

### Top Bar (`TopBar.jsx`)

- Project name + current git branch
- Dirty indicator (uncommitted changes)
- Last commit message + time
- Stats pills: `open: N` `in_progress: N` `blocked: N` `closed: N`
- "New Issue" button → opens `CreateIssueModal`

### Issues Table (`IssuesTable.jsx`)

- Columns: ID, Title, Type, Priority, Status, Assignee, Updated
- Filter bar: status (open/in_progress/blocked/closed), priority (P0–P4), type (task/bug/feature)
- Quick tabs: All / Ready / Blocked
- Clicking a row opens the Detail Panel
- Priority shown as colored badge (P0=red, P1=orange, P2=yellow, P3=blue, P4=grey)
- Status shown as icon (○ open, ◐ in_progress, ● blocked, ✓ closed)

### Issue Detail Panel (`IssueDetailPanel.jsx`)

Slides in from the right on issue click. Contains:

- Title (inline editable)
- ID, type, priority (editable dropdowns)
- Status (editable dropdown)
- Assignee (editable text)
- Description (markdown rendered, click to edit)
- Notes section (append-only, with add form)
- Dependencies section — lists blocking issues and blocked-by issues, with links; button to add/remove dep
- Comments section — threaded list + add comment form
- Labels — displayed as chips, add/remove
- Defer button — opens date picker
- Close button — with optional reason input

### Create Issue Modal (`CreateIssueModal.jsx`)

Form fields: title (required), description, type, priority, assignee, acceptance criteria, design notes. Submit calls `POST /api/:projectId/issues`.

### Dependency Graph (`DependencyGraph.jsx`)

Optional view (toggle button in detail panel) — renders a small SVG/canvas graph of the issue's dependency chain using a simple force-directed layout. Shows issue IDs as nodes, edges as arrows. Click a node to navigate to that issue.

---

## Styling

- Tailwind CSS — consistent with SellPredator stack, familiar
- Dark mode by default (fits terminal-user audience)
- Monospace font for issue IDs and git hashes

---

## Running the App

```bash
cd ~/beads-ui
npm install
npm run dev       # starts both Express (3131) and Vite (5173) concurrently
```

`package.json` scripts use `concurrently` to start both server and client with one command.

---

## Error Handling

- If `bd` CLI not found: show setup message with install instructions
- If a project's `.beads/` dir is missing/corrupt: show warning in sidebar, skip that project
- If `bd` command times out (>10s): show toast error, don't crash
- Git commands failing (not a git repo): git section shows "not a git repo" gracefully

---

## Out of Scope (v1)

- Authentication — local tool, no auth needed
- `bd dolt push/pull` from UI — keep that in CLI for now
- Formulas / mol commands — complex enough to be v2
- Mobile responsiveness — desktop only
