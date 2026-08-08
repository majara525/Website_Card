import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Lightbulb, Play, X } from 'lucide-react';
import { useEffect } from 'react';
import type { Ad } from '../types';
import AdTargetingExplorer from './AdTargetingExplorer';

interface AdDetailModalProps {
  ad: Ad | null;
  onClose: () => void;
}

export default function AdDetailModal({ ad, onClose }: AdDetailModalProps) {
  useEffect(() => {
    if (!ad) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [ad, onClose]);

  return (
    <AnimatePresence>
      {ad && (
        <div className="fixed inset-0 z-[85] grid items-end justify-items-center sm:items-center" role="presentation">
          <motion.button type="button" aria-label="إغلاق تفاصيل الإعلان" className="sheet-backdrop absolute inset-0 h-full w-full" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ad-modal-title"
            initial={{ opacity: 0, y: 36, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: .98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="sheet-panel relative z-10 max-h-[91vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] border sm:mx-4 sm:rounded-[2rem]"
          >
            <div className={`ad-gradient-${ad.category} relative h-52 overflow-hidden sm:h-64`}>
              <img src={ad.thumbnail_url} alt="" className="h-full w-full object-cover opacity-70 mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/10" />
              <button type="button" className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-2xl bg-black/45 text-white backdrop-blur-md" onClick={onClose} aria-label="إغلاق"><X size={20} /></button>
              {ad.is_playable && <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-1.5 text-[10px] font-extrabold text-emerald-950"><Play size={13} fill="currentColor" />قابل للتجربة</span>}
              <div className="absolute inset-x-5 bottom-5 text-white">
                <span className="text-xs font-bold text-white/75">{ad.brand} · {ad.category}</span>
                <h2 id="ad-modal-title" className="mt-1 text-2xl font-extrabold sm:text-3xl">{ad.title}</h2>
              </div>
            </div>
            <div className="space-y-4 p-4 pb-8 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="soft-card rounded-2xl p-3"><span className="muted-text flex items-center gap-1 text-[10px]"><Eye size={13} />المشاهدات</span><strong className="mt-1 block text-lg">{new Intl.NumberFormat('ar').format(ad.view_count)}</strong></div>
                <div className="soft-card rounded-2xl p-3"><span className="muted-text flex items-center gap-1 text-[10px]"><Lightbulb size={13} />نوع الفكرة</span><strong className="mt-1 block text-sm">{ad.is_playable ? 'تجربة تفاعلية' : 'محتوى مرئي'}</strong></div>
              </div>
              {ad.creative_note && <div className="surface-card rounded-2xl p-4"><p className="section-kicker">لماذا يلفت الانتباه؟</p><p className="mt-1 text-sm leading-7">{ad.creative_note}</p></div>}
              <AdTargetingExplorer ad={ad} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
