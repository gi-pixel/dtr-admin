'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export function useAdminUser() {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null))
      .finally(() => setLoading(false))
  }, [])

  return { email, loading }
}