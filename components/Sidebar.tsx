'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Tag,
  Image as ImageIcon,
  Settings,
  LogOut,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase-browser'
import { useSidebar } from '@/components/SidebarContext'
import { useIsMobile } from '@/lib/hooks/use-mobile'
import { useAdminUser } from '@/lib/hooks/use-admin-user'

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
  { href: '/gallery', label: 'Gallery', icon: ImageIcon },
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
    <nav className="flex-1 px-3 py-4 space-y-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')

        const item = (
          <Link
            href={href}
            onClick={onNavigate}
            className={cn(
              'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
              iconOnly && 'justify-center px-2',
              active
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground'
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
    <div className="border-t border-sidebar-border p-3 space-y-2">
      {!iconOnly ? (
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {loading ? '…' : initials(email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-sidebar-muted">
              Signed in
            </p>
            <p className="text-sm text-sidebar-foreground truncate">
              {loading ? 'Loading…' : email ?? 'Admin'}
            </p>
          </div>
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
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

      <button
        onClick={handleLogout}
        className={cn(
          'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors',
          iconOnly && 'justify-center px-2'
        )}
      >
        <LogOut className="h-4 w-4" />
        {!iconOnly && <span>Log Out</span>}
      </button>
    </div>
  )
}

export default function Sidebar() {
  const { collapsed, setMobileOpen, mobileOpen } = useSidebar()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 bg-sidebar border-r border-sidebar-border text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center border-b border-sidebar-border px-5">
            <Image
              src="/logo.png"
              alt="DTR Global"
              width={120}
              height={60}
              className="h-9 w-auto"
            />
          </div>
          <div className="flex flex-col h-[calc(100vh-4rem)]">
            <NavItems onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'sticky top-0 h-screen flex flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-all duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-sidebar-border',
            collapsed ? 'justify-center px-2' : 'px-5'
          )}
        >
          {collapsed ? (
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-sm">
              D
            </div>
          ) : (
            <Image
              src="/logo.png"
              alt="DTR Global"
              width={120}
              height={60}
              className="h-9 w-auto"
            />
          )}
        </div>

        <NavItems />
        <SidebarFooter />
      </aside>
    </TooltipProvider>
  )
}