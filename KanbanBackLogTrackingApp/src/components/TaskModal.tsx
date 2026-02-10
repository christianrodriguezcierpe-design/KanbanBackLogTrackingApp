import { DESCRIPTION_MAX_LENGTH, PROJECT_TAG_MAX_LENGTH } from '../constants';
import type { CardColor, ColumnId, Priority } from '../types';

interface TaskDraft {
  title: string;
  description: string;
  projectTag: string;
  priority: Priority;
  dueDate: string;
  color: CardColor;
  columnId: ColumnId;
}

interface TaskModalProps {
  isOpen: boolean;
  isEditing: boolean;
  draft: TaskDraft;
  onChange: (draft: TaskDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  titleMax: number;
  priorities: Priority[];
  colors: CardColor[];
}

export function TaskModal({
  isOpen,
  isEditing,
  draft,
  onChange,
  onCancel,
  onSave,
  titleMax,
  priorities,
  colors,
}: TaskModalProps) {
  if (!isOpen) {
    return null;
  }

  const canSave = draft.title.trim().length > 0;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? 'Edit Task' : 'Create Task'}</h2>

        <label>
          Title *
          <input
            maxLength={titleMax}
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            placeholder="Task title"
            autoFocus
          />
        </label>

        <label>
          Description
          <textarea
            maxLength={DESCRIPTION_MAX_LENGTH}
            value={draft.description}
            onChange={(event) => onChange({ ...draft, description: event.target.value })}
            placeholder="Optional details"
          />
        </label>

        <label>
          Project Tag
          <input
            maxLength={PROJECT_TAG_MAX_LENGTH}
            value={draft.projectTag}
            onChange={(event) => onChange({ ...draft, projectTag: event.target.value })}
            placeholder="Optional tag"
          />
        </label>

        <div className="row">
          <label>
            Priority
            <select
              value={draft.priority}
              onChange={(event) => onChange({ ...draft, priority: event.target.value as Priority })}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label>
            Due Date
            <input
              type="date"
              value={draft.dueDate}
              onChange={(event) => onChange({ ...draft, dueDate: event.target.value })}
            />
          </label>
        </div>

        <div className="row">
          <label>
            Column
            <select
              value={draft.columnId}
              onChange={(event) => onChange({ ...draft, columnId: event.target.value as ColumnId })}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </label>

          <label>
            Color
            <select
              value={draft.color}
              onChange={(event) => onChange({ ...draft, color: event.target.value as CardColor })}
            >
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={onSave} disabled={!canSave}>
            {isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
