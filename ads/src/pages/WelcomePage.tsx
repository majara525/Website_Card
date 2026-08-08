import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MicrosoftMark() {
  return <span className="grid grid-cols-2 gap-[2px]" aria-hidden="true"><i className="h-2.5 w-2.5 bg-[#f25022]" /><i className="h-2.5 w-2.5 bg-[#7fba00]" /><i className="h-2.5 w-2.5 bg-[#00a4ef]" /><i className="h-2.5 w-2.5 bg-[#ffb900]" /></span>;
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const [clicked, setClicked] = useState(false);
  return (
    <div className="page-container space-y-5">
      <button type="button" className="secondary-button !min-h-10 !px-3" onClick={() => navigate(-1)}><ArrowRight size={17} />رجوع</button>
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-900 via-brand-700 to-fuchsia-500 p-6 text-white shadow-lift">
        <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-white/15 blur-2xl" /><div className="absolute -bottom-16 right-0 h-44 w-44 rounded-full bg-cyan-300/20 blur-2xl" />
        <motion.span initial={{ rotate: -8, scale: .9 }} animate={{ rotate: 0, scale: 1 }} className="relative grid h-16 w-16 place-items-center rounded-3xl bg-white/15"><Sparkles size={29} /></motion.span>
        <h1 className="relative mt-6 text-3xl font-extrabold leading-[1.45]">أهلًا بك في<br />شاهد الإعلان</h1>
        <p className="relative mt-3 max-w-md text-sm leading-7 text-white/75">مساحتك لتشاهد بعين ناقدة، وتفهم لماذا تنجح فكرة بينما تُنسى أخرى.</p>
      </section>
      <section className="surface-card rounded-4xl p-5">
        <h2 className="text-lg font-extrabold">دخول طلبة المعهد</h2><p className="muted-text mt-1 text-xs leading-6">زر توضيحي للتكامل المستقبلي مع حساب Microsoft 365 الخاص بالمعهد.</p>
        <button type="button" onClick={() => setClicked(true)} className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition-transform active:scale-[.98]"><MicrosoftMark />تسجيل الدخول عبر Microsoft 365</button>
        {clicked && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex gap-2 rounded-2xl bg-blue-50 p-3 text-xs leading-6 text-blue-900 dark:bg-blue-500/10 dark:text-blue-200"><CheckCircle2 size={17} className="mt-1 shrink-0" /><p><strong>عرض تجريبي فقط.</strong> لن تُفتح نافذة تسجيل دخول ولن تُرسل أي بيانات في هذه النسخة.</p></motion.div>}
        <div className="mt-5 grid grid-cols-2 gap-2"><div className="soft-card rounded-2xl p-3"><ShieldCheck size={18} className="text-emerald-600" /><strong className="mt-2 block text-xs">دخول مؤسسي آمن</strong><p className="muted-text mt-1 text-[9px] leading-4">مخطط للتنفيذ عبر OAuth على الخادم.</p></div><div className="soft-card rounded-2xl p-3"><BookOpen size={18} className="text-brand-600" /><strong className="mt-2 block text-xs">تقدّم موحّد</strong><p className="muted-text mt-1 text-[9px] leading-4">ربط مستقبلي مع الصفوف والمدرّسين.</p></div></div>
        <button type="button" className="primary-button mt-5 w-full" onClick={() => navigate('/home')}>متابعة كطالب زائر</button>
      </section>
    </div>
  );
}
