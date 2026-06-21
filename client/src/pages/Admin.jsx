import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, Loader2, Lock, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { CategoryBadge, StatusBadge } from '../components/Badges';
import { TableSkeleton } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import { getStats, updateIssueStatus } from '../lib/api';
import { STATUSES } from '../lib/constants';
import { relativeTime } from '../lib/time';
import { useIssues } from '../hooks/useIssues';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../components/ToastProvider';

const passcode = import.meta.env.VITE_ADMIN_PASSCODE || 'civicpulse2026';

function Gate({ onUnlock }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (value === passcode) {
      // Phase 1 speed bump only: this is not real security and must be replaced with auth in Phase 2.
      sessionStorage.setItem('civicpulse_admin_unlocked', '1');
      onUnlock();
    } else {
      setError('Passcode did not match.');
    }
  };

  return (
    <Layout showFab={false}>
      <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
        <form onSubmit={submit} className="w-full rounded-lg bg-white p-6 shadow-civic ring-1 ring-slate-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-civic text-white">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-ink">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Enter the demo passcode to triage reports for the hackathon walkthrough.</p>
          <label className="mt-5 block">
            <span className="text-sm font-black text-ink">Passcode</span>
            <input type="password" value={value} onChange={(event) => setValue(event.target.value)} className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" autoFocus />
          </label>
          {error && <p className="mt-2 text-sm font-bold text-red-600">{error}</p>}
          <button type="submit" className="focus-ring mt-5 w-full rounded-full bg-saffron px-4 py-3 font-black text-ink">
            Unlock
          </button>
        </form>
      </main>
    </Layout>
  );
}

export default function Admin() {
  const { push } = useToast();
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('civicpulse_admin_unlocked') === '1');
  const [stats, setStats] = useState({ total: 0, reported: 0, inProgress: 0, resolved: 0, totalUpvotes: 0 });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState({ key: 'score', direction: 'desc' });
  const { issues, setIssues, loading, error } = useIssues({ sort: 'votes' });

  const loadStats = useCallback(async () => {
    try {
      setStats(await getStats());
    } catch (err) {
      push(err.message, 'error');
    }
  }, [push]);

  useEffect(() => {
    if (unlocked) loadStats();
  }, [unlocked, loadStats, issues.length]);

  useSocket({
    'issue:new': loadStats,
    'issue:upvoted': loadStats,
    'issue:statusChanged': loadStats
  });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = issues.filter((issue) => {
      const matchesStatus = !statusFilter || issue.status === statusFilter;
      const matchesSearch = !needle || issue.title.toLowerCase().includes(needle) || (issue.address || '').toLowerCase().includes(needle);
      return matchesStatus && matchesSearch;
    });

    const direction = sort.direction === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
      if (sort.key === 'title') return a.title.localeCompare(b.title) * direction;
      if (sort.key === 'status') return a.status.localeCompare(b.status) * direction;
      if (sort.key === 'time') return (new Date(a.createdAt) - new Date(b.createdAt)) * direction;
      return ((a.upvoteCount * 1000 + new Date(a.createdAt).getTime() / 100000000) - (b.upvoteCount * 1000 + new Date(b.createdAt).getTime() / 100000000)) * direction;
    });
  }, [issues, query, statusFilter, sort]);

  const changeStatus = async (issue, status) => {
    const previous = issue.status;
    setIssues((current) => current.map((item) => (item.id === issue.id ? { ...item, status } : item)));
    try {
      await updateIssueStatus(issue.id, status);
      push('Status updated across connected clients.', 'success');
      loadStats();
    } catch (err) {
      setIssues((current) => current.map((item) => (item.id === issue.id ? { ...item, status: previous } : item)));
      push(err.message, 'error');
    }
  };

  const toggleSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;

  return (
    <Layout showFab={false}>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-saffron">CivicPulse Admin</p>
            <h1 className="text-3xl font-black text-ink">Triage Dashboard</h1>
          </div>
          <button type="button" onClick={() => { sessionStorage.removeItem('civicpulse_admin_unlocked'); setUnlocked(false); }} className="focus-ring rounded-full bg-slate-100 px-4 py-2 font-black text-ink">
            Lock Admin
          </button>
        </div>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['Total Issues', stats.total],
            ['Reported', stats.reported],
            ['In Progress', stats.inProgress],
            ['Resolved', stats.resolved],
            ['Total Engagement', stats.totalUpvotes]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-3xl font-black text-ink">{value || 0}</p>
              <p className="text-sm font-bold text-slate-600">{label}</p>
            </div>
          ))}
        </section>

        <section className="mt-5 rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="focus-ring w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3" placeholder="Search title or locality" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="focus-ring rounded-lg border border-slate-300 px-3 py-2">
              <option value="">All statuses</option>
              {STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        </section>

        {error && <div className="mt-4 rounded-lg bg-red-50 p-4 font-bold text-red-700">{error}</div>}

        <section className="mt-5">
          {loading ? (
            <TableSkeleton />
          ) : visible.length === 0 ? (
            <EmptyState title="No triage rows match" body="Clear the search or status filter to see more issues." />
          ) : (
            <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Photo</th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => toggleSort('title')} className="inline-flex items-center gap-1 font-black">
                        Title <ArrowDownUp className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Locality</th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => toggleSort('score')} className="inline-flex items-center gap-1 font-black">
                        Upvotes <ArrowDownUp className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => toggleSort('status')} className="inline-flex items-center gap-1 font-black">
                        Status <ArrowDownUp className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => toggleSort('time')} className="inline-flex items-center gap-1 font-black">
                        Reported <ArrowDownUp className="h-3.5 w-3.5" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {visible.map((issue) => (
                    <tr key={issue.id} className="align-middle">
                      <td className="px-4 py-3">
                        <img src={issue.photoUrl} alt={issue.title} className="h-14 w-20 rounded-md object-cover" />
                      </td>
                      <td className="max-w-xs px-4 py-3 font-black text-ink">{issue.title}</td>
                      <td className="px-4 py-3"><CategoryBadge category={issue.category} /></td>
                      <td className="px-4 py-3 text-slate-600">{issue.address || 'Pinned location'}</td>
                      <td className="px-4 py-3 font-black">{issue.upvoteCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={issue.status} />
                          <select value={issue.status} onChange={(event) => changeStatus(issue, event.target.value)} className="focus-ring rounded-lg border border-slate-300 px-2 py-1">
                            {STATUSES.map((status) => <option key={status}>{status}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{relativeTime(issue.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}
