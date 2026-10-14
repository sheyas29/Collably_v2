import { useContext, useRef, useState } from 'react';
import { ACTIONS } from './constants';
import { BoardContext } from './context/BoardContext';

export default function AddCard({ columnId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const { state, dispatch } = useContext(BoardContext);
  const formRef = useRef(null);

  function collapse() {
    setIsExpanded(false);
    setTitle('');
    setTags('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const newCard = {
      id: crypto.randomUUID(),
      title: title.trim(),
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      position: state.cards.filter((card) => card.columnId === columnId).length,
      columnId,
    };

    dispatch({ type: ACTIONS.ADD_CARD, payload: newCard });
    collapse();
  }

  function handleBlur(e) {
    if (formRef.current && !formRef.current.contains(e.relatedTarget)) {
      collapse();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      collapse();
    }
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full text-left px-3 py-2 rounded-xl font-sans text-[13px] text-ink-soft hover:bg-mist-violet hover:text-ink transition-colors duration-200"
      >
        + Add a card
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-2 p-3 rounded-2xl bg-surface shadow-[var(--shadow-feather)]"
    >
      <label className="sr-only" htmlFor={`cardTitle-${columnId}`}>
        Card title
      </label>
      <input
        autoFocus
        type="text"
        id={`cardTitle-${columnId}`}
        placeholder="Card title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="font-display text-[15px] text-ink bg-transparent outline-none placeholder:text-ink-soft/50"
      />

      <label className="sr-only" htmlFor={`cardTags-${columnId}`}>
        Tags, comma separated
      </label>
      <input
        type="text"
        id={`cardTags-${columnId}`}
        placeholder="Tags, comma separated"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="font-sans text-[12px] text-ink-soft bg-transparent outline-none placeholder:text-ink-soft/50"
      />

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          className="font-sans text-[12px] font-medium bg-periwinkle/50 text-ink px-3 py-1.5 rounded-full hover:bg-periwinkle/70 transition-colors duration-200"
        >
          Add card
        </button>
        <button
          type="button"
          onClick={collapse}
          className="font-sans text-[12px] text-ink-soft hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
