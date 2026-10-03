'use client'

import Image from 'next/image'
import { Menu } from 'lucide-react'
import { useSidebar } from '@/components/SidebarContext'
import { useIsMobile } from '@/lib/hooks/use-mobile'
import { Button } from '@/components/ui/button'

export default function Topbar() {
  const isMobile = useIsMobile()
  const { setMobileOpen } = useSidebar()

  if (!isMobile) return null

  return (
    <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Image
        src="/logo.png"
        alt="DTR Global"
        width={100}
        height={50}
        className="h-8 w-auto"
      />
    </div>
  )
}