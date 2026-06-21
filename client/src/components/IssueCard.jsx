import { Link } from 'react-router-dom';
import { ChevronUp, MapPin } from 'lucide-react';
import { CategoryBadge, StatusBadge } from './Badges';
import { relativeTime } from '../lib/time';

export default function IssueCard({ issue, onUpvote, voted }) {
  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-civic">
      <Link to={`/issue/${issue.id}`} className="block">
        <img src={issue.photoUrl} alt={issue.title} className="h-44 w-full object-cover" loading="lazy" />
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <CategoryBadge category={issue.category} />
          <StatusBadge status={issue.status} />
        </div>
        <Link to={`/issue/${issue.id}`} className="block text-lg font-black leading-6 text-ink hover:text-teal-civic">
          {issue.title}
        </Link>
        <div className="flex items-center gap-1 text-sm text-slate-600">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{issue.address || 'Pinned location'}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <time className="text-xs font-bold uppercase tracking-wide text-slate-500" dateTime={issue.createdAt}>
            {relativeTime(issue.createdAt)}
          </time>
          <button
            type="button"
            onClick={() => onUpvote(issue)}
            className={`focus-ring inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-black transition ${voted ? 'bg-saffron text-ink' : 'bg-teal-civic text-white hover:bg-teal-700'}`}
            aria-pressed={voted}
          >
            <ChevronUp className={`h-4 w-4 ${voted ? 'fill-current' : ''}`} />
            {issue.upvoteCount}
          </button>
        </div>
      </div>
    </article>
  );
}
