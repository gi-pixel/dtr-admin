import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Calendar, CheckCircle2, FileText, Clock } from 'lucide-react'
import { getEventCounts, getRecentEvents } from '@/lib/queries'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import DashboardRecentCard from '@/components/DashboardRecentCard'

export default async function DashboardPage() {
  const [counts, recent] = await Promise.all([
    getEventCounts(),
    getRecentEvents(5),
  ])

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening with your events."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total events" value={counts.total} icon={Calendar} />
        <StatCard
          label="Published"
          value={counts.published}
          icon={CheckCircle2}
        />
        <StatCard label="Drafts" value={counts.draft} icon={FileText} />
        <StatCard label="Upcoming" value={counts.upcoming} icon={Clock} />
      </div>

      <DashboardRecentCard events={recent} />
    </div>
  )
}
