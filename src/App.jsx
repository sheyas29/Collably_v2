import { useEffect, useMemo, useReducer } from 'react';

import Board from './Board.jsx';
import { STORAGE_KEY } from './constants';
import { BoardContext } from './context/BoardContext';
import { boardReducer, initialState } from './reducer/boardReducer';

function getInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        parsed &&
        Array.isArray(parsed.cards) &&
        Array.isArray(parsed.columns) &&
        parsed.columns.length > 0
      ) {
        // Sanitize cards that may have acquired a 'column-' prefix from earlier drag bugs
        const validColumnIds = new Set(parsed.columns.map((col) => col.id));
        const sanitizedCards = parsed.cards.map((card) => {
          let columnId = card.columnId;
          if (typeof columnId === 'string' && columnId.startsWith('column-')) {
            const stripped = columnId.replace(/^column-/, '');
            if (validColumnIds.has(stripped)) {
              columnId = stripped;
            }
          }
          return { ...card, columnId };
        });

        return {
          ...parsed,
          cards: sanitizedCards,
        };
      }
    }
  } catch (error) {
    console.error(
      'Failed to parse board state from storage, resetting:',
      error
    );
  }
  // Clear legacy/corrupted state if structure mismatch occurs
  localStorage.removeItem(STORAGE_KEY);
  return initialState;
}

function App() {
  const [state, dispatch] = useReducer(
    boardReducer,
    undefined,
    getInitialState
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <BoardContext.Provider value={value}>
      <Board />
    </BoardContext.Provider>
  );
}

export default App;
