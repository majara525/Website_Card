import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, CheckCircle2, CircleDollarSign, Eye, Link2, MousePointerClick, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignAnalyticsProvider } from '../services/CampaignAnalyticsProvider';

export default function CampaignAnalyzerStub() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const connect = async () => {
    await campaignAnalyticsProvider.connect('meta');
    setMessage('هذه الميزة قيد التطوير — لن يُطلب منك تسجيل الدخول في النسخة الحالية.');
  };

  return (
    <div className="page-container space-y-5">
      <button type="button" className="secondary-button !min-h-10 !px-3" onClick={() => navigate(-1)}><ArrowRight size={17} />رجوع</button>
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-[#172554] via-[#1d4ed8] to-[#06b6d4] p-6 text-white shadow-lift">
        <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
        <span className="relative inline-flex rounded-full bg-amber-300 px-3 py-1.5 text-[10px] font-extrabold text-amber-950">قريبًا</span>
        <div className="relative mt-5 grid h-16 w-16 place-items-center rounded-3xl bg-white/15 backdrop-blur"><BarChart3 size={30} /></div>
        <h1 className="relative mt-5 text-2xl font-extrabold">محلّل الحملات</h1>
        <p className="relative mt-2 max-w-lg text-sm leading-7 text-white/78">اربط حسابك الإعلاني التعليمي مستقبلًا، وافهم النتائج بلغة بسيطة: ماذا دفعنا؟ ماذا كسبنا؟ وأين يمكن أن نتحسّن؟</p>
      </section>

      <section className="surface-card rounded-4xl p-5">
        <h2 className="text-lg font-extrabold">كيف ستعمل التجربة؟</h2>
        <div className="mt-4 space-y-3">
          {[[Link2,'ربط آمن للقراءة فقط','لن يستطيع التطبيق تعديل حملاتك أو نشر إعلانات.'],[Eye,'لوحة موحّدة','مشاهدات ونقرات وتكلفة وتحويلات في بطاقات واضحة.'],[CheckCircle2,'تفسير تعليمي','ملاحظات تساعدك على تحويل الرقم إلى قرار قابل للتنفيذ.']].map(([Icon,title,description]) => {
            const ItemIcon = Icon as typeof Link2;
            return <div key={title as string} className="soft-card flex gap-3 rounded-2xl p-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"><ItemIcon size={18} /></span><div><strong className="text-sm">{title as string}</strong><p className="muted-text mt-0.5 text-[11px] leading-5">{description as string}</p></div></div>;
          })}
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2">
        {[[MousePointerClick,'نسبة النقر'],[CircleDollarSign,'التكلفة'],[ShieldCheck,'قراءة فقط']].map(([Icon,label]) => { const MetricIcon = Icon as typeof Link2; return <div key={label as string} className="surface-card rounded-2xl p-3 text-center"><MetricIcon size={20} className="mx-auto text-brand-600 dark:text-brand-300" /><strong className="mt-2 block text-[11px]">{label as string}</strong></div>; })}
      </div>

      <button type="button" className="primary-button w-full" onClick={connect}><Link2 size={18} />ربط حساب إعلاني</button>
      {message && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-amber-50 p-3 text-center text-xs leading-6 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">{message}</motion.p>}
      <p className="muted-text text-center text-[10px] leading-5">لا توجد اتصالات حقيقية بـ Meta أو Google Ads في هذا الإصدار. الواجهة وحدود الخدمة جاهزة للربط المستقبلي الآمن عبر خادم.</p>
    </div>
  );
}
