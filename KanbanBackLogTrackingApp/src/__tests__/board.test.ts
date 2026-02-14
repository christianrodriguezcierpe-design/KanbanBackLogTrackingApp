import { describe, expect, it } from 'vitest';
import { createTask, editTask, getBacklogPromotionMissingFields, getVisibleCards, moveTask } from '../utils/board';
import type { TaskCard } from '../types';

function sampleCards(): TaskCard[] {
  return [
    {
      id: '1',
      title: 'Task 1',
      description: 'alpha',
      projectTag: 'app',
      priority: 'low',
      color: 'yellow',
      columnId: 'backlog',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'beta',
      projectTag: 'infra',
      priority: 'high',
      color: 'blue',
      columnId: 'todo',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
}

describe('board helpers', () => {
  it('creates a task with default metadata values', () => {
    const now = '2026-01-02T10:00:00.000Z';
    const card = createTask(
      {
        title: '  Learn DnD  ',
        priority: 'medium',
        color: 'green',
        columnId: 'backlog',
      },
      now,
      'uuid-1',
    );

    expect(card.title).toBe('Learn DnD');
    expect(card.createdAt).toBe(now);
    expect(card.updatedAt).toBe(now);
    expect(card.id).toBe('uuid-1');
  });

  it('editing updates updatedAt', () => {
    const base = sampleCards()[0];
    const updated = editTask(base, { title: 'Updated title' }, '2026-01-03T00:00:00.000Z');

    expect(updated.title).toBe('Updated title');
    expect(updated.updatedAt).toBe('2026-01-03T00:00:00.000Z');
  });

  it('moving changes column and order', () => {
    const cards = sampleCards();
    const moved = moveTask(cards, '1', 'done', 0, '2026-01-03T00:00:00.000Z');

    expect(moved[1].id).toBe('1');
    expect(moved[1].columnId).toBe('done');
  });

  it('search and filter returns expected subset', () => {
    const cards = sampleCards();
    const visible = getVisibleCards(cards, {
      searchQuery: 'task',
      filterTag: 'app',
      filterPriority: 'low',
    });

    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('1');
  });

  it('backlog triage helper reports missing fields', () => {
    const missing = getBacklogPromotionMissingFields({
      ...sampleCards()[0],
      title: '  ',
      projectTag: '  ',
    });

    expect(missing).toEqual(['title', 'project tag']);
  });

  it('backlog triage helper passes complete tasks', () => {
    const missing = getBacklogPromotionMissingFields(sampleCards()[0]);
    expect(missing).toEqual([]);
  });
});
