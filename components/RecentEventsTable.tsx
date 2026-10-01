'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ImageIcon } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import { Button } from '@/components/ui/button'

export type RecentEvent = {
  id: string
  title: string
  slug: string
  image_url: string | null
  event_date: string
  event_time: string | null
  venue_name: string | null
  status: string
  is_featured: boolean | null
  created_at: string
  category_id: string | null
  categories: { name: string } | { name: string }[] | null

  // Optional — dashboard query may not select these, modal renders if present
  description?: string | null
  address?: string | null
  organizer_name?: string | null
  ticket_url?: string | null
  price_info?: string | null
}

function categoryName(c: RecentEvent['categories']) {
  if (!c) return '—'
  if (Array.isArray(c)) return c[0]?.name ?? '—'
  return c.name ?? '—'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function RecentEventsTable({
  events,
  onRowClick,
}: {
  events: RecentEvent[]
  onRowClick?: (event: RecentEvent) => void
}) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="No events yet"
        description="Create your first event to get started."
        action={
          <Button asChild>
            <Link href="/events/new">Create your first event</Link>
          </Button>
        }
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Cover</TableHead>
          <TableHead>Event</TableHead>
          <TableHead className="hidden sm:table-cell">Date</TableHead>
          <TableHead className="hidden md:table-cell">Category</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow
            key={event.id}
            onClick={() => onRowClick?.(event)}
            className={onRowClick ? 'cursor-pointer' : undefined}
          >
            <TableCell>
              <div className="relative h-12 w-16 rounded overflow-hidden bg-muted shrink-0">
                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="font-medium max-w-[240px]">
              <div className="truncate">{event.title}</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground">
              {formatDate(event.event_date)}
            </TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">
              {categoryName(event.categories)}
            </TableCell>
            <TableCell className="text-right">
              <StatusBadge status={event.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}