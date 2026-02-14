import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { COLUMNS, COLORS, DEFAULT_BOARD_STATE, PRIORITIES, TITLE_MAX_LENGTH } from './constants';
import type { BoardState, CardColor, ColumnId, Priority, TaskCard } from './types';
import {
  clearDone,
  createTask,
  deleteTask,
  editTask,
  getBacklogPromotionMissingFields,
  getColumnCards,
  getTagOptions,
  getVisibleCards,
  moveTask,
} from './utils/board';
import { loadBoardState, saveBoardState } from './utils/storage';
import { BoardColumn } from './components/BoardColumn';
import { TaskModal } from './components/TaskModal';

interface TaskDraft {
  title: string;
  description: string;
  projectTag: string;
  priority: Priority;
  dueDate: string;
  color: CardColor;
  columnId: ColumnId;
}

const DEFAULT_DRAFT: TaskDraft = {
  title: '',
  description: '',
  projectTag: '',
  priority: 'medium',
  dueDate: '',
  color: 'yellow',
  columnId: 'backlog',
};

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function mapCardToDraft(card: TaskCard): TaskDraft {
  return {
    title: card.title,
    description: card.description ?? '',
    projectTag: card.projectTag ?? '',
    priority: card.priority,
    dueDate: card.dueDate ?? '',
    color: card.color,
    columnId: card.columnId,
  };
}

function formatMissingFields(fields: string[]): string {
  if (fields.length === 1) {
    return fields[0];
  }

  return `${fields.slice(0, -1).join(', ')} and ${fields[fields.length - 1]}`;
}

