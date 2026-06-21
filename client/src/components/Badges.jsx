import { CATEGORY_META, STATUS_META } from '../lib/constants';

export function CategoryBadge({ category }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.Other;
  const Icon = meta.icon;
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: meta.color }}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{category}</span>
    </span>
  );
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.Reported;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${meta.bg} ${meta.text}`}>{status}</span>;
}
