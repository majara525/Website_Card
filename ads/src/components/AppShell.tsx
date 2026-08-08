import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import BottomTabBar from './BottomTabBar';
import FilterSheet from './FilterSheet';
import FooterBrand from './FooterBrand';
import Header from './Header';
import SettingsSheet from './SettingsSheet';

export default function AppShell() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <FooterBrand />
      <BottomTabBar />
      <SettingsSheet />
      <FilterSheet />
    </div>
  );
}
