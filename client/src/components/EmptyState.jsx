import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No issues found', body = 'Try changing the filters or report a new issue nearby.' }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <Inbox className="mb-3 h-10 w-10 text-teal-civic" />
      <h3 className="text-lg font-black text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-600">{body}</p>
    </div>
  );
}
