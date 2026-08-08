import { ArrowRight, ExternalLink, Facebook, Globe2, GraduationCap, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

const contacts = [
  { icon: Phone, label: 'الهاتف', value: '04-6000645', href: 'tel:046000645' },
  { icon: Mail, label: 'البريد الإلكتروني', value: 'info@almahad-alali.com', href: 'mailto:info@almahad-alali.com' },
  { icon: Globe2, label: 'الموقع', value: 'almahad-alali.com', href: 'https://almahad-alali.com' },
  { icon: Instagram, label: 'إنستغرام', value: '@almahad_alali', href: 'https://instagram.com/almahad_alali' },
  { icon: Facebook, label: 'فيسبوك', value: '/AlmahadAlaali', href: 'https://facebook.com/AlmahadAlaali' },
];

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="page-container space-y-5">
      <button type="button" className="secondary-button !min-h-10 !px-3" onClick={() => navigate(-1)}><ArrowRight size={17} />رجوع</button>
      <section className="surface-card relative overflow-hidden rounded-4xl p-6 text-center">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-brand-100/80 to-transparent dark:from-brand-900/35" />
        <div className="relative mx-auto w-fit"><BrandLogo /></div>
        <p className="section-kicker relative mt-6">الإصدار الأول</p>
        <h1 className="relative mt-1 text-2xl font-extrabold">تعلّم الإعلان بالمشاهدة والتجربة</h1>
        <p className="muted-text relative mx-auto mt-3 max-w-lg text-sm leading-7">«شاهد الإعلان» أداة تعليمية لطلبة كلية الاتصال والعلاقات العامة والإعلان، تجمع تحليل الأفكار، فهم الاستهداف، والقراءة العملية في تجربة عربية واحدة.</p>
      </section>
      <section className="rounded-4xl bg-gradient-to-br from-red-800 to-red-600 p-5 text-white shadow-lift">
        <div className="flex items-start gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15"><GraduationCap size={24} /></span><div><p className="text-[10px] font-bold text-white/65">الشريك الأكاديمي</p><h2 className="mt-1 text-xl font-extrabold">المعهد العالي</h2><p className="mt-1 text-xs leading-6 text-white/75">الحرم الرئيسي في الناصرة و12 فرعًا في مناطق الجليل والمثلث والنقب والقدس.</p></div></div>
      </section>
      <section className="surface-card rounded-4xl p-4">
        <div className="mb-3 flex items-center gap-2"><MapPin size={18} className="text-red-600" /><h2 className="text-lg font-extrabold">تواصل مع المعهد</h2></div>
        <div className="divide-y divide-[rgb(var(--border))]">
          {contacts.map(({ icon: Icon, label, value, href }) => <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex min-h-16 items-center gap-3 py-2"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"><Icon size={18} /></span><span className="min-w-0 flex-1"><span className="muted-text block text-[9px] font-bold">{label}</span><strong dir="ltr" className="mt-0.5 block truncate text-right text-xs">{value}</strong></span><ExternalLink size={14} className="muted-text" /></a>)}
        </div>
      </section>
      <p className="muted-text px-4 text-center text-[10px] leading-5">هذه النسخة التعليمية تستخدم بيانات إعلانية افتراضية ولا تمثّل استهدافًا حقيقيًا لأي علامة تجارية.</p>
    </div>
  );
}
