# Shoaib's Radar

A local web UI for the [beads](https://github.com/fiddlerwoaroof/beads) issue tracker. Radar auto-discovers all beads-managed projects under your home directory and gives you a unified interface to browse issues, create new ones, inspect issue details, and visualize dependencies — without leaving the browser.

## Prerequisites

- Node.js 18+
- `bd` CLI installed and on your `PATH`

## Setup

```bash
# Install dependencies
npm run install:all
```

## Running

```bash
npm run dev
```

Opens the client at [http://localhost:5173](http://localhost:5173) and the server at port 3131 — both start with one command.

## Features

- **Project sidebar** — auto-discovers all beads projects 3 levels deep under `~/`, shows git branch + dirty status
- **Issues table** — filterable by status, priority, type; search bar; tabs for All / Ready / Blocked; 30s auto-refresh
- **Issue detail panel** — inline edit title, status, priority, type, assignee; manage comments, notes, labels, and dependencies; defer or close issues
- **Create issue modal** — full form with title, description, type, priority, assignee, acceptance criteria, and design notes
- **Dependency graph** — SVG graph showing what an issue depends on and what it blocks, toggled from the detail panel; click any node to navigate to that issue
- **Error boundary** — component crashes are isolated; the sidebar stays visible
