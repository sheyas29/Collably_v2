import { useEffect, useRef } from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, itemName }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const modalRef = useRef(null);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (firstElement) {
      firstElement.focus();
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-mist/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Dialog */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="
          relative w-full max-w-sm overflow-hidden rounded-3xl 
          bg-surface p-6 text-left shadow-[var(--shadow-feather-drag)]
        "
      >
        <h3 id="modal-title" className="font-display text-[22px] text-ink tracking-tight mb-2">
          {title}
        </h3>
        
        <p className="font-sans text-[14px] text-ink-soft mb-6 leading-relaxed">
          {message} 
          {itemName && (
            <span className="font-medium text-ink block mt-1">"{itemName}"</span>
          )}
        </p>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-full font-sans text-[13px] font-medium
              text-ink-soft hover:text-ink hover:bg-mist-violet/50
              transition-colors duration-200
            "
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="
              px-5 py-2 rounded-full font-sans text-[13px] font-medium
              bg-rose/80 text-ink hover:bg-rose
              transition-colors duration-200 shadow-sm
            "
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
