import { createClient } from './supabase-browser'
import slugify from 'slugify'

export async function updateEvent(id: string, data: any) {
  const supabase = createClient()
  const { imageFile, ...fields } = data

  let image_url: string | undefined

  if (imageFile instanceof File && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filename, imageFile)
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(filename)
    image_url = urlData.publicUrl
  }

  const updatePayload: Record<string, any> = { ...fields }

  if (typeof fields.title === 'string' && fields.title.trim()) {
    updatePayload.slug = slugify(fields.title, { lower: true, strict: true })
  }

  if (image_url) {
    updatePayload.image_url = image_url
  }

  const { error } = await supabase
    .from('events')
    .update(updatePayload)
    .eq('id', id)

  if (error) throw error
}

export async function createCategory(name: string) {
  const supabase = createClient()
  const slug = slugify(name, { lower: true, strict: true })

  const { error } = await supabase.from('categories').insert({ name, slug })

  if (error) throw error
}

export async function deleteCategory(id: string) {
  // events.category_id references categories(id) ON DELETE SET NULL, so any
  // events pointing at this category will have category_id set to null
  // automatically. This is intentional — deleting a category should not
  // delete or break the events that were filed under it.
  const supabase = createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)

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

  // Fetch the row first so we can also clean up the storage file.
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

  // Best-effort storage cleanup. If this fails, the DB row is already gone
  // and the orphaned file is harmless — just log it.
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