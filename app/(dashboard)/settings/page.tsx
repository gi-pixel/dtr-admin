import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Settings"
        description="Configure your admin account and site preferences."
      />
      <div className="rounded-2xl border bg-card">
        <EmptyState
          icon={Settings}
          title="Coming soon"
          description="Account and site settings will be available here."
        />
      </div>
    </div>
  )
}