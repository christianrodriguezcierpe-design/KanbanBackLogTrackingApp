export type ColumnId = 'backlog' | 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type CardColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange';

export interface TaskCard {
  id: string;
  title: string;
  description?: string;
  projectTag?: string;
  priority: Priority;
  dueDate?: string;
  color: CardColor;
  columnId: ColumnId;
  createdAt: string;
  updatedAt: string;
}

export interface BoardState {
  version: 2;
  cards: TaskCard[];
  searchQuery: string;
  filterTag: string | null;
  filterPriority: Priority | null;
}
