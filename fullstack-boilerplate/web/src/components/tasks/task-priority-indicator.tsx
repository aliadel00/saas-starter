'use client';

const PRIORITY_CONFIG: Record<
  number,
  { label: string; color: string; filled: number }
> = {
  1: { label: 'Lowest', color: 'text-zinc-400 dark:text-zinc-500', filled: 1 },
  2: { label: 'Low', color: 'text-blue-500 dark:text-blue-400', filled: 2 },
  3: { label: 'Medium', color: 'text-yellow-500 dark:text-yellow-400', filled: 3 },
  4: { label: 'High', color: 'text-orange-500 dark:text-orange-400', filled: 4 },
  5: { label: 'Critical', color: 'text-red-500 dark:text-red-400', filled: 5 },
};

export function TaskPriorityIndicator({ priority }: { priority: number }) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG[3];

  return (
    <div className="flex items-center gap-1.5" title={`Priority: ${config.label}`}>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`h-2 w-1.5 rounded-sm ${
              i < config.filled
                ? config.color.includes('zinc')
                  ? 'bg-zinc-400 dark:bg-zinc-500'
                  : config.color.includes('blue')
                    ? 'bg-blue-500 dark:bg-blue-400'
                    : config.color.includes('yellow')
                      ? 'bg-yellow-500 dark:bg-yellow-400'
                      : config.color.includes('orange')
                        ? 'bg-orange-500 dark:bg-orange-400'
                        : 'bg-red-500 dark:bg-red-400'
                : 'bg-zinc-200 dark:bg-zinc-700'
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}
