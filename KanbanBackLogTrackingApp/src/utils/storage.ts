import { DEFAULT_BOARD_STATE, STORAGE_KEY } from '../constants';
import type { BoardState, CardColor, ColumnId, Priority, TaskCard } from '../types';

interface LoadResult {
  state: BoardState;
  warning: string | null;
}

const COLUMN_IDS: ColumnId[] = ['todo', 'in_progress', 'done'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const COLORS: CardColor[] = ['yellow', 'blue', 'green', 'pink', 'orange'];

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isTaskCard(value: unknown): value is TaskCard {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const card = value as Record<string, unknown>;
  return (
    isString(card.id) &&
    isString(card.title) &&
    (card.description === undefined || isString(card.description)) &&
    (card.projectTag === undefined || isString(card.projectTag)) &&
    PRIORITIES.includes(card.priority as Priority) &&
    (card.dueDate === undefined || isString(card.dueDate)) &&
    COLORS.includes(card.color as CardColor) &&
    COLUMN_IDS.includes(card.columnId as ColumnId) &&
    isString(card.createdAt) &&
    isString(card.updatedAt)
  );
}

function isBoardState(value: unknown): value is BoardState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const state = value as Record<string, unknown>;
  return (
    state.version === 1 &&
    Array.isArray(state.cards) &&
    state.cards.every(isTaskCard) &&
    isString(state.searchQuery) &&
    (state.filterTag === null || isString(state.filterTag)) &&
    (state.filterPriority === null || PRIORITIES.includes(state.filterPriority as Priority))
  );
}

export function loadBoardState(): LoadResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { state: DEFAULT_BOARD_STATE, warning: null };
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isBoardState(parsed)) {
      return {
        state: DEFAULT_BOARD_STATE,
        warning: 'Stored board data was invalid and has been reset.',
      };
    }

    return { state: parsed, warning: null };
  } catch {
    return {
      state: DEFAULT_BOARD_STATE,
      warning: 'Stored board data was corrupted and has been reset.',
    };
  }
}

export function saveBoardState(state: BoardState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
