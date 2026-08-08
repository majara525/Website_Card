import { ArrowRight, BookOpenCheck, GraduationCap, Search, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StudentProgress } from '../types';

const students: StudentProgress[] = [
  { id: 's1', name: 'ليان منصور', avatarInitials: 'ل م', completedArticles: 13, totalArticles: 15, averageQuizScore: 94 },
  { id: 's2', name: 'آدم خطيب', avatarInitials: 'آ خ', completedArticles: 11, totalArticles: 15, averageQuizScore: 88 },
  { id: 's3', name: 'سارة زعبي', avatarInitials: 'س ز', completedArticles: 9, totalArticles: 15, averageQuizScore: 91 },
  { id: 's4', name: 'كريم أبو أحمد', avatarInitials: 'ك أ', completedArticles: 7, totalArticles: 15, averageQuizScore: 79 },
  { id: 's5', name: 'نور عيسى', avatarInitials: 'ن ع', completedArticles: 5, totalArticles: 15, averageQuizScore: 84 },
  { id: 's6', name: 'رامي حجازي', avatarInitials: 'ر ح', completedArticles: 3, totalArticles: 15, averageQuizScore: 72 },
];

export default function InstructorDashboard() {
  const navigate = useNavigate();
  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between gap-3"><button type="button" className="secondary-button !min-h-10 !px-3" onClick={() => navigate('/home')}><ArrowRight size={17} />العودة للتطبيق</button><span className="tag-chip">مسار تطوير مخفي</span></div>
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-800 p-6 text-white shadow-lift">
        <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold text-cyan-300">لوحة المدرّس · نموذج للعرض فقط</p><h1 className="mt-2 text-2xl font-extrabold">مساق الإعلان الرقمي</h1><p className="mt-1 text-xs text-white/65">الفوج الصيفي 2026 · 6 طلاب في العرض التجريبي</p></div><span className="grid h-14 w-14 place-items-center rounded-3xl bg-white/12"><GraduationCap size={26} /></span></div>
      </section>
      <div className="grid grid-cols-3 gap-2">
        {[[Users,'6','الطلاب'],[BookOpenCheck,'48','إنجازًا'],[TrendingUp,'85%','متوسط الاختبار']].map(([Icon,value,label]) => { const StatIcon = Icon as typeof Users; return <div key={label as string} className="surface-card rounded-2xl p-3 text-center"><StatIcon size={18} className="mx-auto text-brand-600 dark:text-brand-300" /><strong className="mt-1.5 block text-lg">{value as string}</strong><span className="muted-text text-[9px]">{label as string}</span></div>; })}
      </div>
      <label className="surface-card flex min-h-12 items-center gap-2 rounded-2xl px-4"><Search size={17} className="muted-text" /><span className="sr-only">البحث عن طالب</span><input type="search" placeholder="ابحث عن طالب..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" readOnly /></label>
      <section className="space-y-3">
        <div><h2 className="section-title">تقدّم الصف</h2><p className="muted-text mt-1 text-[10px]">بيانات توضيحية ثابتة، وليست مرتبطة بحسابات حقيقية.</p></div>
        {students.map((student) => {
          const progress = Math.round((student.completedArticles / student.totalArticles) * 100);
          return (
            <article key={student.id} className="surface-card rounded-3xl p-4">
              <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-xs font-extrabold text-white">{student.avatarInitials}</span><div className="min-w-0 flex-1"><h3 className="text-sm font-extrabold">{student.name}</h3><p className="muted-text mt-0.5 text-[10px]">متوسط الاختبارات: {student.averageQuizScore}%</p></div><strong className="text-sm text-brand-700 dark:text-brand-300">{student.completedArticles}/{student.totalArticles}</strong></div>
              <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3"><div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--surface-soft))]"><div className="h-full rounded-full bg-gradient-to-l from-brand-600 to-emerald-400" style={{ width: `${progress}%` }} /></div><span className="muted-text text-[9px] font-bold">{progress}%</span></div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
