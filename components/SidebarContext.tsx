'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type SidebarContextValue = {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  toggle: () => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored === 'true') setCollapsedState(true)
  }, [])

  function setCollapsed(v: boolean) {
    setCollapsedState(v)
    localStorage.setItem('sidebar-collapsed', String(v))
  }

  function toggle() {
    setCollapsed(!collapsed)
  }

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, toggle, mobileOpen, setMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}