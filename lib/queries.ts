import { createClient } from './supabase-server'

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function getEventById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getEventGallery(eventId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_images')
    .select('id, image_url, sort_order, created_at')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getEventCounts() {
  const supabase = await createClient()

  const today = new Date().toISOString().slice(0, 10)

  const [totalRes, publishedRes, draftRes, upcomingRes] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft'),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('event_date', today),
  ])

  return {
    total: totalRes.count ?? 0,
    published: publishedRes.count ?? 0,
    draft: draftRes.count ?? 0,
    upcoming: upcomingRes.count ?? 0,
  }
}

export async function getRecentEvents(limit = 5) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select(
      'id, title, slug, description, image_url, event_date, event_time, venue_name, address, organizer_name, ticket_url, price_info, status, is_featured, category_id, created_at, categories(id, name)'
    )
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getAllEvents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select(
      'id, title, slug, image_url, event_date, event_time, venue_name, status, is_featured, created_at, category_id, categories(id, name)'
    )
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getCategoriesWithCounts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, created_at, events(count)')
    .order('name')
  if (error) throw error

  return (data ?? []).map((row: any) => {
    const eventsField = row.events
    const count = Array.isArray(eventsField)
      ? eventsField[0]?.count ?? 0
      : eventsField?.count ?? 0
    return {
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      created_at: row.created_at as string | null,
      event_count: Number(count) || 0,
    }
  })
}

export async function getMediaLibrary() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('media_library')
    .select('id, image_url, alt_text, caption, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}