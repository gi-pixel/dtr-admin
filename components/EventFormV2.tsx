'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import PageHeader from './PageHeader'
import CoverImageField from './CoverImageField'
import GalleryDropZone, {
  type ExistingGalleryImage,
} from './GalleryDropZone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { eventSchema, type EventFormValues } from '@/lib/validation'
import {
  createEvent,
  updateEvent,
  uploadGalleryImages,
} from '@/lib/mutations'
import { toastSuccess, toastFromError } from '@/lib/toast'

type Category = { id: string; name: string }

type ExistingEvent = {
  id: string
  title: string
  slug: string
  description: string | null
  image_url: string | null
  event_date: string
  event_time: string | null
  venue_name: string | null
  address: string | null
  category_id: string | null
  organizer_name: string | null
  ticket_url: string
  price_info: string | null
  is_featured: boolean | null
  status: string
}

export default function EventFormV2({
  categories,
  event,
  eventId,
  existingGallery = [],
}: {
  categories: Category[]
  event?: ExistingEvent
  eventId?: string
  existingGallery?: ExistingGalleryImage[]
}) {
  const router = useRouter()
  const isEditing = Boolean(eventId)
  const [submitting, setSubmitting] = useState<'draft' | 'publish' | null>(null)

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverCleared, setCoverCleared] = useState(false)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      event_date: event?.event_date ?? '',
      event_time: event?.event_time ? event.event_time.slice(0, 5) : '',
      venue_name: event?.venue_name ?? '',
      address: event?.address ?? '',
      category_id: event?.category_id ?? '',
      organizer_name: event?.organizer_name ?? '',
      ticket_url: event?.ticket_url ?? '',
      price_info: event?.price_info ?? '',
      is_featured: event?.is_featured ?? false,
      status: (event?.status as EventFormValues['status']) ?? 'draft',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form

  const isFeatured = watch('is_featured')

  async function save(
    values: EventFormValues,
    intent: 'draft' | 'publish'
  ) {
    setSubmitting(intent)
    const status = intent === 'publish' ? 'published' : 'draft'
    const payload = {
      ...values,
      status,
      imageFile: coverFile,
      ...(coverCleared && !coverFile ? { image_url: null } : {}),
    }

    try {
      if (isEditing && eventId) {
        await updateEvent(eventId, payload as any)

        if (galleryFiles.length > 0) {
          await uploadGalleryImages(eventId, galleryFiles)
        }

        toastSuccess('Event saved')
        router.push('/events')
        router.refresh()
      } else {
        const inserted = await createEvent(payload as any)

        if (galleryFiles.length > 0) {
          await uploadGalleryImages(inserted.id, galleryFiles)
        }

        toastSuccess(
          intent === 'publish' ? 'Event published' : 'Draft saved'
        )
        router.push('/events')
        router.refresh()
      }
    } catch (err) {
      toastFromError(err, 'Failed to save event')
      setSubmitting(null)
    }
  }

  const onValid = (values: EventFormValues) =>
    save(values, submitting === 'publish' ? 'publish' : 'draft')

  const onInvalid = () => {
    toastFromError('Please fix the highlighted fields')
  }

  function handleSaveDraft() {
    setSubmitting('draft')
    handleSubmit((values) => save(values, 'draft'), onInvalid)()
  }

  function handlePublish() {
    setSubmitting('publish')
    handleSubmit((values) => save(values, 'publish'), onInvalid)()
  }

  const anySubmitting = submitting !== null

  return (
    <div className="pb-24">
      <PageHeader
        title={isEditing ? 'Edit event' : 'New event'}
        breadcrumbs={[
          { label: 'Events', href: '/events' },
          { label: isEditing ? 'Edit' : 'New event' },
        ]}
      />

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" {...register('title')} />
                  {errors.title && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={6}
                    {...register('description')}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Explain what attendees can expect.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Date & time</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_date">Date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    {...register('event_date')}
                  />
                  {errors.event_date && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.event_date.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="event_time">Time</Label>
                  <Input
                    id="event_time"
                    type="time"
                    {...register('event_time')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="venue_name">Venue name</Label>
                  <Input id="venue_name" {...register('venue_name')} />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register('address')} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ticket_url">Ticket URL *</Label>
                  <Input
                    id="ticket_url"
                    placeholder="https://eventbrite.com/…"
                    {...register('ticket_url')}
                  />
                  {errors.ticket_url && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.ticket_url.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Where attendees are sent to buy tickets.
                  </p>
                </div>
                <div>
                  <Label htmlFor="price_info">Price info</Label>
                  <Input
                    id="price_info"
                    placeholder="From GHS 50"
                    {...register('price_info')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_featured">Featured</Label>
                    <p className="text-xs text-muted-foreground">
                      Show on the homepage hero.
                    </p>
                  </div>
                  <Switch
                    id="is_featured"
                    checked={isFeatured}
                    onCheckedChange={(v) => setValue('is_featured', v)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={watch('category_id') || ''}
                  onValueChange={(v) => setValue('category_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Organizer name"
                  {...register('organizer_name')}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cover image</CardTitle>
              </CardHeader>
              <CardContent>
                <CoverImageField
                  currentUrl={coverCleared ? null : event?.image_url ?? null}
                  file={coverFile}
                  onChange={(f) => {
                    setCoverFile(f)
                    if (f) setCoverCleared(false)
                  }}
                  onClear={() => setCoverCleared(true)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Shown on cards and at the top of the event page.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <GalleryDropZone
                  mode={isEditing ? 'edit' : 'create'}
                  existingImages={existingGallery}
                  pendingFiles={galleryFiles}
                  onAddFiles={(files) =>
                    setGalleryFiles((prev) => [...prev, ...files])
                  }
                  onRemovePending={(i) =>
                    setGalleryFiles((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  onDeleted={() => router.refresh()}
                />
                {!isEditing && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Gallery images upload after the event is saved.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            asChild
            disabled={anySubmitting}
          >
            <Link href="/events">Cancel</Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={anySubmitting}
          >
            {submitting === 'draft' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save draft
          </Button>
          <Button onClick={handlePublish} disabled={anySubmitting}>
            {submitting === 'publish' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Publish
          </Button>
        </div>
      </div>
    </div>
  )
}