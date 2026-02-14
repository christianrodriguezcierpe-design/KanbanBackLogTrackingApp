# Decisions Log

## 2026-02-14 - Add explicit Backlog intake and triage gate
- Context: The board previously started at `To Do`, making intake and prioritization less explicit.
- Decision: Add a first-class `Backlog` column, default new tasks to `Backlog`, and require triage-complete data (`title`, `project tag`, `priority`) before moving tasks out of `Backlog`.
- Consequences: Workflow is more disciplined and cards carry minimum execution context before entering active lanes. Users may see blocking toast warnings until triage fields are filled.
- Update: Enforcement now applies to both drag promotion and modal save into non-`Backlog` columns.

## 2026-02-14 - Migrate storage schema from v1 to v2
- Context: The new `Backlog` column changed the persisted data contract.
- Decision: Move active storage key to `kanban.backlog.v2` and automatically migrate valid `kanban.backlog.v1` payloads on load.
- Consequences: Existing local users keep their data without manual action; corrupted/invalid payloads still reset safely.

## 2026-02-14 - Preserve card action buttons while draggable
- Context: Card-level drag listeners captured pointer events and prevented reliable `Edit`/`Delete` clicks in deployed UI.
- Decision: Stop pointer event propagation for the action area/buttons so drag initiation does not consume action clicks.
- Consequences: `Edit`/`Delete` are now reliable while sortable drag behavior remains available on the card.
