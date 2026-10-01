'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import RecentEventsTable from './RecentEventsTable'
import EventDetailsModal, {
  type ModalEvent,
  type ModalGalleryImage,
} from './EventDetailsModal'
import { getEventGalleryClient } from '@/lib/queries-client'
import { toastFromError } from '@/lib/toast'

import type { TableEvent } from './EventsTable'
import type { RecentEvent } from './RecentEventsTable'

export default function DashboardRecentCard({
  events,
}: {
  events: RecentEvent[]
}) {
  const [selected, setSelected] = useState<RecentEvent | null>(null)
  const [gallery, setGallery] = useState<ModalGalleryImage[]>([])

  useEffect(() => {
    if (!selected) {
      setGallery([])
      return
    }
    let cancelled = false
    getEventGalleryClient(selected.id)
      .then((imgs) => {
        if (!cancelled) setGallery((imgs ?? []) as ModalGalleryImage[])
      })
      .catch((err) => toastFromError(err, 'Failed to load gallery'))
    return () => {
      cancelled = true
    }
  }, [selected])

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold">Recent events</h2>
          <Link
            href="/events"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            See all events
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <RecentEventsTable events={events} onRowClick={setSelected} />
      </div>

      <EventDetailsModal
        event={selected}
        gallery={gallery}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  )
}