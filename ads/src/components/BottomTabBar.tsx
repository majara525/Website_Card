import { motion } from 'framer-motion';
import { FileText, Home } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/home', label: 'الرئيسية', icon: Home, matches: (path: string) => path === '/home' },
  { to: '/articles', label: 'المقالات', icon: FileText, matches: (path: string) => path.startsWith('/articles') },
];

export default function BottomTabBar() {
  const location = useLocation();

  return (
    <nav className="fixed-app-bar safe-bottom fixed bottom-0 z-50 border-t border-black/5 bg-white/95 px-4 py-2 shadow-[0_-8px_28px_rgba(31,24,67,0.09)] backdrop-blur-xl dark:border-white/5 dark:bg-[#1d192a]/95" aria-label="التنقل الرئيسي">
      <div className="mx-auto grid max-w-sm grid-cols-2 gap-2">
        {tabs.map(({ to, label, icon: Icon, matches }) => (
          <NavLink key={to} to={to} className="relative flex min-h-12 items-center justify-center gap-2 rounded-2xl text-xs font-bold outline-none">
            {({ isActive }) => {
              const active = isActive || matches(location.pathname);
              return (
                <>
                  {active && <motion.span layoutId="active-tab" className="absolute inset-0 rounded-2xl bg-brand-100 dark:bg-brand-900/45" transition={{ type: 'spring', stiffness: 430, damping: 34 }} />}
                  <Icon size={20} className={`relative z-10 ${active ? 'text-brand-700 dark:text-brand-300' : 'muted-text'}`} aria-hidden="true" />
                  <span className={`relative z-10 ${active ? 'text-brand-800 dark:text-brand-200' : 'muted-text'}`}>{label}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
