import { motion } from 'framer-motion';
import { Clock3, Crown, FileText } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';
import type { Article } from '../types';
import AnimatedCheckmark from './AnimatedCheckmark';

interface ArticleCardProps {
  article: Article;
  complete: boolean;
  locked?: boolean;
  onClick: () => void;
}

export default function ArticleCard({ article, complete, locked, onClick }: ArticleCardProps) {
  return (
    <motion.article whileHover={{ y: -2 }} whileTap={{ scale: .992 }} layout>
      <button type="button" onClick={onClick} className="surface-card group flex w-full items-stretch overflow-hidden rounded-3xl text-right transition-shadow hover:shadow-lift" aria-label={`فتح مقال ${article.title}`}>
        <span className={`w-1.5 shrink-0 ${article.category === 'تاريخ الإعلان' ? 'bg-amber-400' : article.category === 'جذب الانتباه' ? 'bg-rose-400' : article.category === 'القياس والتحليل' ? 'bg-cyan-400' : 'bg-violet-500'}`} />
        <span className="flex min-w-0 flex-1 items-start gap-3 p-4 sm:p-5">
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${CATEGORY_COLORS[article.category]}`}>{article.category}</span>
              <span className="muted-text inline-flex items-center gap-1 text-[10px] font-bold"><Clock3 size={12} />{article.read_time} دقائق</span>
              {article.premium && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[9px] font-extrabold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"><Crown size={11} />مميّز</span>}
            </span>
            <h2 className="mt-3 text-[16px] font-extrabold leading-7 tracking-tight sm:text-lg">{article.title}</h2>
            <p className="muted-text mt-1.5 line-clamp-2 text-[11px] leading-5 sm:text-xs">{article.excerpt}</p>
            <span className="mt-3 flex flex-wrap gap-1.5">{article.tags.slice(0, 4).map((tag) => <span key={tag} className="tag-chip">#{tag}</span>)}</span>
          </span>
          <span className="flex min-h-[7.5rem] flex-col items-center justify-between py-0.5">
            <AnimatedCheckmark complete={complete} />
            <span className="muted-text flex items-center gap-1 text-[9px] font-bold">{locked ? <><Crown size={11} />فتح</> : <><FileText size={11} />اقرأ</>}</span>
          </span>
        </span>
      </button>
    </motion.article>
  );
}
