'use client'

import { createClient } from '@/lib/supabase-browser'

export async function getEventGalleryClient(eventId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('event_images')
    .select('id, image_url, sort_order, created_at')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}