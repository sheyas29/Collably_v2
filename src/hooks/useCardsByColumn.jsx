import { useMemo, useRef } from 'react';

const EMPTY = [];

function areCardListsEqual(oldList, newList) {
  if (oldList === newList) return true;
  if (oldList.length !== newList.length) return false;
  for (let i = 0; i < oldList.length; i++) {
    if (oldList[i] !== newList[i]) return false;
  }
  return true;
}

/**
 * Derives a stable, memoized mapping of cards grouped by column.
 * Reuses previous array references for columns whose card list
 * hasn't actually changed, so downstream React.memo comparisons
 * can skip re-renders.
 */
export default function useCardsByColumn(columns = [], cards = []) {
  const prevMapRef = useRef(new Map());

  return useMemo(() => {
    const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

    const newMap = new Map();
    for (const column of sortedColumns) {
      newMap.set(column.id, EMPTY);
    }

    for (const card of cards) {
      // Normalize columnId in case of legacy 'column-' prefix
      const targetColId =
        typeof card.columnId === 'string' && card.columnId.startsWith('column-')
          ? card.columnId.replace(/^column-/, '')
          : card.columnId;

      const list = newMap.get(targetColId);

      // Skip orphaned cards whose columnId is invalid or deleted
      if (list === undefined) continue;

      if (list === EMPTY) {
        newMap.set(targetColId, [card]);
      } else {
        list.push(card);
      }
    }

    for (const [, list] of newMap.entries()) {
      if (list !== EMPTY) {
        list.sort((a, b) => a.position - b.position);
      }
    }

    /* eslint-disable react-hooks/refs -- Intentional: reading previous render's
       map for structural sharing. This is a read-only cache, not a reactive
       subscription. Safe per React docs on useRef for "previous value" pattern. */
    const prevMap = prevMapRef.current;
    for (const [colId, newList] of newMap) {
      const oldList = prevMap.get(colId);
      if (oldList && areCardListsEqual(oldList, newList)) {
        newMap.set(colId, oldList);
      }
    }

    prevMapRef.current = newMap;
    /* eslint-enable react-hooks/refs */

    return { sortedColumns, cardsByColumn: newMap };
  }, [columns, cards]);
}
