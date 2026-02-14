import { beforeEach, describe, expect, it } from 'vitest';
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from '../constants';
import { loadBoardState, saveBoardState } from '../utils/storage';

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reload restores board state', () => {
    const state = {
      version: 2 as const,
      cards: [],
      searchQuery: 'abc',
      filterTag: 'tag',
      filterPriority: 'high' as const,
    };

    saveBoardState(state);
    const loaded = loadBoardState();

    expect(loaded.warning).toBeNull();
    expect(loaded.state.searchQuery).toBe('abc');
    expect(loaded.state.filterTag).toBe('tag');
    expect(loaded.state.filterPriority).toBe('high');
  });

  it('migrates v1 payload to v2 key', () => {
    const legacyState = {
      version: 1 as const,
      cards: [
        {
          id: '1',
          title: 'Legacy task',
          priority: 'medium' as const,
          color: 'yellow' as const,
          columnId: 'todo' as const,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      searchQuery: '',
      filterTag: null,
      filterPriority: null,
    };

    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyState));
    const loaded = loadBoardState();

    expect(loaded.warning).toBeNull();
    expect(loaded.state.version).toBe(2);
    expect(loaded.state.cards).toHaveLength(1);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it('corrupt payload triggers safe reset', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json');
    const loaded = loadBoardState();

    expect(loaded.state.version).toBe(2);
    expect(loaded.state.cards).toEqual([]);
    expect(loaded.warning).toMatch(/reset/i);
  });
});
