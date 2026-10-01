'use client'

import { useEffect, useState } from 'react'
import EventsTable, { type TableEvent } from './EventsTable'
import EventDetailsModal, {
  type ModalGalleryImage,
} from './EventDetailsModal'
import { getEventGalleryClient } from '@/lib/queries-client'
import { toastFromError } from '@/lib/toast'

type Category = { id: string; name: string }

export default function EventsTableClient({
  events,
  categories,
}: {
  events: TableEvent[]
  categories: Category[]
}) {
  const [selected, setSelected] = useState<TableEvent | null>(null)
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
      <EventsTable
        events={events}
        categories={categories}
        onRowClick={setSelected}
      />

      <EventDetailsModal
        event={selected}
        gallery={gallery}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  )
}