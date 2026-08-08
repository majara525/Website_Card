import { motion } from 'framer-motion';
import { Check, LockKeyhole } from 'lucide-react';

interface AnimatedCheckmarkProps {
  complete: boolean;
  size?: 'sm' | 'lg';
  celebrate?: boolean;
}

const confetti = [
  ['#ff6b6b', -34, -36, -85], ['#ffd166', 28, -42, 75], ['#06d6a0', -42, 4, -110],
  ['#8b52ff', 40, 2, 100], ['#4cc9f0', -20, 35, -35], ['#f72585', 24, 37, 35],
  ['#ff9f1c', 4, -48, 12], ['#2ec4b6', -6, 48, -10],
] as const;

export default function AnimatedCheckmark({ complete, size = 'sm', celebrate = false }: AnimatedCheckmarkProps) {
  const dimension = size === 'lg' ? 'h-20 w-20' : 'h-11 w-11';
  const iconSize = size === 'lg' ? 34 : 19;

  return (
    <div className={`relative grid ${dimension} shrink-0 place-items-center`} aria-label={complete ? 'مكتمل' : 'غير مكتمل — الاختبار مقفل'}>
      {complete && celebrate && confetti.map(([color, x, y, rotate], index) => (
        <motion.span
          key={index}
          className="confetti-piece"
          style={{ backgroundColor: color }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0 }}
          animate={{ opacity: [1, 1, 0], x, y, rotate, scale: [0, 1, .8] }}
          transition={{ duration: .9, delay: index * .025, ease: 'easeOut' }}
        />
      ))}
      <motion.span
        initial={false}
        animate={complete ? { scale: [0.75, 1.16, 1], rotate: [0, -8, 0] } : { scale: 1 }}
        transition={{ duration: .45, ease: 'easeOut' }}
        className={`grid ${dimension} place-items-center rounded-full border-2 ${complete ? 'border-emerald-400 bg-emerald-500 text-white shadow-[0_8px_24px_rgba(16,185,129,.3)]' : 'border-[rgb(var(--border))] bg-[rgb(var(--surface-soft))] text-[rgb(var(--text-muted))]'}`}
      >
        {complete ? <Check size={iconSize} strokeWidth={3} /> : <LockKeyhole size={iconSize - 2} />}
      </motion.span>
    </div>
  );
}
