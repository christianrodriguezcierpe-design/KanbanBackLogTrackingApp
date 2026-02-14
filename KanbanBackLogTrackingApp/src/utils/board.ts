import type { BoardState, CardColor, ColumnId, Priority, TaskCard } from '../types';

interface CreateTaskInput {
  title: string;
  description?: string;
  projectTag?: string;
  priority: Priority;
  dueDate?: string;
  color: CardColor;
  columnId: ColumnId;
}

interface FilterInput {
  searchQuery: string;
  filterTag: string | null;
  filterPriority: Priority | null;
}

const COLUMN_ORDER: ColumnId[] = ['backlog', 'todo', 'in_progress', 'done'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

interface BacklogPromotionCandidate {
  title: string;
  projectTag?: string;
  priority: Priority;
}

export function createTask(input: CreateTaskInput, now: string, id: string): TaskCard {
  return {
    id,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    projectTag: input.projectTag?.trim() || undefined,
    priority: input.priority,
    dueDate: input.dueDate || undefined,
    color: input.color,
    columnId: input.columnId,
    createdAt: now,
    updatedAt: now,
  };
}

export function editTask(card: TaskCard, patch: Partial<CreateTaskInput>, now: string): TaskCard {
  return {
    ...card,
    title: patch.title !== undefined ? patch.title.trim() : card.title,
    description: patch.description !== undefined ? patch.description.trim() || undefined : card.description,
    projectTag: patch.projectTag !== undefined ? patch.projectTag.trim() || undefined : card.projectTag,
    priority: patch.priority ?? card.priority,
    dueDate: patch.dueDate !== undefined ? patch.dueDate || undefined : card.dueDate,
    color: patch.color ?? card.color,
    columnId: patch.columnId ?? card.columnId,
    updatedAt: now,
  };
}

export function moveTask(
  cards: TaskCard[],
  taskId: string,
  toColumnId: ColumnId,
  toIndex: number,
  now: string,
): TaskCard[] {
  const lists: Record<ColumnId, TaskCard[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    done: [],
  };

  for (const card of cards) {
    lists[card.columnId].push(card);
  }

  let moving: TaskCard | null = null;

  for (const column of COLUMN_ORDER) {
    const idx = lists[column].findIndex((card) => card.id === taskId);
    if (idx !== -1) {
      moving = lists[column][idx];
      lists[column].splice(idx, 1);
      break;
    }
  }

  if (!moving) {
    return cards;
  }

  const updatedMoving: TaskCard = {
    ...moving,
    columnId: toColumnId,
    updatedAt: now,
  };

  const target = lists[toColumnId];
  const boundedIndex = Math.max(0, Math.min(toIndex, target.length));
  target.splice(boundedIndex, 0, updatedMoving);

  return COLUMN_ORDER.flatMap((column) => lists[column]);
}

export function deleteTask(cards: TaskCard[], taskId: string): TaskCard[] {
  return cards.filter((card) => card.id !== taskId);
}

export function clearDone(cards: TaskCard[]): TaskCard[] {
  return cards.filter((card) => card.columnId !== 'done');
}

export function getVisibleCards(cards: TaskCard[], filters: FilterInput): TaskCard[] {
  const query = filters.searchQuery.trim().toLowerCase();
  const tag = filters.filterTag?.toLowerCase() ?? null;

  return cards.filter((card) => {
    if (filters.filterPriority && card.priority !== filters.filterPriority) {
      return false;
    }

    if (tag && card.projectTag?.toLowerCase() !== tag) {
      return false;
    }

    if (!query) {
      return true;
    }

    const text = `${card.title} ${card.description ?? ''}`.toLowerCase();
    return text.includes(query);
  });
}

export function getColumnCards(cards: TaskCard[], columnId: ColumnId): TaskCard[] {
  return cards.filter((card) => card.columnId === columnId);
}

export function getTagOptions(state: BoardState): string[] {
  return Array.from(
    new Set(
      state.cards
        .map((card) => card.projectTag?.trim())
        .filter((tag): tag is string => Boolean(tag)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export function getBacklogPromotionMissingFields(card: BacklogPromotionCandidate): string[] {
  const missing: string[] = [];

  if (!card.title.trim()) {
    missing.push('title');
  }

  if (!card.projectTag?.trim()) {
    missing.push('project tag');
  }

  if (!PRIORITIES.includes(card.priority)) {
    missing.push('priority');
  }

  return missing;
}
