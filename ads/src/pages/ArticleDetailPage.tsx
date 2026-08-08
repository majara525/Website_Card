import { ArrowRight, Clock3, Share2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import AnimatedCheckmark from '../components/AnimatedCheckmark';
import ArticleQuiz from '../components/ArticleQuiz';
import EmptyState from '../components/EmptyState';
import { ArticleSkeleton } from '../components/LoadingStates';
import { CATEGORY_COLORS } from '../constants';
import { articleService } from '../services/articleService';
import { useAppStore } from '../store/useAppStore';
import type { Article } from '../types';

export default function ArticleDetailPage() {
  const { articleId = '' } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const completed = useAppStore((state) => article ? state.completedArticleIds.includes(article.id) : false);

  const load = useCallback(() => {
    setLoading(true); setNotFound(false);
    articleService.getArticle(articleId).then((result) => { if (result) setArticle(result); else setNotFound(true); }).catch(() => setNotFound(true)).finally(() => setLoading(false));
  }, [articleId]);
  useEffect(load, [load]);

  const share = async () => {
    const data = { title: article?.title ?? 'شاهد الإعلان', text: article?.excerpt ?? '', url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  };

  if (loading) return <ArticleSkeleton />;
  if (notFound || !article) return <div className="page-container"><EmptyState icon={ArrowRight} title="المقال غير موجود" description="قد يكون الرابط قديمًا أو كُتب بطريقة غير صحيحة." actionLabel="العودة إلى المقالات" onAction={() => navigate('/articles')} /></div>;

  return (
    <div className="page-container">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button type="button" onClick={() => navigate('/articles')} className="secondary-button !min-h-10 !px-3"><ArrowRight size={17} />المقالات</button>
        <button type="button" onClick={share} className="icon-button" aria-label="مشاركة المقال"><Share2 size={18} /></button>
      </div>
      <article>
        <header className="surface-card relative overflow-hidden rounded-4xl p-5 sm:p-7">
          <div className={`absolute right-0 top-0 h-full w-1.5 ${article.category === 'تاريخ الإعلان' ? 'bg-amber-400' : article.category === 'جذب الانتباه' ? 'bg-rose-400' : article.category === 'القياس والتحليل' ? 'bg-cyan-400' : 'bg-violet-500'}`} />
          <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-brand-300/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="min-w-0 flex-1"><span className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-extrabold ${CATEGORY_COLORS[article.category]}`}>{article.category}</span><h1 className="mt-4 text-2xl font-extrabold leading-[1.55] tracking-tight sm:text-3xl">{article.title}</h1><p className="muted-text mt-3 text-sm leading-7">{article.excerpt}</p></div>
            <AnimatedCheckmark complete={completed} />
          </div>
          <div className="relative mt-5 flex flex-wrap items-center gap-2"><span className="muted-text inline-flex items-center gap-1 text-xs font-bold"><Clock3 size={14} />{article.read_time} دقائق قراءة</span>{article.tags.map((tag) => <span key={tag} className="tag-chip">#{tag}</span>)}</div>
        </header>

        <div className="surface-card mt-4 rounded-4xl px-5 py-6 sm:px-8 sm:py-9"><ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown-body">{article.body}</ReactMarkdown></div>
        <ArticleQuiz articleId={article.id} questions={article.questions} />
      </article>
    </div>
  );
}
