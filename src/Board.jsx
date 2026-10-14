import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { useCallback, useState } from 'react';
import AddColumn from './AddColumn.jsx';
import Column from './Column.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import { ACTIONS } from './constants';
import { useBoard } from './context/BoardContext';
import useCardsByColumn from './hooks/useCardsByColumn.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Board() {
  const { state, dispatch } = useBoard();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { sortedColumns, cardsByColumn } = useCardsByColumn(
    state.columns,
    state.cards
  );

  const deleteCardHandler = useCallback((cardId, cardTitle) => {
    setDeleteTarget({ type: 'card', id: cardId, title: cardTitle });
  }, []);

  const deleteColumnHandler = useCallback((columnId, columnTitle) => {
    setDeleteTarget({ type: 'column', id: columnId, title: columnTitle });
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'card') {
      dispatch({ type: ACTIONS.DELETE_CARD, payload: deleteTarget.id });
    } else if (deleteTarget.type === 'column') {
      dispatch({ type: ACTIONS.DELETE_COLUMN, payload: deleteTarget.id });
    }

    setDeleteTarget(null);
  }, [deleteTarget, dispatch]);

  const handleDragEnd = useCallback(
    (event) => {
      if (event.canceled) return;
      const { source, target } = event.operation;

      if (!isSortable(source)) return;
      if (!target) return;

      const cardId = source.id;
      let newColumnId;
      let newIndex;

      if (isSortable(target)) {
        newColumnId = target.group;
        newIndex = target.index;
      } else {
        // Dropped on a column droppable
        newColumnId =
          target.data?.columnId ||
          String(target.id).replace(/^column-/, '');
        const targetCards = cardsByColumn.get(newColumnId) || [];
        newIndex = targetCards.length;
      }

      // Ensure target column is valid
      const targetColumnExists = state.columns.some(
        (col) => col.id === newColumnId
      );
      if (!targetColumnExists) return;

      if (
        source.initialGroup === newColumnId &&
        source.initialIndex === newIndex
      ) {
        return;
      }

      dispatch({
        type: ACTIONS.MOVE_CARD,
        payload: { cardId, newColumnId, newIndex },
      });
    },
    [cardsByColumn, dispatch, state.columns]
  );

  return (
    <div className="min-h-screen bg-aurora">
      <header className="px-8 pt-8 pb-6 flex items-center justify-between max-w-[1400px] mx-auto">
        <h1 className="font-display text-[28px] text-ink tracking-tight">
          {state.boards[0]?.title}
        </h1>
        <ThemeToggle />
      </header>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="flex gap-6 px-8 pb-10 overflow-x-auto items-start max-w-[1400px] mx-auto">
          {sortedColumns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={cardsByColumn.get(column.id)}
              handleDeleteCard={deleteCardHandler}
              handleDeleteColumn={deleteColumnHandler}
            />
          ))}
          <AddColumn boardId={state.boards[0]?.id} />
        </div>
      </DragDropProvider>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={deleteTarget?.type === 'column' ? 'Delete Column' : 'Delete Card'}
        message={
          deleteTarget?.type === 'column'
            ? 'Are you sure you want to delete this column? All cards in this column will be permanently removed.'
            : 'Are you sure you want to delete this card? This action cannot be undone.'
        }
        itemName={deleteTarget?.title}
      />
    </div>
  );
}
