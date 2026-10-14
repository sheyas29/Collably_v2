import { useContext, useRef, useState } from 'react';
import { ACTIONS } from './constants';
import { BoardContext } from './context/BoardContext';

export default function AddColumn({ boardId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const { state, dispatch } = useContext(BoardContext);
  const formRef = useRef(null);

  function collapse() {
    setIsExpanded(false);
    setTitle('');
  }

  function submitHandler(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const newColumn = {
      boardId,
      id: crypto.randomUUID(),
      title: title.trim(),
      position: state.columns.length,
    };
    dispatch({ type: ACTIONS.ADD_COLUMN, payload: newColumn });
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
        className="w-[280px] shrink-0 text-left px-3 py-2.5 rounded-3xl border border-dashed border-ink/10 font-sans text-[13px] text-ink-soft hover:bg-mist-violet hover:text-ink hover:border-ink/20 transition-colors duration-200"
      >
        + Add a column
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={submitHandler}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-[280px] shrink-0 flex flex-col gap-2 p-3 rounded-3xl bg-surface shadow-[var(--shadow-feather)]"
    >
      <label className="sr-only" htmlFor="columnTitle">
        Column title
      </label>
      <input
        autoFocus
        type="text"
        id="columnTitle"
        placeholder="Column title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="font-display text-[15px] text-ink bg-transparent outline-none placeholder:text-ink-soft/50"
      />

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          className="font-sans text-[12px] font-medium bg-periwinkle/50 text-ink px-3 py-1.5 rounded-full hover:bg-periwinkle/70 transition-colors duration-200"
        >
          Add column
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
