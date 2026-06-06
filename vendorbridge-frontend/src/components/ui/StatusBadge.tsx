
export interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const norm = status.toLowerCase();

  let colorClasses = 'bg-gray-500/10 text-gray-400 border-white/5';

  if (
    norm === 'active' ||
    norm === 'approved' ||
    norm === 'completed' ||
    norm === 'published' ||
    norm === 'awarded'
  ) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (
    norm === 'pending' ||
    norm === 'sent' ||
    norm === 'acknowledged' ||
    norm === 'generated'
  ) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (
    norm === 'blocked' ||
    norm === 'overdue' ||
    norm === 'rejected'
  ) {
    colorClasses = 'bg-red-500/10 text-red-400 border-red-500/20';
  } else if (
    norm === 'draft' ||
    norm === 'closed'
  ) {
    colorClasses = 'bg-gray-500/10 text-gray-400 border-white/5';
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${colorClasses}`}>
      {status}
    </span>
  );
}
