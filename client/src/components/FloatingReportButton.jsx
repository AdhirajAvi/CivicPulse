import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function FloatingReportButton() {
  const location = useLocation();
  return (
    <Link
      to="/report"
      state={{ background: location.pathname === '/report' ? '/' : location }}
      className="focus-ring fixed bottom-4 right-4 z-[950] inline-flex min-h-14 items-center gap-2 rounded-full bg-saffron px-5 py-3 font-black text-ink shadow-civic transition hover:-translate-y-0.5 hover:bg-amber-400 sm:bottom-6 sm:right-6"
      aria-label="Report issue"
    >
      <Plus className="h-5 w-5" />
      <span>Report Issue</span>
    </Link>
  );
}
