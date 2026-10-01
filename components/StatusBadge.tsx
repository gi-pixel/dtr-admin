import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Status = 'draft' | 'published' | 'expired'

const styles: Record<Status, string> = {
  published:
    'bg-emerald-100 text-emerald-900 border-emerald-200 hover:bg-emerald-100',
  draft: 'bg-[#E6D9C8] text-[#6B5B4A] border-[#E6D9C8] hover:bg-[#E6D9C8]',
  expired:
    'bg-red-100 text-red-900 border-red-200 hover:bg-red-100',
}

const labels: Record<Status, string> = {
  published: 'Published',
  draft: 'Draft',
  expired: 'Expired',
}

export default function StatusBadge({
  status,
  className,
}: {
  status: Status | string
  className?: string
}) {
  const key = (['draft', 'published', 'expired'].includes(status)
    ? status
    : 'draft') as Status

  return (
    <Badge variant="outline" className={cn(styles[key], className)}>
      {labels[key]}
    </Badge>
  )
}