import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('AdWatch render error', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main dir="rtl" className="grid min-h-screen place-items-center bg-[rgb(var(--bg))] p-5 text-center text-[rgb(var(--text))]">
        <section className="surface-card w-full max-w-md rounded-4xl p-7">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"><TriangleAlert size={28} /></span>
          <h1 className="mt-5 text-xl font-extrabold">حدث خطأ غير متوقّع</h1>
          <p className="muted-text mt-2 text-sm leading-7">تقدّمك محفوظ على هذا الجهاز. أعد تحميل التطبيق للمتابعة.</p>
          <button type="button" className="primary-button mt-5 w-full" onClick={() => window.location.reload()}><RefreshCw size={18} />إعادة تحميل التطبيق</button>
        </section>
      </main>
    );
  }
}
