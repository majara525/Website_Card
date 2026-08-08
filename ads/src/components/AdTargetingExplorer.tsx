import { motion } from 'framer-motion';
import { Globe2, Info, MapPin, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adTargetingProvider } from '../services/AdTargetingProvider';
import type { Ad, TargetingSnapshot } from '../types';

export default function AdTargetingExplorer({ ad }: { ad: Ad }) {
  const [snapshot, setSnapshot] = useState<TargetingSnapshot | null>(null);

  useEffect(() => {
    let active = true;
    adTargetingProvider.getTargeting(ad).then((result) => active && setSnapshot(result));
    return () => { active = false; };
  }, [ad]);

  return (
    <section className="rounded-3xl border border-brand-200 bg-brand-50/80 p-4 dark:border-brand-800 dark:bg-brand-950/45" aria-labelledby="targeting-title">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow"><UsersRound size={21} /></span>
        <div>
          <p className="section-kicker">مستكشف الاستهداف</p>
          <h3 id="targeting-title" className="mt-0.5 text-base font-extrabold">لمن يستهدف هذا الإعلان؟</h3>
        </div>
      </div>

      {!snapshot ? (
        <div className="mt-4 grid grid-cols-2 gap-2"><div className="skeleton h-20 rounded-2xl" /><div className="skeleton h-20 rounded-2xl" /></div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/80 p-3 dark:bg-white/[0.055]">
            <span className="muted-text flex items-center gap-1.5 text-[10px] font-bold"><UsersRound size={13} />العمر والجنس</span>
            <strong className="mt-1.5 block text-sm">{snapshot.ageRange} عامًا</strong>
            <p className="muted-text mt-0.5 text-xs">{snapshot.gender}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-100 dark:bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ delay: .2, duration: .7 }} className="h-full rounded-full bg-gradient-to-l from-brand-500 to-rose-400" /></div>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 dark:bg-white/[0.055]">
            <span className="muted-text flex items-center gap-1.5 text-[10px] font-bold"><MapPin size={13} />المناطق المرجّحة</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {snapshot.locations.map((location) => <span key={location} className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">{location}</span>)}
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-4 flex gap-2 rounded-2xl bg-white/70 p-3 text-[10px] leading-5 text-[rgb(var(--text-muted))] dark:bg-white/[0.045]">
        <Info size={15} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-300" />
        <p><strong className="text-[rgb(var(--text))]">ملاحظة للمتعلّم:</strong> بيانات هذا المثال افتراضية. في الواقع، يُنشر هذا المستوى من تفاصيل الاستهداف علنًا حاليًا للإعلانات المعروضة في الاتحاد الأوروبي أو المملكة المتحدة ضمن متطلبات مستودعات الإعلانات المرتبطة بقانون الخدمات الرقمية، وللإعلانات السياسية أو ذات القضايا الاجتماعية على Meta. خارج ذلك، لا تنشر المنصات تفاصيل استهداف كل إعلان للعامة.</p>
      </div>
      <p className="muted-text mt-2 flex items-center gap-1 text-[9px]"><Globe2 size={11} />المصدر الحالي: محاكاة تعليمية محلية — لا توجد اتصالات خارجية.</p>
    </section>
  );
}
