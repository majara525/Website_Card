import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Flame, Gamepad2, Megaphone, RefreshCw, Sparkles, Target } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AdCard from '../components/AdCard';
import AdDetailModal from '../components/AdDetailModal';
import CategoryChip from '../components/CategoryChip';
import EmptyState from '../components/EmptyState';
import { HomeSkeleton } from '../components/LoadingStates';
import { AdMobPlayableStub, BannerAdSlot, BrandSpotlight } from '../components/MonetizationPlaceholders';
import { AD_CATEGORIES } from '../constants';
import { adService } from '../services/adService';
import { useAppStore } from '../store/useAppStore';
import type { Ad, AdCategory } from '../types';

export default function HomePage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<AdCategory | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const completedCount = useAppStore((state) => state.completedArticleIds.length);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    adService.listAds().then(setAds).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const filtered = useMemo(() => category ? ads.filter((ad) => ad.category === category) : ads, [ads, category]);
  const mostViewed = useMemo(() => [...filtered].sort((a, b) => b.view_count - a.view_count).slice(0, 8), [filtered]);
  const playable = useMemo(() => filtered.filter((ad) => ad.is_playable).slice(0, 7), [filtered]);
  const sponsored = ads.find((ad) => ad.is_sponsored) ?? ads[0];

  if (loading) return <HomeSkeleton />;
  if (error) return <div className="page-container"><EmptyState icon={RefreshCw} title="تعذّر تحميل واجهة الإعلانات" description="البيانات محفوظة محليًا، لكن حدث خطأ غير متوقّع. جرّب مرة أخرى." actionLabel="إعادة المحاولة" onAction={load} /></div>;

  return (
    <div className="page-container space-y-8">
      <motion.section initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-800 via-brand-600 to-fuchsia-500 p-5 text-white shadow-glow sm:p-6">
        <div className="absolute -left-12 -top-16 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-20 right-10 h-44 w-44 rounded-full bg-cyan-300/25 blur-2xl" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/14 px-3 py-1.5 text-[10px] font-bold backdrop-blur"><Sparkles size={12} />مرحبًا بصانع الفكرة</span>
            <h1 className="mt-4 max-w-md text-2xl font-extrabold leading-[1.45] tracking-tight sm:text-3xl">شاهد بعيون الجمهور، وفكّر بعقل المعلن.</h1>
            <p className="mt-2 max-w-md text-xs leading-6 text-white/75">حلّل الإعلان، اكتشف جمهوره، وطوّر أدواتك الإبداعية كل يوم.</p>
          </div>
          <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-3xl bg-white/14 sm:grid"><Megaphone size={26} /></span>
        </div>
        <div className="relative z-10 mt-5 flex items-center gap-3 rounded-2xl bg-black/15 p-3 backdrop-blur-sm">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/14"><BarChart3 size={19} /></div>
          <div className="min-w-0 flex-1"><div className="flex justify-between gap-3 text-[10px] font-bold"><span>تقدّمك في المقالات</span><span>{completedCount} / 15</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20"><motion.div initial={{ width: 0 }} animate={{ width: `${(completedCount / 15) * 100}%` }} className="h-full rounded-full bg-white" /></div></div>
        </div>
      </motion.section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3"><div><p className="section-kicker flex items-center gap-1"><Flame size={13} />رائج اليوم</p><h2 className="section-title mt-1">الأكثر مشاهدة الآن</h2></div><span className="muted-text text-[10px]">اسحب للاستكشاف</span></div>
        {mostViewed.length ? <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6">{mostViewed.map((ad) => <div key={ad.id} className="snap-start"><AdCard ad={ad} onClick={setSelectedAd} /></div>)}</div> : <EmptyState icon={Target} title="لا توجد نتائج في هذا التصنيف" description="جرّب تصنيفًا آخر لتشاهد أفكارًا مختلفة." actionLabel="عرض الكل" onAction={() => setCategory(null)} />}
      </section>

      <section>
        <div className="mb-3"><p className="section-kicker">اختر مجالًا</p><h2 className="section-title mt-1">التصنيفات</h2></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{AD_CATEGORIES.map((item) => <CategoryChip key={item.label} {...item} active={category === item.label} onClick={() => setCategory(category === item.label ? null : item.label)} />)}</div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between"><div><p className="section-kicker flex items-center gap-1"><Gamepad2 size={13} />جرّب اللعبة</p><h2 className="section-title mt-1">إعلانات تفاعلية</h2></div><span className="tag-chip">قابل للتجربة</span></div>
        {playable.length ? <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6">{playable.map((ad) => <div key={ad.id} className="snap-start"><AdCard ad={ad} onClick={setSelectedAd} compact /></div>)}</div> : <EmptyState icon={Gamepad2} title="لا توجد ألعاب هنا بعد" description="اختر تصنيفًا آخر أو عد إلى عرض كل الإعلانات التفاعلية." actionLabel="عرض الكل" onAction={() => setCategory(null)} />}
        <AdMobPlayableStub />
      </section>

      <section id="weekly-ad" className="relative overflow-hidden rounded-4xl border border-brand-300 bg-gradient-to-br from-[#21124b] via-[#4a26a7] to-[#793ee9] p-5 text-white shadow-lift sm:p-6">
        <div className="absolute -left-12 -top-16 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold text-amber-300">اختيار فريق التحرير</p><h2 className="mt-1 text-xl font-extrabold">إعلان الأسبوع</h2></div><span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-300 text-[#32186d]"><Sparkles size={22} /></span></div>
          <div className="mt-5 rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
            <span className="text-[10px] font-bold text-white/65">دارنا · أثاث</span><h3 className="mt-1 text-2xl font-extrabold">غرفة تتغيّر معك</h3><p className="mt-2 text-xs leading-6 text-white/72">إعلان يحوّل الغرفة نفسها عبر مراحل مختلفة من حياة الشخصية، ليبيع المرونة قبل أن يبيع الأثاث.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[['الخطاف','تحوّل بصري في أول ثانيتين'],['الدعوة','صمّم مساحتك الآن'],['الجمهور','شباب وعائلات 25–44'],['لماذا يعمل؟','الفائدة تُرى قبل أن تُشرح']].map(([label,value]) => <div key={label} className="rounded-2xl bg-black/15 p-3"><span className="text-[9px] font-bold text-amber-300">{label}</span><strong className="mt-1 block text-xs">{value}</strong></div>)}
            </div>
            {ads[0] && <button type="button" onClick={() => setSelectedAd(ads[0])} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 text-xs font-extrabold text-brand-800 transition-transform active:scale-95">حلّل الاستهداف <ArrowLeft size={15} /></button>}
          </div>
        </div>
      </section>

      {sponsored && <BrandSpotlight ad={sponsored} onClick={setSelectedAd} />}
      <BannerAdSlot />
      <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
    </div>
  );
}
