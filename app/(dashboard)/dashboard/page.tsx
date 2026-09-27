import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getEventCounts } from '@/lib/queries'

export default async function DashboardPage() {
  const counts = await getEventCounts()

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          <Plus size={18} />
          New Event
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Events" value={counts.total} />
        <StatCard label="Published" value={counts.published} />
        <StatCard label="Drafts" value={counts.draft} />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-lg p-5 bg-white">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}