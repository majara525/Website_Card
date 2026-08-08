import { Link } from 'react-router-dom';

export default function FooterBrand() {
  return (
    <footer className="fixed-app-bar fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px))] z-40 flex h-10 items-center justify-center border-t px-4 text-[10px] backdrop-blur-xl" style={{ background: 'rgb(var(--surface) / .93)', borderColor: 'rgb(var(--border))' }}>
      <Link to="/about" className="muted-text flex items-center gap-2 font-semibold transition-colors hover:text-brand-600" aria-label="عن المعهد العالي">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-red-600 to-red-800 text-[9px] font-extrabold text-white">ع</span>
        <span>بالتعاون مع <strong className="text-[rgb(var(--text))]">المعهد العالي</strong></span>
      </Link>
    </footer>
  );
}
