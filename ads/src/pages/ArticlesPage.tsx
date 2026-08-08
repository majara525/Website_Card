import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenCheck, SearchX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import EmptyState from '../components/EmptyState';
import { ArticlesSkeleton } from '../components/LoadingStates';
import { RewardedArticleGate } from '../components/MonetizationPlaceholders';
import { articleService } from '../services/articleService';
import { useAppStore } from '../store/useAppStore';
import type { Article } from '../types';

const normalize = (value: string) => value.normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g, '').toLowerCase().trim();

export default function ArticlesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [gatedArticle, setGatedArticle] = useState<Article | null>(null);
  const search = useAppStore((state) => state.articleSearch);
  const category = useAppStore((state) => state.articleCategory);
  const tags = useAppStore((state) => state.articleTags);
  const completed = useAppStore((state) => state.completedArticleIds);
  const unlocked = useAppStore((state) => state.unlockedArticleIds);
  const unlock = useAppStore((state) => state.unlockArticle);
  const clearFilters = useAppStore((state) => state.clearArticleFilters);
  const setSearch = useAppStore((state) => state.setArticleSearch);

  const load = useCallback(() => {
    setLoading(true); setError(false);
    articleService.listArticles().then(setArticles).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const query = normalize(search);
    return articles.filter((article) => {
      const matchesSearch = !query || normalize(`${article.title} ${article.excerpt} ${article.tags.join(' ')}`).includes(query);
      const matchesCategory = category === 'الكل' || article.category === category;
      const matchesTags = tags.length === 0 || tags.every((tag) => article.tags.includes(tag));
      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [articles, search, category, tags]);

  const openArticle = (article: Article) => {
    if (article.premium && !unlocked.includes(article.id)) setGatedArticle(article);
    else navigate(`/articles/${article.slug}`);
  };

  if (loading) return <ArticlesSkeleton />;
  if (error) return <div className="page-container"><EmptyState icon={SearchX} title="لم نتمكّن من فتح المكتبة" description="حدث خطأ أثناء قراءة المحتوى المحلي." actionLabel="إعادة المحاولة" onAction={load} /></div>;

  return (
    <div className="page-container space-y-5">
      <section className="relative overflow-hidden rounded-4xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-rose-50 p-5 dark:border-brand-800 dark:from-brand-950/55 dark:via-[rgb(var(--surface))] dark:to-rose-950/25">
        <div className="absolute -left-8 -top-12 h-36 w-36 rounded-full bg-brand-300/20 blur-2xl" />
        <div className="relative flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-brand-600 text-white shadow-glow"><BookOpenCheck size={25} /></span><div><p className="section-kicker">مكتبة شاهد الإعلان</p><h1 className="mt-1 text-xl font-extrabold sm:text-2xl">15 درسًا عمليًا لعقل إعلاني أذكى</h1><p className="muted-text mt-1 text-xs leading-6">اقرأ، طبّق، ثم اجتز ثلاثة أسئلة لتثبيت الإنجاز.</p></div></div>
        <div className="relative mt-4 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-100 dark:bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${(completed.length / 15) * 100}%` }} className="h-full rounded-full bg-gradient-to-l from-brand-600 to-emerald-400" /></div><strong className="text-xs text-brand-700 dark:text-brand-300">{completed.length}/15</strong></div>
      </section>

      <div className="flex items-center justify-between gap-3"><div><h2 className="section-title">كل المقالات</h2><p className="muted-text mt-1 text-[10px]">{filtered.length === 15 ? 'جميع المقالات الخمسة عشر' : `${filtered.length} نتيجة من أصل 15`}</p></div>{(search || category !== 'الكل' || tags.length > 0) && <button type="button" className="text-xs font-bold text-brand-700 dark:text-brand-300" onClick={() => { setSearch(''); clearFilters(); }}>مسح التصفية</button>}</div>

      {filtered.length ? (
        <motion.div layout className="space-y-3">
          <AnimatePresence initial={false}>{filtered.map((article) => <ArticleCard key={article.id} article={article} complete={completed.includes(article.id)} locked={Boolean(article.premium && !unlocked.includes(article.id))} onClick={() => openArticle(article)} />)}</AnimatePresence>
        </motion.div>
      ) : <EmptyState icon={SearchX} title="لا توجد مقالات بهذه المواصفات" description="خفّف عدد الوسوم أو غيّر عبارة البحث، وستظهر لك اقتراحات أكثر." actionLabel="عرض كل المقالات" onAction={() => { setSearch(''); clearFilters(); }} />}

      <AnimatePresence>
        {gatedArticle && (
          <div className="fixed inset-0 z-[85] grid place-items-center p-4">
            <motion.button type="button" aria-label="إغلاق" className="sheet-backdrop absolute inset-0 h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGatedArticle(null)} />
            <div className="relative z-10 w-full max-w-lg"><RewardedArticleGate article={gatedArticle} onCancel={() => setGatedArticle(null)} onUnlocked={() => { unlock(gatedArticle.id); const slug = gatedArticle.slug; setGatedArticle(null); navigate(`/articles/${slug}`); }} /></div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
