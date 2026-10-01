import slugify from 'slugify'
import { createClient } from '@/lib/supabase-browser'

function baseSlug(title: string) {
  return slugify(title, { lower: true, strict: true }) || 'event'
}

/**
 * Returns a slug guaranteed not to collide with any existing event.
 * If the base slug is taken, appends a short random suffix until it's free.
 * Never regenerates on edit — callers must gate this behind "is create".
 */
export async function generateUniqueEventSlug(title: string): Promise<string> {
  const supabase = createClient()
  const base = baseSlug(title)

  const { data, error } = await supabase
    .from('events')
    .select('slug')
    .ilike('slug', `${base}%`)
  if (error) throw error

  const taken = new Set((data ?? []).map((r) => r.slug))
  if (!taken.has(base)) return base

  // Try base-xxxxxx
  for (let i = 0; i < 10; i++) {
    const suffix = Math.random().toString(36).slice(2, 8)
    const candidate = `${base}-${suffix}`
    if (!taken.has(candidate)) return candidate
  }

  // Fallback: timestamp suffix — effectively never collides
  return `${base}-${Date.now().toString(36)}`
}