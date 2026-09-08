import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-ink-900/30 animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizeClasses[size]} rounded-xl bg-white shadow-modal animate-[slideUp_200ms_ease-out]`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-paper-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-ink-800">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-ink-400 hover:bg-paper-100 hover:text-ink-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
