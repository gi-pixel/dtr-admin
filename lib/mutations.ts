import slugify from 'slugify'
import { createClient } from './supabase-browser'
import { generateUniqueEventSlug } from './slug'
import type { EventFormValues } from './validation'

export type EventWritePayload = Omit<EventFormValues, 'is_featured'> & {
  is_featured: boolean
  imageFile?: File | null
}

async function uploadCoverIfNeeded(file: File | null | undefined) {
  if (!(file instanceof File) || file.size === 0) return undefined

  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const filename = `covers/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('event-images')
    .upload(filename, file)
  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('event-images')
    .getPublicUrl(filename)
  return urlData.publicUrl as string
}

export async function createEvent(data: EventWritePayload) {
  const supabase = createClient()
  const { imageFile, ...fields } = data

  const image_url = await uploadCoverIfNeeded(imageFile)
  const slug = await generateUniqueEventSlug(fields.title)

  const insertPayload: Record<string, unknown> = {
    ...fields,
    slug,
    event_time: fields.event_time || null,
    category_id: fields.category_id || null,
  }
  if (image_url) insertPayload.image_url = image_url

  const { data: inserted, error } = await supabase
    .from('events')
    .insert(insertPayload)
    .select('id')
    .single()

  if (error) throw error
  return inserted as { id: string }
}

export async function updateEvent(id: string, data: EventWritePayload) {
  const supabase = createClient()
  const { imageFile, ...fields } = data

  const image_url = await uploadCoverIfNeeded(imageFile)

  const updatePayload: Record<string, unknown> = {
    ...fields,
    event_time: fields.event_time || null,
    category_id: fields.category_id || null,
  }
  if (image_url) updatePayload.image_url = image_url

  const { error } = await supabase
    .from('events')
    .update(updatePayload)
    .eq('id', id)

  if (error) throw error
}

export async function deleteEvent(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

export async function setEventStatus(
  id: string,
  status: 'draft' | 'published' | 'expired'
) {
  const supabase = createClient()
  const { error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function setEventFeatured(id: string, is_featured: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('events')
    .update({ is_featured })
    .eq('id', id)
  if (error) throw error
}

export async function uploadGalleryImages(eventId: string, files: File[]) {
  const supabase = createClient()
  const results: { file: string; ok: boolean; error?: string }[] = []

  for (const file of files) {
    try {
      const ext = file.name.split('.').pop()
      const filename = `gallery/${eventId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filename, file)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(filename)

      const { error: insertError } = await supabase
        .from('event_images')
        .insert({ event_id: eventId, image_url: urlData.publicUrl })
      if (insertError) throw insertError

      results.push({ file: file.name, ok: true })
    } catch (err: any) {
      results.push({ file: file.name, ok: false, error: err?.message })
    }
  }

  const failures = results.filter((r) => !r.ok)
  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('Gallery upload failures:', failures)
  }

  return results
}

export async function deleteGalleryImage(imageId: string) {
  const supabase = createClient()

  const { data: row, error: fetchError } = await supabase
    .from('event_images')
    .select('image_url')
    .eq('id', imageId)
    .single()
  if (fetchError) throw fetchError

  const { error: deleteError } = await supabase
    .from('event_images')
    .delete()
    .eq('id', imageId)
  if (deleteError) throw deleteError

  if (row?.image_url) {
    const marker = '/storage/v1/object/public/event-images/'
    const idx = row.image_url.indexOf(marker)
    if (idx !== -1) {
      const path = row.image_url.slice(idx + marker.length)
      const { error: storageError } = await supabase.storage
        .from('event-images')
        .remove([path])
      if (storageError) {
        // eslint-disable-next-line no-console
        console.warn('Storage cleanup failed (non-blocking):', storageError)
      }
    }
  }
}

export async function createCategory(name: string) {
  const supabase = createClient()
  const slug = slugify(name, { lower: true, strict: true })

  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function renameCategory(id: string, name: string) {
  const supabase = createClient()
  const slug = slugify(name, { lower: true, strict: true })
  const { error } = await supabase
    .from('categories')
    .update({ name, slug })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCategory(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function uploadMediaLibraryImages(
  files: File[],
  caption?: string
) {
  const supabase = createClient()
  const results: { file: string; ok: boolean; error?: string }[] = []

  for (const file of files) {
    try {
      const ext = file.name.split('.').pop()
      const filename = `gallery/library/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filename, file)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(filename)

      const { error: insertError } = await supabase
        .from('media_library')
        .insert({
          image_url: urlData.publicUrl,
          caption: caption || null,
        })
      if (insertError) throw insertError

      results.push({ file: file.name, ok: true })
    } catch (err: any) {
      results.push({ file: file.name, ok: false, error: err?.message })
    }
  }

  const failures = results.filter((r) => !r.ok)
  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('Media upload failures:', failures)
  }

  return results
}

export async function deleteMediaLibraryImage(id: string) {
  const supabase = createClient()

  const { data: row, error: fetchError } = await supabase
    .from('media_library')
    .select('image_url')
    .eq('id', id)
    .single()
  if (fetchError) throw fetchError

  const { error: deleteError } = await supabase
    .from('media_library')
    .delete()
    .eq('id', id)
  if (deleteError) throw deleteError

  if (row?.image_url) {
    const marker = '/storage/v1/object/public/event-images/'
    const idx = row.image_url.indexOf(marker)
    if (idx !== -1) {
      const path = row.image_url.slice(idx + marker.length)
      const { error: storageError } = await supabase.storage
        .from('event-images')
        .remove([path])
      if (storageError) {
        // eslint-disable-next-line no-console
        console.warn('Storage cleanup failed (non-blocking):', storageError)
      }
    }
  }
}