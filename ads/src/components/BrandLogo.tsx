import { Megaphone } from 'lucide-react';

interface BrandLogoProps {
  compact?: boolean;
}

export default function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5" aria-label="شاهد الإعلان">
      <span className={`${compact ? 'h-9 w-9 rounded-xl' : 'h-11 w-11 rounded-2xl'} grid shrink-0 place-items-center bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-glow`}>
        <Megaphone size={compact ? 18 : 21} strokeWidth={2.4} aria-hidden="true" />
      </span>
      <span className="min-w-0 leading-tight">
        <strong className={`${compact ? 'text-sm' : 'text-base'} block truncate font-extrabold tracking-tight`}>شاهد الإعلان</strong>
        {!compact && <span className="muted-text block truncate text-[10px] font-semibold">نتعلّم من كل فكرة</span>}
      </span>
    </div>
  );
}
