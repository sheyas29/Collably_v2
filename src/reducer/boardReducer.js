import { ACTIONS } from '../constants';

const boards = [{ id: 'board-1', title: 'My First Board' }];
const columns = [
  { id: 'col-1', title: 'To Do', boardId: 'board-1', position: 0 },
  { id: 'col-2', title: 'In Progress', boardId: 'board-1', position: 1 },
  { id: 'col-3', title: 'Done', boardId: 'board-1', position: 2 },
];
const cards = [
  {
    id: 'card-1',
    title: 'Design homepage mockup',
    columnId: 'col-1',
    position: 0,
    tags: ['design', 'ui'],
  },
  {
    id: 'card-2',
    title: 'Set up project repo',
    columnId: 'col-1',
    position: 1,
    tags: ['dev', 'setup'],
  },
  {
    id: 'card-3',
    title: 'Implement auth flow',
    columnId: 'col-2',
    position: 0,
    tags: ['dev', 'auth'],
  },
  {
    id: 'card-4',
    title: 'Project kickoff meeting',
    columnId: 'col-3',
    position: 0,
    tags: ['meeting'],
  },
];

export const initialState = {
  boards,
  columns,
  cards,
};

export function boardReducer(state, action) {
  switch (action.type) {
    case ACTIONS.RESTORE_STATE:
      return action.payload;

    case ACTIONS.ADD_CARD:
      return {
        ...state,
        cards: [...state.cards, action.payload],
      };

    case ACTIONS.DELETE_CARD: {
      const cardToDelete = state.cards.find(
        (card) => card.id === action.payload
      );
      if (!cardToDelete) return state;

      const affectedColumnId = cardToDelete.columnId;
      const remainingInColumn = state.cards
        .filter(
          (card) =>
            card.columnId === affectedColumnId && card.id !== action.payload
        )
        .sort((a, b) => a.position - b.position)
        .map((card, index) => ({ ...card, position: index }));

      return {
        ...state,
        cards: [
          ...state.cards.filter((card) => card.columnId !== affectedColumnId),
          ...remainingInColumn,
        ],
      };
    }

    case ACTIONS.ADD_COLUMN:
      return {
        ...state,
        columns: [...state.columns, action.payload],
      };

    case ACTIONS.DELETE_COLUMN:
      return {
        ...state,
        columns: state.columns.filter((column) => column.id !== action.payload),
        cards: state.cards.filter((card) => card.columnId !== action.payload),
      };

    case ACTIONS.MOVE_CARD: {
      const { cardId, newColumnId: rawNewColId, newIndex } = action.payload;
      const newColumnId =
        typeof rawNewColId === 'string'
          ? rawNewColId.replace(/^column-/, '')
          : rawNewColId;

      const movedCard = state.cards.find((card) => card.id === cardId);
      if (!movedCard) return state;

      const oldColumnId = movedCard.columnId;
      const reindex = (cardList) =>
        cardList.map((card, index) => ({ ...card, position: index }));

      if (oldColumnId === newColumnId) {
        const columnCards = state.cards
          .filter((card) => card.columnId === oldColumnId)
          .sort((a, b) => a.position - b.position);

        const withoutMovedCard = columnCards.filter(
          (card) => card.id !== cardId
        );
        const clampedIndex = Math.max(
          0,
          Math.min(newIndex, withoutMovedCard.length)
        );
        withoutMovedCard.splice(clampedIndex, 0, movedCard);

        return {
          ...state,
          cards: [
            ...state.cards.filter((card) => card.columnId !== oldColumnId),
            ...reindex(withoutMovedCard),
          ],
        };
      }

      const oldColumnCards = reindex(
        state.cards
          .filter((card) => card.columnId === oldColumnId && card.id !== cardId)
          .sort((a, b) => a.position - b.position)
      );

      const newColumnCards = state.cards
        .filter((card) => card.columnId === newColumnId && card.id !== cardId)
        .sort((a, b) => a.position - b.position);

      const clampedIndex = Math.max(
        0,
        Math.min(newIndex, newColumnCards.length)
      );
      newColumnCards.splice(clampedIndex, 0, {
        ...movedCard,
        columnId: newColumnId,
      });

      return {
        ...state,
        cards: [
          ...state.cards.filter(
            (card) =>
              card.columnId !== oldColumnId && card.columnId !== newColumnId
          ),
          ...oldColumnCards,
          ...reindex(newColumnCards),
        ],
      };
    }

    default:
      return state;
  }
}
