import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, Filter, Grid2X2, Map, RotateCcw } from 'lucide-react';
import Layout from '../components/Layout';
import CivicMap from '../components/CivicMap';
import IssueCard from '../components/IssueCard';
import EmptyState from '../components/EmptyState';
import { CardSkeletons } from '../components/Skeletons';
import { CATEGORIES, STATUSES } from '../lib/constants';
import { getStats, toggleUpvote } from '../lib/api';
import { votedKey } from '../lib/deviceId';
import { useDeviceId } from '../hooks/useDeviceId';
import { useIssues } from '../hooks/useIssues';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../components/ToastProvider';

function StatCounter({ label, value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / 650);
      setDisplay(Math.round(start + diff * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <div className="rounded-lg bg-white/90 p-4 shadow-sm ring-1 ring-white/40">
      <p className="text-3xl font-black text-ink">{display}</p>
      <p className="text-sm font-bold text-slate-600">{label}</p>
    </div>
  );
}

export default function Home() {
  const deviceId = useDeviceId();
  const { push } = useToast();
  const [view, setView] = useState('map');
  const [filters, setFilters] = useState({ category: '', status: '', sort: 'recent' });
  const [stats, setStats] = useState({ total: 0, resolved: 0, active: 0 });
  const [voted, setVoted] = useState(() => new Set(Object.keys(localStorage).filter((key) => key.startsWith('civicpulse_voted_')).map((key) => key.replace('civicpulse_voted_', ''))));
  const { issues, setIssues, loading, error, reload } = useIssues(filters);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getStats());
    } catch (err) {
      push(err.message, 'error');
    }
  }, [push]);

  useEffect(() => {
    loadStats();
  }, [loadStats, issues.length]);

  useSocket({
    'issue:new': () => {
      push('New issue reported nearby', 'info');
      loadStats();
    },
    'issue:upvoted': loadStats,
    'issue:statusChanged': loadStats
  });

  const handleUpvote = async (issue) => {
    const wasVoted = voted.has(issue.id);
    setVoted((current) => {
      const next = new Set(current);
      wasVoted ? next.delete(issue.id) : next.add(issue.id);
      return next;
    });
    setIssues((current) => current.map((item) => (item.id === issue.id ? { ...item, upvoteCount: item.upvoteCount + (wasVoted ? -1 : 1) } : item)));

    try {
      const result = await toggleUpvote(issue.id, deviceId);
      if (result.voted) localStorage.setItem(votedKey(issue.id), '1');
      else localStorage.removeItem(votedKey(issue.id));
      push(result.voted ? 'Upvote added.' : 'Upvote removed.', 'success');
    } catch (err) {
      push(err.message, 'error');
      reload();
    }
  };

  const filteredIssues = useMemo(() => issues, [issues]);

  return (
    <Layout>
      <main>
        <section className="bg-teal-civic">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 text-white lg:grid-cols-[1fr_520px] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-amber-200">CivicPulse</p>
              <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">Fix Your City. Together.</h1>
              <p className="mt-3 max-w-2xl text-lg text-teal-50">
                Report local infrastructure issues, rally neighbors with upvotes, and watch triage updates move in real time.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCounter label="Total Reported" value={stats.total || 0} />
              <StatCounter label="Resolved" value={stats.resolved || 0} />
              <StatCounter label="Active Now" value={stats.active || 0} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button type="button" onClick={() => setView('map')} className={`focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 font-black ${view === 'map' ? 'bg-teal-civic text-white' : 'text-ink'}`}>
                <Map className="h-4 w-4" />
                Map View
              </button>
              <button type="button" onClick={() => setView('feed')} className={`focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 font-black ${view === 'feed' ? 'bg-teal-civic text-white' : 'text-ink'}`}>
                <Grid2X2 className="h-4 w-4" />
                Feed View
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-4">
              <label className="sr-only" htmlFor="category-filter">Category</label>
              <select id="category-filter" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))} className="focus-ring rounded-lg border border-slate-300 px-3 py-2">
                <option value="">All categories</option>
                {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
              <label className="sr-only" htmlFor="status-filter">Status</label>
              <select id="status-filter" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="focus-ring rounded-lg border border-slate-300 px-3 py-2">
                <option value="">All statuses</option>
                {STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
              <label className="sr-only" htmlFor="sort-filter">Sort</label>
              <select id="sort-filter" value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))} className="focus-ring rounded-lg border border-slate-300 px-3 py-2">
                <option value="recent">Most Recent</option>
                <option value="votes">Most Upvoted</option>
              </select>
              <button type="button" onClick={() => setFilters({ category: '', status: '', sort: 'recent' })} className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 font-black text-ink">
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="mt-5">
            {loading ? (
              <CardSkeletons />
            ) : filteredIssues.length === 0 ? (
              <EmptyState />
            ) : view === 'map' ? (
              <CivicMap issues={filteredIssues} />
            ) : (
              <AnimatePresence>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredIssues.map((issue) => (
                    <motion.div key={issue.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                      <IssueCard issue={issue} onUpvote={handleUpvote} voted={voted.has(issue.id)} />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm font-bold text-slate-600">
            <Filter className="h-4 w-4" />
            Showing {filteredIssues.length} civic reports
            <ChevronUp className="ml-auto h-4 w-4 text-saffron" />
          </div>
        </section>
      </main>
    </Layout>
  );
}
