import { notFound } from 'next/navigation'
import EventFormV2 from '@/components/EventFormV2'
import {
  getCategories,
  getEventById,
  getEventGallery,
} from '@/lib/queries'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [event, categories, gallery] = await Promise.all([
    getEventById(id).catch(() => null),
    getCategories(),
    getEventGallery(id).catch(() => []),
  ])

  if (!event) notFound()

  return (
    <div className="p-6 sm:p-8">
      <EventFormV2
        categories={categories}
        event={event}
        eventId={id}
        existingGallery={gallery}
      />
    </div>
  )
}