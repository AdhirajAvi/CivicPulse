import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronUp, Clock, Copy, Loader2, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import CivicMap from '../components/CivicMap';
import { CategoryBadge, StatusBadge } from '../components/Badges';
import { getIssue, toggleUpvote } from '../lib/api';
import { STATUSES } from '../lib/constants';
import { absoluteTime, relativeTime } from '../lib/time';
import { useDeviceId } from '../hooks/useDeviceId';
import { useSocket } from '../hooks/useSocket';
import { votedKey } from '../lib/deviceId';
import { useToast } from '../components/ToastProvider';

export default function IssueDetail() {
  const { id } = useParams();
  const deviceId = useDeviceId();
  const { push } = useToast();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voted, setVoted] = useState(() => localStorage.getItem(votedKey(id)) === '1');
  const [savingVote, setSavingVote] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getIssue(id)
      .then((data) => {
        if (!ignore) setIssue(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  useSocket({
    'issue:upvoted': ({ id: changedId, upvoteCount }) => {
      if (changedId === id) setIssue((current) => (current ? { ...current, upvoteCount } : current));
    },
    'issue:statusChanged': ({ id: changedId, status }) => {
      if (changedId === id) setIssue((current) => (current ? { ...current, status } : current));
    }
  });

  const vote = async () => {
    if (!issue || savingVote) return;
    setSavingVote(true);
    const wasVoted = voted;
    setVoted(!wasVoted);
    setIssue((current) => ({ ...current, upvoteCount: current.upvoteCount + (wasVoted ? -1 : 1) }));
    try {
      const result = await toggleUpvote(issue.id, deviceId);
      setVoted(result.voted);
      if (result.voted) localStorage.setItem(votedKey(issue.id), '1');
      else localStorage.removeItem(votedKey(issue.id));
      push(result.voted ? 'Upvote added.' : 'Upvote removed.', 'success');
    } catch (err) {
      setVoted(wasVoted);
      setIssue((current) => ({ ...current, upvoteCount: current.upvoteCount + (wasVoted ? 1 : -1) }));
      push(err.message, 'error');
    } finally {
      setSavingVote(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    push('Share link copied.', 'success');
  };

  if (loading) {
    return (
      <Layout>
        <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-civic" />
        </main>
      </Layout>
    );
  }

  if (error || !issue) {
    return (
      <Layout>
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-lg bg-red-50 p-4 font-bold text-red-700">{error || 'Issue not found.'}</div>
        </main>
      </Layout>
    );
  }

  const statusIndex = STATUSES.indexOf(issue.status);

  return (
    <Layout>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-5">
          <img src={issue.photoUrl} alt={issue.title} className="max-h-[560px] w-full rounded-lg object-cover shadow-sm ring-1 ring-slate-200" />
          <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap gap-2">
              <CategoryBadge category={issue.category} />
              <StatusBadge status={issue.status} />
            </div>
            <h1 className="mt-4 text-3xl font-black leading-tight text-ink">{issue.title}</h1>
            <p className="mt-3 whitespace-pre-wrap text-slate-700">{issue.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-bold text-slate-600">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {issue.address || 'Pinned location'}
              </span>
              <time title={absoluteTime(issue.createdAt)} dateTime={issue.createdAt} className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {relativeTime(issue.createdAt)}
              </time>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <button
              type="button"
              onClick={vote}
              disabled={savingVote}
              className={`focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-lg font-black ${voted ? 'bg-saffron text-ink' : 'bg-teal-civic text-white hover:bg-teal-700'}`}
              aria-pressed={voted}
            >
              {savingVote ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChevronUp className={`h-5 w-5 ${voted ? 'fill-current' : ''}`} />}
              {issue.upvoteCount} upvotes
            </button>
            <button type="button" onClick={copyLink} className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-100 px-5 py-3 font-black text-ink hover:bg-slate-200">
              <Copy className="h-4 w-4" />
              Copy Link
            </button>
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-black text-ink">Status</h2>
            <div className="mt-4 space-y-4">
              {STATUSES.map((status, index) => (
                <div key={status} className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${index <= statusIndex ? 'bg-teal-civic text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {index + 1}
                  </span>
                  <span className={`font-black ${index <= statusIndex ? 'text-ink' : 'text-slate-500'}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>

          <CivicMap issues={[issue]} height="min-h-[300px]" />
        </aside>
      </main>
    </Layout>
  );
}
