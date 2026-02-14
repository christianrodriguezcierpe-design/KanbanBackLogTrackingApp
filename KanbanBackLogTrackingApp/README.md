# Kanban Backlog Tracker

Local-first Kanban board built with React + Vite + TypeScript. The app is designed for personal project tracking and AI-assisted coding practice.

## Features
- Four fixed columns: `Backlog`, `To Do`, `In Progress`, `Done`.
- Create, edit, delete, and drag/drop task cards.
- New tasks default to `Backlog` intake.
- Moving a task out of `Backlog` or saving directly into non-`Backlog` columns requires triage-complete fields: `title`, `project tag`, `priority`.
- Card fields: title, description, project tag, priority, due date, color.
- Search and filters (tag + priority).
- Local persistence in `localStorage` with v1->v2 migration and corruption fallback.
- Responsive layout for desktop/mobile.

## Tech Stack
- React 18
- Vite
- TypeScript (strict)
- `@dnd-kit` for drag and drop
- Vitest + Testing Library
- GitHub Actions + GitHub Pages deployment

## Local Development
```bash
npm install
npm run dev
```

## Quality Checks
```bash
npm run lint
npm run test
npm run build
```

## Persistence Contract
- Storage key: `kanban.backlog.v2`
- Legacy key auto-migrated on first load: `kanban.backlog.v1`
- Invalid/corrupt payloads reset to an empty board and surface a non-blocking warning.

## Deployment
Push to `main` to trigger `.github/workflows/deploy.yml`.

For GitHub Pages, ensure repository settings enable Pages with `GitHub Actions` source.
