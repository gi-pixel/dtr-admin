'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Tag,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } transition-all duration-200 bg-zinc-900 text-zinc-100 flex flex-col h-screen sticky top-0`}
    >
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        {!collapsed && <span className="font-bold">DTR Admin</span>}
        <button
          onClick={toggleCollapsed}
          aria-label="Toggle sidebar"
          aria-expanded={!collapsed}
          className="p-1 rounded hover:bg-zinc-800"
        >
          <Menu size={18} />
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 text-sm ${
                collapsed ? 'justify-center' : ''
              } ${
                active
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className={`flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white border-t border-zinc-800 ${
          collapsed ? 'justify-center' : ''
        }`}
        title={collapsed ? 'Log Out' : undefined}
      >
        <LogOut size={18} />
        {!collapsed && <span>Log Out</span>}
      </button>
    </aside>
  )
}