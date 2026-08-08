import { Check, RotateCcw } from 'lucide-react';
import { ARTICLE_CATEGORIES, ARTICLE_TAGS } from '../constants';
import { useAppStore } from '../store/useAppStore';
import Sheet from './Sheet';

export default function FilterSheet() {
  const open = useAppStore((state) => state.filtersOpen);
  const setOpen = useAppStore((state) => state.setFiltersOpen);
  const category = useAppStore((state) => state.articleCategory);
  const tags = useAppStore((state) => state.articleTags);
  const setCategory = useAppStore((state) => state.setArticleCategory);
  const toggleTag = useAppStore((state) => state.toggleArticleTag);
  const clear = useAppStore((state) => state.clearArticleFilters);

  return (
    <Sheet open={open} onClose={() => setOpen(false)} title="تصفية المقالات" description="اختر مجالًا أو أكثر من الوسوم للوصول إلى المحتوى المناسب.">
      <div>
        <h3 className="mb-3 text-sm font-extrabold">التصنيف</h3>
        <div className="flex flex-wrap gap-2">
          {ARTICLE_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-xs font-bold transition-colors ${category === item ? 'border-brand-500 bg-brand-600 text-white' : 'border-[rgb(var(--border))] bg-[rgb(var(--surface-soft))] text-[rgb(var(--text-muted))]'}`}
            >
              {category === item && <Check size={14} />}{item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-extrabold">الوسوم</h3>
        <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto py-1">
          {ARTICLE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`tag-chip transition-colors ${tags.includes(tag) ? '!border-brand-500 !bg-brand-100 !text-brand-800 dark:!bg-brand-900/50 dark:!text-brand-200' : ''}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" className="secondary-button" onClick={clear}><RotateCcw size={16} />إعادة ضبط</button>
        <button type="button" className="primary-button" onClick={() => setOpen(false)}>عرض النتائج</button>
      </div>
    </Sheet>
  );
}
