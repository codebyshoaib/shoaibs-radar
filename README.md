# beads ui

A local web UI for the [beads](https://github.com/fiddlerwoaroof/beads) issue tracker. It discovers all beads-managed projects under your home directory and gives you a unified interface to browse issues, create new ones, inspect issue details, and visualize dependencies — without leaving the browser.

## Prerequisites

- Node.js 18+
- `bd` CLI installed and on your `PATH`

## Setup

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install
```

## Running

**Server** (port 3131):
```bash
cd server
npm start          # production
npm run dev        # watch mode (auto-restarts)
```

**Client** (port 5173):
```bash
cd client
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Features

- **Project sidebar** — auto-discovers all beads projects 3 levels deep under `~/`, shows git branch + dirty status
- **Issues table** — filterable by status, priority, type; tabs for All / Ready / Blocked; 30s auto-refresh
- **Issue detail panel** — inline edit title, status, priority, type, assignee; manage comments, notes, labels, and dependencies; defer or close issues
- **Create issue modal** — full form with title, description, type, priority, assignee, acceptance criteria, and design notes
- **Dependency graph** — SVG graph showing what an issue depends on and what it blocks, toggled from the detail panel
