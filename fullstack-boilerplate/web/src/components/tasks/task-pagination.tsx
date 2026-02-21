'use client';

interface TaskPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function TaskPagination({
  page,
  limit,
  total,
  onPageChange,
}: TaskPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between border-t border-zinc-200 px-2 py-3 dark:border-zinc-700">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Showing <span className="font-medium">{start}</span> to{' '}
        <span className="font-medium">{end}</span> of{' '}
        <span className="font-medium">{total}</span> tasks
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Previous
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (totalPages <= 7) return true;
              if (p === 1 || p === totalPages) return true;
              return Math.abs(p - page) <= 1;
            })
            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                acc.push('...');
              }
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-sm text-zinc-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => onPageChange(item as number)}
                  className={`min-w-[32px] rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                    item === page
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {item}
                </button>
              ),
            )}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Next
        </button>
      </div>
    </div>
  );
}
