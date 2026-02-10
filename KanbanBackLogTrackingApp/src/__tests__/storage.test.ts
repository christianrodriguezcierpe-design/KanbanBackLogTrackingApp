import { describe, expect, it } from 'vitest';
import { STORAGE_KEY } from '../constants';
import { loadBoardState, saveBoardState } from '../utils/storage';

describe('storage helpers', () => {
  it('reload restores board state', () => {
    const state = {
      version: 1 as const,
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

  it('corrupt payload triggers safe reset', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json');
    const loaded = loadBoardState();

    expect(loaded.state.cards).toEqual([]);
    expect(loaded.warning).toMatch(/reset/i);
  });
});
