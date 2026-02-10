# Kanban Backlog Tracker v1 Plan (Local-First, GitHub Pages)

## Summary
Build a simple personal Kanban web app to support two goals: learning AI-assisted coding and providing an easy personal project tracker.
v1 will be a single-board, local-first SPA with color post-it style cards and three fixed columns: `To Do`, `In Progress`, `Done`.
Tech stack and deployment are locked to `React + Vite + TypeScript` and `GitHub Pages` via GitHub Actions.

## Scope
In scope for v1:
- One board per user (stored in browser only).
- Create, edit, delete tasks.
- Drag-and-drop tasks across columns.
- Color-coded cards for project visualization.
- Basic filtering/search.
- Responsive layout for desktop and mobile.
- Zero-cost deployment from personal GitHub repo.

Out of scope for v1:
- Authentication.
- Cloud sync / multi-device sync.
- Real-time collaboration.
- Attachments/comments.
- Backend services.

## Product Content (What the app should contain)
Core board layout:
- Header: app name, short subtitle, task count, quick-add button.
- Columns: `To Do`, `In Progress`, `Done`.
- Each column shows count and empty-state hint text.

Task card content:
- `Title` (required).
- `Description` (optional).
- `Project tag` (optional, short text).
- `Priority` (`Low`, `Medium`, `High`).
- `Due date` (optional).
- `Color` (post-it palette).
- Metadata: created/updated timestamps.

Recommended post-it color palette:
- `yellow`, `blue`, `green`, `pink`, `orange`.
- Keep contrast AA-compliant for text readability.

v1 UX behaviors:
- Quick-add task in current column.
- Drag card to reorder within column and move across columns.
- Edit task in lightweight modal/panel.
- Filter by tag and priority.
- Search by title/description.
- “Clear Done” action with confirmation.

## Important Public Interfaces / Types
Define these TypeScript contracts and keep them stable through v1:

```ts
type ColumnId = "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high";
type CardColor = "yellow" | "blue" | "green" | "pink" | "orange";

interface TaskCard {
  id: string; // uuid
  title: string;
  description?: string;
  projectTag?: string;
  priority: Priority;
  dueDate?: string; // ISO date YYYY-MM-DD
  color: CardColor;
  columnId: ColumnId;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

interface BoardState {
  version: 1;
  cards: TaskCard[];
  searchQuery: string;
  filterTag: string | null;
  filterPriority: Priority | null;
}
```

Local persistence contract:
- `localStorage` key: `kanban.backlog.v1`.
- Save debounced after every state change.
- On invalid/corrupt payload: reset safely to empty board and show non-blocking warning.

## Architecture and Implementation Plan
1. Repository bootstrap
- Initialize Vite React TS app.
- Add ESLint + Prettier + strict TypeScript settings.
- Add `README.md` with product intent and local run steps.

2. Core app shell
- Build board layout with 3 fixed columns.
- Add responsive grid/stack behavior.

3. Task CRUD
- Add create/edit/delete flows.
- Implement form validation (`title` required, max lengths defined).

4. Drag and drop
- Use `@dnd-kit` for maintained DnD support.
- Persist new column/order after drop.

5. Filtering and search
- Tag + priority filter controls.
- Text search over title and description.

6. Persistence and resilience
- Load from `localStorage` on startup.
- Debounced persistence.
- Corruption handling and schema version field.

7. Styling and usability
- Post-it visual language with clear color meaning.
- Keyboard accessible controls and focus states.
- Mobile interactions validated.

8. CI/CD and GitHub Pages
- Add GitHub Actions workflow: install, lint, test, build, deploy.
- Configure Vite `base` for repo path (`/<repo-name>/`) in production.
- Publish from `gh-pages` artifact/action output.

## Testing and Acceptance Criteria
Automated tests (Vitest + Testing Library):
- Creating a task adds correct default fields.
- Editing updates `updatedAt`.
- Deleting removes task.
- Moving card changes `columnId` and order.
- Filtering/search returns expected subsets.
- Persistence reload restores board state.
- Corrupt storage payload triggers safe reset behavior.

Manual scenarios:
- Desktop drag-and-drop smoothness.
- Mobile card creation/editing usability.
- Keyboard navigation and focus visibility.
- Color contrast readability checks.
- GitHub Pages deployment smoke test.

Definition of done for v1:
- All core flows work without backend.
- Tests pass in CI.
- App is reachable on GitHub Pages URL and usable on phone + desktop.

## GitHub Workflow Plan
Branch strategy:
- `main` protected.
- Feature branches: `feat/<short-name>`.
- PR required for merge, even if solo (for learning review discipline).

Issue and milestone setup:
- Milestone: `v1.0 Local-First MVP`.
- Labels: `feature`, `bug`, `ux`, `tech-debt`, `docs`, `good-first-task`.
- Create issues matching implementation steps above.

Suggested initial issue list:
1. Bootstrap React/Vite/TS + lint/test tooling.
2. Build board layout + column components.
3. Implement task form and CRUD.
4. Add DnD movement + ordering.
5. Add filters/search.
6. Add persistence + corruption fallback.
7. Add accessibility + mobile polish.
8. Add CI/CD + GitHub Pages deploy.
9. Write README + screenshots + usage guide.

## Rollout
- v1.0: local-only personal board.
- v1.1: multiple boards (still local).
- v1.2: optional cloud sync (Supabase/Firebase) behind feature flag.

## Assumptions and Defaults
- Chosen by you: `React + Vite + TypeScript`.
- Chosen by you: single-board v1.
- Chosen by you: deploy to GitHub Pages from personal repo.
- Default column labels normalized to `To Do`, `In Progress`, `Done` (fixing typo “In proces”).
