import { CollisionPriority } from '@dnd-kit/abstract';
import { useDroppable } from '@dnd-kit/react';
import { memo, useMemo } from 'react';
import AddCard from './AddCard.jsx';
import Card from './Card.jsx';

const COLUMN_ACCENTS = ['bg-periwinkle', 'bg-rose', 'bg-sage'];

function Column({ column, cards = [], handleDeleteColumn, handleDeleteCard }) {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    collisionPriority: CollisionPriority.Low,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });

  const sortedCards = useMemo(
    () => [...(cards || [])].sort((a, b) => a.position - b.position),
    [cards]
  );

  const dotIndex =
    typeof column.position === 'number'
      ? Math.abs(column.position) % COLUMN_ACCENTS.length
      : 0;

  return (
    <div
      ref={ref}
      className={`
        group/col flex flex-col w-[280px] shrink-0
        max-h-[calc(100vh-140px)]
        rounded-3xl bg-mist-violet/60 p-4
        transition-colors duration-300 ease-out
        ${isDropTarget ? 'bg-mist-violet ring-1 ring-periwinkle/40' : ''}
      `}
    >
      <div className="ds-col-header ds-col-header-v1">
        <div className="ds-col-header-left-v1">
          <span className={`ds-col-dot-v1 ${COLUMN_ACCENTS[dotIndex]}`} />
          <h2 className="ds-col-title-v1">{column.title}</h2>
          <span className="ds-col-count-v1">{sortedCards.length}</span>
        </div>
        <button
          onClick={() => handleDeleteColumn(column.id, column.title)}
          aria-label={`Delete ${column.title} column`}
          className="
            opacity-40 hover:opacity-100 focus:opacity-100
            text-ink-soft hover:text-ink text-xs
            transition-opacity duration-200
          "
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[70vh] px-0.5 scroll-mist min-h-[120px] flex-1">
        {sortedCards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            handleDeleteCard={handleDeleteCard}
            index={index}
          />
        ))}

        {sortedCards.length === 0 && (
          <div className="ds-empty ds-empty-v3-pol-2 flex-1 justify-center items-center py-8">
            <span className="ds-empty-dot-v3-pol-2 mb-3"></span>
            <p className="ds-empty-text-v3-pol-2 mb-4">Nothing here yet</p>
            <div className="w-full">
              <AddCard columnId={column.id} />
            </div>
          </div>
        )}
      </div>

      {sortedCards.length > 0 && (
        <div className="pt-2 sticky bottom-0 bg-mist-violet/95 backdrop-blur-sm shrink-0">
          <AddCard columnId={column.id} />
        </div>
      )}
    </div>
  );
}

export default memo(Column);
