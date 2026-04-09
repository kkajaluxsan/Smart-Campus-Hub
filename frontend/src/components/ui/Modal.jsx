import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../theme/tokens';
import Button from './Button';

export default function Modal({ open, title, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={cx(
          'relative z-10 w-full max-w-lg rounded-2xl border border-slate-200/60 bg-white shadow-2xl',
          'max-h-[90vh] overflow-y-auto animate-slide-up'
        )}
      >
        <div className="flex items-start justify-between border-b border-slate-100/80 px-6 py-5">
          <h2 id="modal-title" className="text-xl font-display font-bold text-slate-900">
            {title}
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="border-t border-slate-100/80 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
