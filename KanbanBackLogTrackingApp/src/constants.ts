import type { BoardState, CardColor, ColumnId, Priority } from './types';

export const STORAGE_KEY = 'kanban.backlog.v2';
export const LEGACY_STORAGE_KEY = 'kanban.backlog.v1';

export const COLUMNS: { id: ColumnId; label: string; emptyHint: string }[] = [
  { id: 'backlog', label: 'Backlog', emptyHint: 'Capture new work here before triage.' },
  { id: 'todo', label: 'To Do', emptyHint: 'No tasks yet. Add one to get started.' },
  { id: 'in_progress', label: 'In Progress', emptyHint: 'Nothing in progress right now.' },
  { id: 'done', label: 'Done', emptyHint: 'Finished tasks appear here.' },
];

export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
export const COLORS: CardColor[] = ['yellow', 'blue', 'green', 'pink', 'orange'];

export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 500;
export const PROJECT_TAG_MAX_LENGTH = 40;

export const DEFAULT_BOARD_STATE: BoardState = {
  version: 2,
  cards: [],
  searchQuery: '',
  filterTag: null,
  filterPriority: null,
};
