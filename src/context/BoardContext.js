import { createContext, useContext } from 'react';

export const BoardContext = createContext(null);

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardContext.Provider');
  }
  return context;
}
