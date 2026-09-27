// components/EventForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import slugify from 'slugify'
import { updateEvent } from '@/lib/mutations'
import { createClient } from '@/lib/supabase-browser'
const supabase = createClient()

type Category = { id: string; name: string; slug: string }
type EventData = {
  id?: string
  title?: string
  description?: string | null
  image_url?: string | null
  event_date?: string | null
  event_time?: string | null
  venue_name?: string | null
  address?: string | null
  category_id?: string | null
  organizer_name?: string | null
  ticket_url?: string | null
  price_info?: string | null
  is_featured?: boolean | null
  status?: string | null
}

export default function EventForm({
  categories,
  event,
  eventId,
}: {
  categories: Category[]
  event?: EventData
  eventId?: string
}) {
  const router = useRouter()
  const isEditing = Boolean(eventId)

  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [eventDate, setEventDate] = useState(event?.event_date ?? '')
  const [eventTime, setEventTime] = useState(
    event?.event_time ? event.event_time.slice(0, 5) : ''
  )
  const [venueName, setVenueName] = useState(event?.venue_name ?? '')
  const [address, setAddress] = useState(event?.address ?? '')
  const [categoryId, setCategoryId] = useState(event?.category_id ?? '')
  const [organizerName, setOrganizerName] = useState(event?.organizer_name ?? '')
  const [ticketUrl, setTicketUrl] = useState(event?.ticket_url ?? '')
  const [priceInfo, setPriceInfo] = useState(event?.price_info ?? '')
  const [isFeatured, setIsFeatured] = useState(event?.is_featured ?? false)
  const [status, setStatus] = useState(event?.status ?? 'draft')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditing && eventId) {
        await updateEvent(eventId, {
          title,
          description,
          event_date: eventDate,
          event_time: eventTime || null,
          venue_name: venueName,
          address,
          category_id: categoryId || null,
          organizer_name: organizerName,
          ticket_url: ticketUrl,
          price_info: priceInfo,
          is_featured: isFeatured,
          status,
          imageFile: imageFile ?? undefined,
        })
      } else {
        let image_url: string | null = null

        if (imageFile) {
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

        const slug = slugify(title, { lower: true, strict: true })

        const { error: insertError } = await supabase.from('events').insert({
          title,
          slug,
          description,
          image_url,
          event_date: eventDate,
          event_time: eventTime || null,
          venue_name: venueName,
          address,
          category_id: categoryId || null,
          organizer_name: organizerName,
          ticket_url: ticketUrl,
          price_info: priceInfo,
          is_featured: isFeatured,
          status,
        })

        if (insertError) throw insertError
      }

      router.push('/events')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Event Date *</label>
          <input
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Event Time</label>
          <input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Venue Name</label>
        <input
          type="text"
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Organizer Name</label>
        <input
          type="text"
          value={organizerName}
          onChange={(e) => setOrganizerName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ticket URL *</label>
        <input
          type="url"
          required
          value={ticketUrl}
          onChange={(e) => setTicketUrl(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Price Info</label>
        <input
          type="text"
          value={priceInfo}
          onChange={(e) => setPriceInfo(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image</label>
        {isEditing && event?.image_url && (
          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-1">Current image</p>
            <img
              src={event.image_url}
              alt="Current"
              className="w-40 h-40 object-cover rounded border"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_featured"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
        />
        <label htmlFor="is_featured" className="text-sm font-medium">
          Featured
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Event'}
      </button>
    </form>
  )
}