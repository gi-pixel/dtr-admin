import EventFormV2 from '@/components/EventFormV2'
import { getCategories } from '@/lib/queries'

export default async function NewEventPage() {
  const categories = await getCategories()
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <EventFormV2 categories={categories} />
    </div>
  )
}