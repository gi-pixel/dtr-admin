import EventForm from '@/components/EventForm'
import { getCategories } from '@/lib/queries'

export default async function NewEventPage() {
  const categories = await getCategories()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>
      <EventForm categories={categories} />
    </div>
  )
}