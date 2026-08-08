import { motion } from 'framer-motion';
import type { AdCategory } from '../types';

interface CategoryChipProps {
  label: AdCategory;
  emoji: string;
  active: boolean;
  onClick: () => void;
}

export default function CategoryChip({ label, emoji, active, onClick }: CategoryChipProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex min-h-20 items-center gap-3 overflow-hidden rounded-3xl border p-3 text-right transition-colors ${active ? 'border-brand-500 bg-brand-600 text-white shadow-glow' : 'border-[rgb(var(--border))] bg-[rgb(var(--surface))]'}`}
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl ${active ? 'bg-white/16' : 'bg-[rgb(var(--surface-soft))]'}`} aria-hidden="true">{emoji}</span>
      <span>
        <strong className="block text-sm font-extrabold">{label}</strong>
        <span className={`text-[10px] ${active ? 'text-white/75' : 'muted-text'}`}>استكشف الإعلانات</span>
      </span>
      {active && <motion.span layoutId="category-glow" className="absolute -bottom-8 -left-6 h-20 w-20 rounded-full bg-white/15 blur-xl" />}
    </motion.button>
  );
}
