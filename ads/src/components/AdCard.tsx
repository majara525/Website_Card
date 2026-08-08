import { motion } from 'framer-motion';
import { Eye, Gamepad2, Sparkles } from 'lucide-react';
import type { Ad } from '../types';

interface AdCardProps {
  ad: Ad;
  onClick: (ad: Ad) => void;
  compact?: boolean;
}

const formatViews = (views: number) => new Intl.NumberFormat('ar', { notation: 'compact', maximumFractionDigits: 1 }).format(views);

export default function AdCard({ ad, onClick, compact = false }: AdCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onClick(ad)}
      className={`${compact ? 'min-w-[226px] sm:min-w-[245px]' : 'min-w-[272px] sm:min-w-[300px]'} surface-card group overflow-hidden rounded-3xl text-right ${ad.is_sponsored ? 'ring-2 ring-amber-400/70' : ''}`}
      aria-label={`فتح إعلان ${ad.title} من ${ad.brand}`}
    >
      <div className={`ad-gradient-${ad.category} relative ${compact ? 'h-28' : 'h-36'} overflow-hidden`}>
        <img src={ad.thumbnail_url} alt="" loading="lazy" className="h-full w-full object-cover opacity-65 mix-blend-screen transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">{ad.category}</span>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-slate-800">
          <Eye size={12} />{formatViews(ad.view_count)}
        </span>
        {ad.is_playable && <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-xl bg-emerald-400 text-emerald-950 shadow-lg"><Gamepad2 size={16} /></span>}
      </div>
      <div className="p-4">
        {ad.is_sponsored && <span className="mb-1.5 inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-700 dark:text-amber-300"><Sparkles size={11} />إعلان مموّل</span>}
        <h3 className="line-clamp-1 text-[15px] font-extrabold">{ad.title}</h3>
        <p className="muted-text mt-1 text-xs font-semibold">{ad.brand}</p>
      </div>
    </motion.button>
  );
}
