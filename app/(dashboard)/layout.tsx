import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SidebarProvider } from '@/components/SidebarContext'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  )
}