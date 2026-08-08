import { BarChart3, Bell, Building2, ChevronLeft, Info, Languages, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import Sheet from './Sheet';
import Toggle from './Toggle';

interface SettingsLinkProps {
  icon: typeof Info;
  title: string;
  subtitle: string;
  onClick: () => void;
  badge?: string;
}

function SettingsLink({ icon: Icon, title, subtitle, onClick, badge }: SettingsLinkProps) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl p-3 text-right transition-colors hover:bg-black/[0.035] dark:hover:bg-white/[0.04]">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900/45 dark:text-brand-300"><Icon size={20} /></span>
      <span className="min-w-0 flex-1"><strong className="block text-sm font-bold">{title}</strong><span className="muted-text block text-[11px] leading-5">{subtitle}</span></span>
      {badge && <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-extrabold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">{badge}</span>}
      <ChevronLeft size={17} className="muted-text shrink-0" />
    </button>
  );
}

export default function SettingsSheet() {
  const navigate = useNavigate();
  const open = useAppStore((state) => state.settingsOpen);
  const setOpen = useAppStore((state) => state.setSettingsOpen);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const notifications = useAppStore((state) => state.notificationsEnabled);
  const toggleNotifications = useAppStore((state) => state.toggleNotifications);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Sheet open={open} onClose={() => setOpen(false)} title="الإعدادات" description="خصّص تجربة التعلّم بالطريقة التي تناسبك.">
      <div className="soft-card divide-y divide-[rgb(var(--border))] rounded-3xl px-1">
        <div className="flex items-center gap-3 p-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">{theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}</span>
          <span className="min-w-0 flex-1"><strong className="block text-sm">الوضع الداكن</strong><span className="muted-text text-[11px]">راحة أكبر للعين في الإضاءة المنخفضة</span></span>
          <Toggle checked={theme === 'dark'} onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} label="تبديل الوضع الداكن" />
        </div>
        <div className="flex items-center gap-3 p-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"><Bell size={20} /></span>
          <span className="min-w-0 flex-1"><strong className="block text-sm">التنبيهات</strong><span className="muted-text text-[11px]">تذكيرات تعليمية — نموذج تجريبي</span></span>
          <Toggle checked={notifications} onChange={toggleNotifications} label="تبديل التنبيهات" />
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <SettingsLink icon={BarChart3} title="ربط حساب إعلاني" subtitle="استكشف أداء حملاتك في مكان واحد" badge="قريبًا" onClick={() => go('/campaign-analyzer')} />
        <SettingsLink icon={Building2} title="بوابة المعهد" subtitle="تسجيل الدخول عبر Microsoft 365" onClick={() => go('/welcome')} />
        <SettingsLink icon={Info} title="عن التطبيق" subtitle="الفكرة وبيانات التواصل مع المعهد" onClick={() => go('/about')} />
        <div className="flex items-center gap-3 rounded-2xl p-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><Languages size={20} /></span>
          <span className="min-w-0 flex-1"><strong className="block text-sm">اللغة</strong><span className="muted-text text-[11px]">العربية فقط في الإصدار الأول</span></span>
          <span className="tag-chip">العربية</span>
        </div>
      </div>
      <p className="muted-text mt-5 text-center text-[10px]">الإصدار 1.0.0 · بُني لطلبة كلية الاتصال والعلاقات العامة والإعلان</p>
    </Sheet>
  );
}
