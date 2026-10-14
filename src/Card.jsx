import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';
import { useSortable } from '@dnd-kit/react/sortable';
import { memo } from 'react';

const TAG_COLORS = ['bg-rose', 'bg-sage', 'bg-periwinkle'];

function hashTag(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash << 5) - hash + tag.charCodeAt(i);
    hash |= 0; // keep it a 32-bit int
  }
  return Math.abs(hash);
}

function tagColor(tag) {
  return TAG_COLORS[hashTag(tag) % TAG_COLORS.length];
}

function Card({ card, handleDeleteCard, index }) {
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    group: card.columnId,
    plugins: [SortableKeyboardPlugin],
  });

  return (
    <div
      ref={ref}
      className={`group ds-card ds-card-v1 ${isDragging ? 'ds-dragging' : ''}`}
    >
      <div className="absolute left-2 top-[22px] opacity-0 group-hover:opacity-30 transition-opacity flex items-center justify-center text-ink-soft cursor-grab pointer-events-none" aria-hidden="true">
        <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
          <circle cx="3" cy="4" r="1.5" />
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="3" cy="12" r="1.5" />
          <circle cx="7" cy="4" r="1.5" />
          <circle cx="7" cy="8" r="1.5" />
          <circle cx="7" cy="12" r="1.5" />
        </svg>
      </div>
      <h3 title={card.title} className="ds-card-title-v1">
        {card.title}
      </h3>

      {card.tags.length > 0 && (
        <div className="ds-card-tags-v1">
          {card.tags.map((tag) => (
            <span key={tag} className={`ds-card-tag-v1 ${tagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => handleDeleteCard(card.id, card.title)}
        aria-label={`Delete ${card.title}`}
        className="ds-delete-btn-v1"
      >
        ✕
      </button>
    </div>
  );
}

export default memo(Card);
