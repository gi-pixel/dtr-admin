'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
    Image,
  Tag,
  Settings,
  LogOut,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase-browser'
import { useSidebar } from '@/components/SidebarContext'
import { useIsMobile } from '@/lib/hooks/use-mobile'
import { useAdminUser } from '@/lib/hooks/use-admin-user'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/gallery', label: 'Gallery', icon: Image },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function initials(email: string | null) {
  if (!email) return 'A'
  const local = email.split('@')[0]
  const parts = local.split(/[._-]/).filter(Boolean)
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '')
  return letters.join('') || local[0]?.toUpperCase() || 'A'
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { collapsed } = useSidebar()
  const isMobile = useIsMobile()
  const iconOnly = collapsed && !isMobile

  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')

        const item = (
          <Link
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              iconOnly && 'justify-center px-2',
              active
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-[#B8A493] hover:bg-[#2B1F17] hover:text-[#F3E9DC]'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!iconOnly && <span>{label}</span>}
          </Link>
        )

        if (!iconOnly) return <div key={href}>{item}</div>

        return (
          <Tooltip key={href}>
            <TooltipTrigger asChild>
              <div>{item}</div>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}

function SidebarFooter() {
  const router = useRouter()
  const supabase = createClient()
  const { collapsed } = useSidebar()
  const isMobile = useIsMobile()
  const { email, loading } = useAdminUser()
  const iconOnly = collapsed && !isMobile

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="border-t border-[#3E2C20] p-3 space-y-2">
      {!iconOnly ? (
        <div className="flex items-center gap-3 px-1 py-1">
          <Avatar className="h-8 w-8 border border-[#3E2C20]">
            <AvatarFallback className="bg-[#2B1F17] text-[#F3E9DC] text-xs">
              {loading ? '…' : initials(email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#B8A493]">Signed in as</p>
            <p className="text-sm text-[#F3E9DC] truncate">
              {loading ? 'Loading…' : email ?? 'Admin'}
            </p>
          </div>
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              <Avatar className="h-8 w-8 border border-[#3E2C20]">
                <AvatarFallback className="bg-[#2B1F17] text-[#F3E9DC] text-xs">
                  {loading ? '…' : initials(email)}
                </AvatarFallback>
              </Avatar>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            {loading ? 'Loading…' : email ?? 'Admin'}
          </TooltipContent>
        </Tooltip>
      )}

      <Button
        variant="ghost"
        onClick={handleLogout}
        className={cn(
          'w-full justify-start text-[#B8A493] hover:bg-[#2B1F17] hover:text-[#F3E9DC]',
          iconOnly && 'justify-center px-0'
        )}
      >
        <LogOut className="h-4 w-4" />
        {!iconOnly && <span className="ml-3">Log Out</span>}
      </Button>
    </div>
  )
}

export default function Sidebar() {
  const { collapsed, setMobileOpen, mobileOpen } = useSidebar()
  const isMobile = useIsMobile()

  // Mobile: render as a slide-over Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-64 bg-[#0D0B09] border-r border-[#3E2C20] text-[#F3E9DC]"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center border-b border-[#3E2C20] px-4">
            <span className="text-lg font-bold tracking-tight">
              DTR <span className="text-primary">Admin</span>
            </span>
          </div>
          <div className="flex flex-col h-[calc(100vh-4rem)]">
            <NavItems onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: fixed-width sidebar that collapses
  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'sticky top-0 h-screen flex flex-col bg-[#0D0B09] border-r border-[#3E2C20] text-[#F3E9DC] transition-all duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-[#3E2C20]',
            collapsed ? 'justify-center px-2' : 'px-4'
          )}
        >
          {collapsed ? (
            <span className="text-lg font-bold text-primary">D</span>
          ) : (
            <span className="text-lg font-bold tracking-tight">
              DTR <span className="text-primary">Admin</span>
            </span>
          )}
        </div>

        <NavItems />
        <SidebarFooter />
      </aside>
    </TooltipProvider>
  )
}