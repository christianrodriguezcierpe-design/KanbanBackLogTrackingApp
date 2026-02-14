import { DEFAULT_BOARD_STATE, LEGACY_STORAGE_KEY, STORAGE_KEY } from '../constants';
import type { BoardState, CardColor, ColumnId, Priority, TaskCard } from '../types';

interface LoadResult {
  state: BoardState;
  warning: string | null;
}

type LegacyColumnId = Exclude<ColumnId, 'backlog'>;

interface LegacyTaskCard extends Omit<TaskCard, 'columnId'> {
  columnId: LegacyColumnId;
}

interface LegacyBoardState {
  version: 1;
  cards: LegacyTaskCard[];
  searchQuery: string;
  filterTag: string | null;
  filterPriority: Priority | null;
}

const V2_COLUMN_IDS: ColumnId[] = ['backlog', 'todo', 'in_progress', 'done'];
const V1_COLUMN_IDS: LegacyColumnId[] = ['todo', 'in_progress', 'done'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const COLORS: CardColor[] = ['yellow', 'blue', 'green', 'pink', 'orange'];

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function emptyBoardState(): BoardState {
  return { ...DEFAULT_BOARD_STATE, cards: [] };
}

function isTaskCardWithColumnSet(value: unknown, columnIds: readonly string[]): boolean {
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
    columnIds.includes(card.columnId as string) &&
    isString(card.createdAt) &&
    isString(card.updatedAt)
  );
}

function isBoardStateV2(value: unknown): value is BoardState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const state = value as Record<string, unknown>;
  return (
    state.version === 2 &&
    Array.isArray(state.cards) &&
    state.cards.every((card) => isTaskCardWithColumnSet(card, V2_COLUMN_IDS)) &&
    isString(state.searchQuery) &&
    (state.filterTag === null || isString(state.filterTag)) &&
    (state.filterPriority === null || PRIORITIES.includes(state.filterPriority as Priority))
  );
}

function isBoardStateV1(value: unknown): value is LegacyBoardState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const state = value as Record<string, unknown>;
  return (
    state.version === 1 &&
    Array.isArray(state.cards) &&
    state.cards.every((card) => isTaskCardWithColumnSet(card, V1_COLUMN_IDS)) &&
    isString(state.searchQuery) &&
    (state.filterTag === null || isString(state.filterTag)) &&
    (state.filterPriority === null || PRIORITIES.includes(state.filterPriority as Priority))
  );
}

function migrateV1ToV2(state: LegacyBoardState): BoardState {
  return {
    version: 2,
    cards: state.cards.map((card) => ({ ...card })),
    searchQuery: state.searchQuery,
    filterTag: state.filterTag,
    filterPriority: state.filterPriority,
  };
}

export function loadBoardState(): LoadResult {
  const rawV2 = localStorage.getItem(STORAGE_KEY);

  if (rawV2) {
    try {
      const parsed: unknown = JSON.parse(rawV2);

      if (!isBoardStateV2(parsed)) {
        return {
          state: emptyBoardState(),
          warning: 'Stored board data was invalid and has been reset.',
        };
      }

      return { state: parsed, warning: null };
    } catch {
      return {
        state: emptyBoardState(),
        warning: 'Stored board data was corrupted and has been reset.',
      };
    }
  }

  const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!rawV1) {
    return { state: emptyBoardState(), warning: null };
  }

  try {
    const parsed: unknown = JSON.parse(rawV1);

    if (!isBoardStateV1(parsed)) {
      return {
        state: emptyBoardState(),
        warning: 'Stored board data was invalid and has been reset.',
      };
    }

    const migrated = migrateV1ToV2(parsed);
    saveBoardState(migrated);
    localStorage.removeItem(LEGACY_STORAGE_KEY);

    return { state: migrated, warning: null };
  } catch {
    return {
      state: emptyBoardState(),
      warning: 'Stored board data was corrupted and has been reset.',
    };
  }
}

export function saveBoardState(state: BoardState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
