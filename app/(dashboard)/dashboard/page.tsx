import {
  Calendar,
  CheckCircle2,
  FileText,
  Clock,
} from 'lucide-react'
import { getEventCounts, getRecentEvents } from '@/lib/queries'
import PageHeader from '@/components/PageHeader'
import StatBoard from '@/components/StatBoard'
import DashboardRecentCard from '@/components/DashboardRecentCard'

export default async function DashboardPage() {
  const [counts, recent] = await Promise.all([
    getEventCounts(),
    getRecentEvents(5),
  ])

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening with your events."
      />

      <StatBoard
        className="mb-8"
        stats={[
          {
            label: 'Total events',
            value: counts.total,
            icon: Calendar,
          },
          {
            label: 'Published',
            value: counts.published,
            icon: CheckCircle2,
            accent: true,
          },
          {
            label: 'Drafts',
            value: counts.draft,
            icon: FileText,
          },
          {
            label: 'Upcoming',
            value: counts.upcoming,
            icon: Clock,
          },
        ]}
      />

      <DashboardRecentCard events={recent} />
    </div>
  )
}