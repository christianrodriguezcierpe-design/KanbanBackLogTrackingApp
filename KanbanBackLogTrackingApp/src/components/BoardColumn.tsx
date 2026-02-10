import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ColumnId, TaskCard } from '../types';

interface BoardColumnProps {
  id: ColumnId;
  title: string;
  count: number;
  cards: TaskCard[];
  emptyHint: string;
  onAdd: () => void;
  onEdit: (card: TaskCard) => void;
  onDelete: (taskId: string) => void;
}

interface TaskCardItemProps {
  card: TaskCard;
  onEdit: (card: TaskCard) => void;
  onDelete: (taskId: string) => void;
}

export function BoardColumn({ id, title, count, cards, emptyHint, onAdd, onEdit, onDelete }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({ id: `column-${id}` });

  return (
    <section className="column" aria-label={title}>
      <header className="column-header">
        <h2>{title}</h2>
        <span className="pill">{count}</span>
      </header>
      <button type="button" className="secondary" onClick={onAdd}>
        Add Task
      </button>
      <div ref={setNodeRef} className="column-cards">
        {cards.length === 0 ? (
          <p className="empty">{emptyHint}</p>
        ) : (
          cards.map((card) => <TaskCardItem key={card.id} card={card} onEdit={onEdit} onDelete={onDelete} />)
        )}
      </div>
    </section>
  );
}

function TaskCardItem({ card, onEdit, onDelete }: TaskCardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`task-card color-${card.color} ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
      tabIndex={0}
    >
      <h3>{card.title}</h3>
      {card.description && <p>{card.description}</p>}
      <dl>
        <div>
          <dt>Priority</dt>
          <dd>{card.priority}</dd>
        </div>
        {card.projectTag && (
          <div>
            <dt>Tag</dt>
            <dd>{card.projectTag}</dd>
          </div>
        )}
        {card.dueDate && (
          <div>
            <dt>Due</dt>
            <dd>{card.dueDate}</dd>
          </div>
        )}
      </dl>
      <div className="actions">
        <button type="button" onClick={() => onEdit(card)}>
          Edit
        </button>
        <button type="button" onClick={() => onDelete(card.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}
