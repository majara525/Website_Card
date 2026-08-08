import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import { ArticleSkeleton, ArticlesSkeleton, HomeSkeleton } from './components/LoadingStates';
import { useAppStore } from './store/useAppStore';

const HomePage = lazy(() => import('./pages/HomePage'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const CampaignAnalyzerStub = lazy(() => import('./components/CampaignAnalyzerStub'));
const InstructorDashboard = lazy(() => import('./components/InstructorDashboard'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ThemeController() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#12101c' : '#6d3df5');
  }, [theme]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeController />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Suspense fallback={<HomeSkeleton />}><HomePage /></Suspense>} />
          <Route path="articles" element={<Suspense fallback={<ArticlesSkeleton />}><ArticlesPage /></Suspense>} />
          <Route path="articles/:articleId" element={<Suspense fallback={<ArticleSkeleton />}><ArticleDetailPage /></Suspense>} />
          <Route path="about" element={<Suspense fallback={<ArticleSkeleton />}><AboutPage /></Suspense>} />
          <Route path="welcome" element={<Suspense fallback={<ArticleSkeleton />}><WelcomePage /></Suspense>} />
          <Route path="campaign-analyzer" element={<Suspense fallback={<ArticleSkeleton />}><CampaignAnalyzerStub /></Suspense>} />
          <Route path="dev/instructor" element={<Suspense fallback={<ArticleSkeleton />}><InstructorDashboard /></Suspense>} />
          <Route path="*" element={<Suspense fallback={<ArticleSkeleton />}><NotFoundPage /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
