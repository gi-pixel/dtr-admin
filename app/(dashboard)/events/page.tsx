import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getAllEvents, getCategories } from '@/lib/queries'
import PageHeader from '@/components/PageHeader'
import EventsTableClient from '@/components/EventsTableClient'
import { Button } from '@/components/ui/button'

export default async function EventsPage() {
  const [events, categories] = await Promise.all([
    getAllEvents(),
    getCategories(),
  ])

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Events"
        description="Manage all events — filter, edit, publish, and delete."
        action={
          <Button asChild>
            <Link href="/events/new">
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Link>
          </Button>
        }
      />

      <EventsTableClient events={events} categories={categories} />
    </div>
  )
}