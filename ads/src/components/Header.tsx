import { AnimatePresence, motion } from 'framer-motion';
import { MoreVertical, Search, SlidersHorizontal, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import BrandLogo from './BrandLogo';

export default function Header() {
  const location = useLocation();
  const isArticlesList = location.pathname === '/articles';
  const articleSearch = useAppStore((state) => state.articleSearch);
  const setArticleSearch = useAppStore((state) => state.setArticleSearch);
  const setSettingsOpen = useAppStore((state) => state.setSettingsOpen);
  const setFiltersOpen = useAppStore((state) => state.setFiltersOpen);
  const activeFilterCount = useAppStore((state) => (state.articleCategory === 'الكل' ? 0 : 1) + state.articleTags.length);

  return (
    <header className="glass-header sticky top-0 z-40 border-b px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <BrandLogo />
        <button type="button" className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="فتح الإعدادات">
          <MoreVertical size={21} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {isArticlesList && (
          <motion.div
            className="mt-3 flex items-center gap-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <label className="surface-card flex min-h-12 flex-1 items-center gap-2 rounded-2xl px-3.5">
              <Search size={18} className="muted-text shrink-0" aria-hidden="true" />
              <span className="sr-only">البحث عن مقال</span>
              <input
                type="search"
                value={articleSearch}
                onChange={(event) => setArticleSearch(event.target.value)}
                placeholder="ابحث عن مقال..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              {articleSearch && (
                <button type="button" onClick={() => setArticleSearch('')} className="grid h-7 w-7 place-items-center rounded-lg" aria-label="مسح البحث">
                  <X size={15} />
                </button>
              )}
            </label>
            <button type="button" className="icon-button relative" onClick={() => setFiltersOpen(true)} aria-label="تصفية المقالات">
              <SlidersHorizontal size={19} />
              {activeFilterCount > 0 && <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{activeFilterCount}</span>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
