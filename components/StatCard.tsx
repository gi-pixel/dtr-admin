import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  className,
}: {
  label: string
  value: number | string
  icon?: React.ComponentType<{ className?: string }>
  loading?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-5 flex items-start justify-between gap-4',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="h-8 w-16 mt-2" />
        ) : (
          <p className="text-3xl font-bold mt-1 tabular-nums">{value}</p>
        )}
      </div>
      {Icon && (
        <div className="rounded-md bg-muted p-2 shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}