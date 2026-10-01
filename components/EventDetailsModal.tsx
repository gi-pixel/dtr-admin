'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  User,
  Ticket,
  ExternalLink,
  Pencil,
  Trash2,
  Star,
  ImageIcon,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import StatusBadge from '@/components/StatusBadge'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import { deleteEvent } from '@/lib/mutations'
import { toastSuccess, toastFromError } from '@/lib/toast'

export type ModalEvent = {
  id: string
  title: string
  slug: string
  description?: string | null
  image_url: string | null
  event_date: string
  event_time: string | null
  venue_name: string | null
  address?: string | null
  organizer_name?: string | null
  ticket_url?: string | null
  price_info?: string | null
  status: string
  is_featured: boolean | null
  category_id?: string | null
  categories?: { id?: string; name: string } | { id?: string; name: string }[] | null
}

export type ModalGalleryImage = {
  id: string
  image_url: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':')
  const d = new Date()
  d.setHours(Number(h), Number(m), 0, 0)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function categoryOf(
  c: ModalEvent['categories']
): { id?: string; name: string } | null {
  if (!c) return null
  if (Array.isArray(c)) return c[0] ?? null
  return c
}

export default function EventDetailsModal({
  event,
  gallery = [],
  open,
  onOpenChange,
  onDeleted,
}: {
  event: ModalEvent | null
  gallery?: ModalGalleryImage[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!event) return null

  const cat = categoryOf(event.categories)
  const time = formatTime(event.event_time)

  async function handleDelete() {
    if (!event) return
    setDeleting(true)
    try {
      await deleteEvent(event.id)
      toastSuccess('Event deleted')
      setConfirmDelete(false)
      onOpenChange(false)
      onDeleted?.()
      router.refresh()
    } catch (err) {
      toastFromError(err, 'Failed to delete event')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden gap-0">
          {/* Cover banner */}
          <div className="relative h-48 sm:h-56 bg-muted shrink-0">
            {event.image_url ? (
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            {/* Badges overlay */}
            <div className="absolute top-3 left-3 flex gap-2">
              <StatusBadge status={event.status} />
              {event.is_featured && (
                <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto px-6 py-5 space-y-5">
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-2xl leading-tight">
                {event.title}
              </DialogTitle>
            </DialogHeader>

            {/* Meta grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{formatDate(event.event_date)}</span>
              </div>

              {time && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{time}</span>
                </div>
              )}

              {event.venue_name && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{event.venue_name}</p>
                    {event.address && (
                      <p className="text-muted-foreground">{event.address}</p>
                    )}
                  </div>
                </div>
              )}

              {cat && (
                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{cat.name}</span>
                </div>
              )}

              {event.organizer_name && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{event.organizer_name}</span>
                </div>
              )}

              {event.price_info && (
                <div className="flex items-start gap-2">
                  <Ticket className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{event.price_info}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    About this event
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-3">
                    Gallery ({gallery.length})
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {gallery.map((img) => (
                      <div
                        key={img.id}
                        className="relative aspect-square rounded overflow-hidden bg-muted"
                      >
                        <Image
                          src={img.image_url}
                          alt=""
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Ticket link */}
            {event.ticket_url && (
              <>
                <Separator />
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open ticket link
                  </a>
                </Button>
              </>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t bg-muted/30 gap-2 sm:gap-2 flex-row flex-wrap">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button asChild>
              <Link href={`/events/${event.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this event?"
        description={`"${event.title}" will be permanently removed along with its gallery images. This cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}