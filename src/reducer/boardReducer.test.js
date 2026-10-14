import { describe, expect, it } from 'vitest';
import { ACTIONS } from '../constants';
import { boardReducer } from './boardReducer';

describe('boardReducer', () => {
  const sampleState = {
    boards: [{ id: 'board-1', title: 'Test Board' }],
    columns: [
      { id: 'col-1', title: 'To Do', boardId: 'board-1', position: 0 },
      { id: 'col-2', title: 'Done', boardId: 'board-1', position: 1 },
    ],
    cards: [
      {
        id: 'card-1',
        title: 'Task 1',
        columnId: 'col-1',
        position: 0,
        tags: ['dev'],
      },
      {
        id: 'card-2',
        title: 'Task 2',
        columnId: 'col-1',
        position: 1,
        tags: ['design'],
      },
      {
        id: 'card-3',
        title: 'Task 3',
        columnId: 'col-2',
        position: 0,
        tags: ['qa'],
      },
    ],
  };

  describe('ADD_CARD', () => {
    it('appends a new card to state without mutating existing cards', () => {
      const newCard = {
        id: 'card-4',
        title: 'Task 4',
        columnId: 'col-1',
        position: 2,
        tags: [],
      };

      const result = boardReducer(sampleState, {
        type: ACTIONS.ADD_CARD,
        payload: newCard,
      });

      expect(result.cards).toHaveLength(4);
      expect(result.cards).toContainEqual(newCard);
      expect(result.cards[0]).toBe(sampleState.cards[0]);
    });
  });

  describe('DELETE_CARD', () => {
    it('removes the specified card and reindexes remaining positions in that column', () => {
      const result = boardReducer(sampleState, {
        type: ACTIONS.DELETE_CARD,
        payload: 'card-1',
      });

      expect(result.cards.find((c) => c.id === 'card-1')).toBeUndefined();

      const col1Cards = result.cards.filter((c) => c.columnId === 'col-1');
      expect(col1Cards).toHaveLength(1);
      expect(col1Cards[0].id).toBe('card-2');
      expect(col1Cards[0].position).toBe(0);
    });

    it('returns original state if target card ID does not exist', () => {
      const result = boardReducer(sampleState, {
        type: ACTIONS.DELETE_CARD,
        payload: 'non-existent-id',
      });

      expect(result).toBe(sampleState);
    });
  });

  describe('ADD_COLUMN', () => {
    it('adds a new column to the board', () => {
      const newColumn = {
        id: 'col-3',
        title: 'In Review',
        boardId: 'board-1',
        position: 2,
      };

      const result = boardReducer(sampleState, {
        type: ACTIONS.ADD_COLUMN,
        payload: newColumn,
      });

      expect(result.columns).toHaveLength(3);
      expect(result.columns).toContainEqual(newColumn);
    });
  });

  describe('DELETE_COLUMN', () => {
    it('deletes column and cascades deletion to all associated cards', () => {
      const result = boardReducer(sampleState, {
        type: ACTIONS.DELETE_COLUMN,
        payload: 'col-1',
      });

      expect(result.columns.find((col) => col.id === 'col-1')).toBeUndefined();
      expect(result.cards.some((card) => card.columnId === 'col-1')).toBe(
        false
      );
      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].id).toBe('card-3');
    });
  });

  describe('MOVE_CARD', () => {
    it('reorders cards within the same column and updates position indices', () => {
      const result = boardReducer(sampleState, {
        type: ACTIONS.MOVE_CARD,
        payload: {
          cardId: 'card-1',
          newColumnId: 'col-1',
          newIndex: 1,
        },
      });

      const col1Cards = result.cards
        .filter((c) => c.columnId === 'col-1')
        .sort((a, b) => a.position - b.position);

      expect(col1Cards[0].id).toBe('card-2');
      expect(col1Cards[0].position).toBe(0);
      expect(col1Cards[1].id).toBe('card-1');
      expect(col1Cards[1].position).toBe(1);
    });

    it('moves a card to a different column and reindexes both columns', () => {
      const result = boardReducer(sampleState, {
        type: ACTIONS.MOVE_CARD,
        payload: {
          cardId: 'card-1',
          newColumnId: 'col-2',
          newIndex: 0,
        },
      });

      const oldColCards = result.cards.filter((c) => c.columnId === 'col-1');
      const newColCards = result.cards
        .filter((c) => c.columnId === 'col-2')
        .sort((a, b) => a.position - b.position);

      expect(oldColCards).toHaveLength(1);
      expect(oldColCards[0].position).toBe(0);

      expect(newColCards).toHaveLength(2);
      expect(newColCards[0].id).toBe('card-1');
      expect(newColCards[0].columnId).toBe('col-2');
      expect(newColCards[0].position).toBe(0);
      expect(newColCards[1].id).toBe('card-3');
      expect(newColCards[1].position).toBe(1);
    });

    it('clamps newIndex if target index is out of bounds', () => {
      const result = boardReducer(sampleState, {
        type: ACTIONS.MOVE_CARD,
        payload: {
          cardId: 'card-1',
          newColumnId: 'col-2',
          newIndex: 999,
        },
      });

      const newColCards = result.cards
        .filter((c) => c.columnId === 'col-2')
        .sort((a, b) => a.position - b.position);

      expect(newColCards[newColCards.length - 1].id).toBe('card-1');
      expect(newColCards[1].position).toBe(1);
    });

    it('moves a card into an empty column and sets position to 0', () => {
      // Add empty column col-empty to state
      const stateWithEmptyCol = {
        ...sampleState,
        columns: [
          ...sampleState.columns,
          { id: 'col-empty', title: 'Empty', boardId: 'board-1', position: 2 },
        ],
      };

      const result = boardReducer(stateWithEmptyCol, {
        type: ACTIONS.MOVE_CARD,
        payload: {
          cardId: 'card-1',
          newColumnId: 'col-empty',
          newIndex: 0,
        },
      });

      const emptyColCards = result.cards.filter((c) => c.columnId === 'col-empty');
      expect(emptyColCards).toHaveLength(1);
      expect(emptyColCards[0].id).toBe('card-1');
      expect(emptyColCards[0].columnId).toBe('col-empty');
      expect(emptyColCards[0].position).toBe(0);

      const oldColCards = result.cards.filter((c) => c.columnId === 'col-1');
      expect(oldColCards).toHaveLength(1);
      expect(oldColCards[0].id).toBe('card-2');
      expect(oldColCards[0].position).toBe(0);
    });

    it('normalizes newColumnId if it has a "column-" prefix', () => {
      const result = boardReducer(sampleState, {
        type: ACTIONS.MOVE_CARD,
        payload: {
          cardId: 'card-1',
          newColumnId: 'column-col-2',
          newIndex: 0,
        },
      });

      const moved = result.cards.find((c) => c.id === 'card-1');
      expect(moved).toBeDefined();
      expect(moved.columnId).toBe('col-2');
    });
  });

  describe('RESTORE_STATE', () => {
    it('replaces full state with provided payload', () => {
      const restoredState = {
        boards: [],
        columns: [],
        cards: [],
      };

      const result = boardReducer(sampleState, {
        type: ACTIONS.RESTORE_STATE,
        payload: restoredState,
      });

      expect(result).toBe(restoredState);
    });
  });
});
