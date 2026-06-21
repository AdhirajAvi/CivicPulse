import { Link, NavLink } from 'react-router-dom';
import { BarChart3, MapPinned } from 'lucide-react';
import FloatingReportButton from './FloatingReportButton';

export default function Layout({ children, showFab = true }) {
  const linkClass = ({ isActive }) =>
    `rounded-full px-3 py-2 text-sm font-bold transition ${isActive ? 'bg-teal-civic text-white' : 'text-ink hover:bg-teal-civic/10'}`;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-[900] border-b border-slate-200/80 bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-black text-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-civic text-white">
              <MapPinned className="h-5 w-5" />
            </span>
            <span className="text-lg">CivicPulse</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/admin" className={linkClass}>
              <span className="inline-flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                Admin
              </span>
            </NavLink>
          </nav>
        </div>
      </header>
      {children}
      {showFab && <FloatingReportButton />}
    </div>
  );
}
