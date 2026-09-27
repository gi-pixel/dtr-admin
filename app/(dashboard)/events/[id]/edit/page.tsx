import { notFound } from 'next/navigation'
import EventForm from '@/components/EventForm'
import GalleryUploader from '@/components/GalleryUploader'
import { getEventById, getCategories, getEventGallery } from '@/lib/queries'

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

  if (!event) {
    notFound()
  }

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
        <EventForm categories={categories} event={event} eventId={id} />
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-bold mb-4">Event Gallery</h2>
        <GalleryUploader eventId={id} existingImages={gallery} />
      </div>
    </div>
  )
}