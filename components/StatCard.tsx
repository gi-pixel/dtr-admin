import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  accent,
  className,
}: {
  label: string
  value: number | string
  icon?: React.ComponentType<{ className?: string }>
  loading?: boolean
  accent?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-card p-5 overflow-hidden transition-colors hover:border-primary/40',
        className
      )}
    >
      {accent && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            {label}
          </p>
          {loading ? (
            <Skeleton className="h-9 w-16 mt-3" />
          ) : (
            <p className="text-3xl font-bold mt-2 tabular-nums tracking-tight">
              {value}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'rounded-xl p-2.5 shrink-0',
              accent
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}