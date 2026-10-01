import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your admin account and site preferences.
        </p>
      </div>

      <div className="border rounded-lg bg-card p-16 text-center">
        <Settings className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">Settings coming soon</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This page will be built in a later stage.
        </p>
      </div>
    </div>
  )
}