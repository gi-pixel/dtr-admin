// lib/queries.ts
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

export async function getEventCounts() {
  const supabase = await createClient()

  const { count: total } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })

  const { count: published } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const { count: draft } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')

  return {
    total: total ?? 0,
    published: published ?? 0,
    draft: draft ?? 0,
  }
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