export default function App() {
  const loaded = typeof window === 'undefined' ? { state: DEFAULT_BOARD_STATE, warning: null } : loadBoardState();
  const [state, setState] = useState<BoardState>(loaded.state);
  const [warning, setWarning] = useState<string | null>(loaded.warning);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TaskDraft>(DEFAULT_DRAFT);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const visibleCards = useMemo(
    () =>
      getVisibleCards(state.cards, {
        searchQuery: state.searchQuery,
        filterTag: state.filterTag,
        filterPriority: state.filterPriority,
      }),
    [state.cards, state.searchQuery, state.filterTag, state.filterPriority],
  );

  const tags = useMemo(() => getTagOptions(state), [state]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveBoardState(state);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [state]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toastMessage]);

  function openCreateModal(columnId: ColumnId = 'backlog') {
    setDraft({ ...DEFAULT_DRAFT, columnId });
    setEditingId(null);
    setIsModalOpen(true);
  }

  function openEditModal(card: TaskCard) {
    setDraft(mapCardToDraft(card));
    setEditingId(card.id);
    setIsModalOpen(true);
  }

  function handleSaveTask() {
    const trimmedTitle = draft.title.trim();
    if (!trimmedTitle) {
      return;
    }

    if (draft.columnId !== 'backlog') {
      const missing = getBacklogPromotionMissingFields({
        title: draft.title,
        projectTag: draft.projectTag,
        priority: draft.priority,
      });

      if (missing.length > 0) {
        setToastMessage(`Complete triage before saving outside Backlog: ${formatMissingFields(missing)}.`);
        return;
      }
    }

    if (editingId) {
      setState((prev) => ({
        ...prev,
        cards: prev.cards.map((card) =>
          card.id === editingId
            ? editTask(
                card,
                {
                  title: draft.title,
                  description: draft.description,
                  projectTag: draft.projectTag,
                  priority: draft.priority,
                  dueDate: draft.dueDate,
                  color: draft.color,
                  columnId: draft.columnId,
                },
                nowIso(),
              )
            : card,
        ),
      }));
    } else {
      const newCard = createTask(
        {
          title: draft.title,
          description: draft.description,
          projectTag: draft.projectTag,
          priority: draft.priority,
          dueDate: draft.dueDate,
          color: draft.color,
          columnId: draft.columnId,
        },
        nowIso(),
        uuid(),
      );

      setState((prev) => ({
        ...prev,
        cards: [...prev.cards, newCard],
      }));
    }

    setIsModalOpen(false);
  }

  function handleDeleteTask(taskId: string) {
    setState((prev) => ({
      ...prev,
      cards: deleteTask(prev.cards, taskId),
    }));
  }

  function handleClearDone() {
    if (!window.confirm('Clear all tasks in Done?')) {
      return;
    }

    setState((prev) => ({
      ...prev,
      cards: clearDone(prev.cards),
    }));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const taskId = String(active.id);
    const overId = String(over.id);

    const activeCard = state.cards.find((card) => card.id === taskId);
    if (!activeCard) {
      return;
    }

    if (!overId.startsWith('column-')) {
      const overCard = state.cards.find((card) => card.id === overId);
      if (overCard && overCard.columnId === activeCard.columnId) {
        const currentColumnCards = getColumnCards(state.cards, activeCard.columnId);
        const oldIndex = currentColumnCards.findIndex((card) => card.id === taskId);
        const newIndex = currentColumnCards.findIndex((card) => card.id === overCard.id);
        if (oldIndex === -1 || newIndex === -1) {
          return;
        }

        const reordered = arrayMove(currentColumnCards, oldIndex, newIndex).map((card, index) => ({
          ...card,
          updatedAt: index === newIndex ? nowIso() : card.updatedAt,
        }));

        setState((prev) => {
          const other = prev.cards.filter((card) => card.columnId !== activeCard.columnId);
          return {
            ...prev,
            cards: [...other, ...reordered],
          };
        });
        return;
      }
    }

    let targetColumn: ColumnId;
    let targetIndex: number;

    if (overId.startsWith('column-')) {
      targetColumn = overId.replace('column-', '') as ColumnId;
      targetIndex = getColumnCards(state.cards, targetColumn).length;
    } else {
      const overCard = state.cards.find((card) => card.id === overId);
      if (!overCard) {
        return;
      }
      targetColumn = overCard.columnId;
      targetIndex = getColumnCards(state.cards, targetColumn).findIndex((card) => card.id === overCard.id);
    }

    if (activeCard.columnId === 'backlog' && targetColumn !== 'backlog') {
      const missing = getBacklogPromotionMissingFields(activeCard);
      if (missing.length > 0) {
        setToastMessage(`Complete triage before moving out of Backlog: ${formatMissingFields(missing)}.`);
        return;
      }
    }

    setState((prev) => ({
      ...prev,
      cards: moveTask(prev.cards, taskId, targetColumn, targetIndex, nowIso()),
    }));
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Kanban Backlog Tracker</h1>
          <p className="subtitle">Local-first board for project work and learning.</p>
        </div>

        <div className="header-controls">
          <span className="pill" aria-live="polite">
            {state.cards.length} tasks
          </span>
          <button type="button" className="primary" onClick={() => openCreateModal()}>
            Quick Add
          </button>
          <button type="button" className="danger" onClick={handleClearDone}>
            Clear Done
          </button>
        </div>
      </header>

      {warning && (
        <div className="warning" role="status">
          {warning}
          <button type="button" onClick={() => setWarning(null)}>
            Dismiss
          </button>
        </div>
      )}

      {toastMessage && (
        <div className="toast-warning" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}

      <section className="filters" aria-label="Filters and search">
        <label>
          Search
          <input
            type="search"
            value={state.searchQuery}
            onChange={(event) => setState((prev) => ({ ...prev, searchQuery: event.target.value }))}
            placeholder="Search title or description"
          />
        </label>

        <label>
          Tag
          <select
            value={state.filterTag ?? ''}
            onChange={(event) =>
              setState((prev) => ({
                ...prev,
                filterTag: event.target.value ? event.target.value : null,
              }))
            }
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <label>
          Priority
          <select
            value={state.filterPriority ?? ''}
            onChange={(event) =>
              setState((prev) => ({
                ...prev,
                filterPriority: event.target.value ? (event.target.value as Priority) : null,
              }))
            }
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
      </section>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <main className="board" aria-label="Kanban board">
          {COLUMNS.map((column) => {
            const allColumnCards = getColumnCards(state.cards, column.id);
            const columnCards = getColumnCards(visibleCards, column.id);

            return (
              <SortableContext
                key={column.id}
                items={allColumnCards.map((card) => card.id)}
                strategy={verticalListSortingStrategy}
              >
                <BoardColumn
                  id={column.id}
                  title={column.label}
                  count={columnCards.length}
                  cards={columnCards}
                  emptyHint={column.emptyHint}
                  onAdd={() => openCreateModal(column.id)}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTask}
                />
              </SortableContext>
            );
          })}
        </main>
      </DndContext>

      <TaskModal
        isOpen={isModalOpen}
        isEditing={Boolean(editingId)}
        draft={draft}
        onChange={setDraft}
        onCancel={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        titleMax={TITLE_MAX_LENGTH}
        priorities={PRIORITIES}
        colors={COLORS}
      />
    </div>
  );
}
