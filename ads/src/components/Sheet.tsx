import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export default function Sheet({ open, onClose, title, description, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center" role="presentation">
          <motion.button
            type="button"
            aria-label="إغلاق النافذة"
            className="sheet-backdrop absolute inset-0 h-full w-full border-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            className="sheet-panel safe-bottom relative z-10 max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] border px-4 pb-5 pt-3 sm:px-6"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-black/10 dark:bg-white/15" />
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="sheet-title" className="text-xl font-extrabold">{title}</h2>
                {description && <p className="muted-text mt-1 text-xs leading-6">{description}</p>}
              </div>
              <button type="button" className="icon-button" onClick={onClose} aria-label="إغلاق">
                <X size={19} />
              </button>
            </div>
            {children}
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}
