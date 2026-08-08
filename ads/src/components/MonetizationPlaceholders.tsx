import { motion } from 'framer-motion';
import { BadgeInfo, LockKeyhole, PlayCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { Ad, Article } from '../types';
import AdCard from './AdCard';

export function BannerAdSlot() {
  // TODO(AdMob): Replace this educational placeholder with a policy-compliant responsive Banner Ad unit.
  return (
    <div className="rounded-2xl border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface-soft))] px-4 py-3 text-center" aria-label="موضع إعلان تجريبي">
      <p className="muted-text text-[9px] font-bold">مساحة إعلان بانر تجريبية</p>
    </div>
  );
}

export function BrandSpotlight({ ad, onClick }: { ad: Ad; onClick: (ad: Ad) => void }) {
  return (
    <section className="overflow-hidden rounded-4xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-500/45 dark:from-amber-500/10 dark:to-orange-500/5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div><span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 dark:text-amber-300"><Sparkles size={13} />إعلان مموّل</span><h2 className="mt-0.5 text-base font-extrabold">علامة تحت الضوء</h2></div>
        <span className="rounded-full border border-amber-300 px-2 py-1 text-[9px] font-bold text-amber-800 dark:border-amber-500/40 dark:text-amber-300">واجهة العلامة</span>
      </div>
      <AdCard ad={ad} onClick={onClick} compact />
    </section>
  );
}

interface RewardedArticleGateProps {
  article: Article;
  onUnlocked: () => void;
  onCancel: () => void;
}

export function RewardedArticleGate({ article, onUnlocked, onCancel }: RewardedArticleGateProps) {
  const [watching, setWatching] = useState(false);

  const simulateReward = () => {
    setWatching(true);
    window.setTimeout(onUnlocked, 1300);
  };

  /*
   * AdMob policy guardrail for future Rewarded Ads:
   * Never offer cash, cryptocurrency, gift cards, or any transferable reward.
   * Only non-transferable in-app benefits (such as unlocked content or badges) are allowed,
   * and the reward terms must be disclosed before playback begins.
   */
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="surface-card rounded-4xl p-5 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300"><LockKeyhole size={28} /></span>
      <p className="section-kicker mt-4">محتوى مميّز تجريبي</p>
      <h3 className="mt-1 text-lg font-extrabold">{article.title}</h3>
      <p className="muted-text mt-2 text-xs leading-6">شاهد وحدة المكافأة التجريبية لفتح المقال. المكافأة هي فتح هذا المحتوى داخل التطبيق فقط ولا قيمة مالية لها.</p>
      {watching ? (
        <div className="mt-5 rounded-2xl bg-brand-50 p-4 dark:bg-brand-950/40"><div className="mx-auto h-2 max-w-xs overflow-hidden rounded-full bg-brand-100 dark:bg-white/10"><motion.div className="h-full bg-brand-600" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.2 }} /></div><p className="muted-text mt-2 text-[10px]">محاكاة مشاهدة الإعلان…</p></div>
      ) : (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button type="button" className="primary-button" onClick={simulateReward}><PlayCircle size={18} />فتح بالمكافأة التجريبية</button>
          <button type="button" className="secondary-button" onClick={onCancel}>ليس الآن</button>
        </div>
      )}
      <p className="muted-text mt-3 flex items-center justify-center gap-1 text-[9px]"><BadgeInfo size={11} />لا يتم تشغيل إعلان حقيقي في هذه النسخة.</p>
    </motion.div>
  );
}

export function AdMobPlayableStub() {
  // TODO(AdMob Playable): Mount the real playable-ad creative/webview here after native Capacitor integration.
  return null;
}
