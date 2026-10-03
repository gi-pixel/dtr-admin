import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

type Stat = {
  label: string
  value: number | string
  icon?: React.ComponentType<{ className?: string }>
  accent?: boolean
}

export default function StatBoard({
  stats,
  loading,
  className,
}: {
  stats: Stat[]
  loading?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-card overflow-hidden',
        className
      )}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="relative p-5 sm:p-6 transition-colors hover:bg-muted/40"
            >
              {stat.accent && (
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  {loading ? (
                    <Skeleton className="h-8 w-14 mt-2.5" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-bold mt-1.5 tabular-nums tracking-tight">
                      {stat.value}
                    </p>
                  )}
                </div>
                {Icon && (
                  <div
                    className={cn(
                      'shrink-0 rounded-lg p-2',
                      stat.accent
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}