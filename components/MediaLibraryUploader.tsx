'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  X,
  Loader2,
  ImageIcon,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import DropZone from './DropZone'
import EmptyState from './EmptyState'
import ConfirmDeleteDialog from './ConfirmDeleteDialog'
import { Button } from '@/components/ui/button'
import {
  uploadMediaLibraryImages,
  deleteMediaLibraryImage,
} from '@/lib/mutations'
import { toastSuccess, toastFromError } from '@/lib/toast'
import { cn } from '@/lib/utils'

export type MediaLibraryItem = {
  id: string
  image_url: string
  alt_text: string | null
  caption: string | null
  created_at: string
}

export default function MediaLibraryUploader({
  images,
}: {
  images: MediaLibraryItem[]
}) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [pending, setPending] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [removing, setRemoving] = useState(false)

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Cleanup previews on unmount
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [previews])

  // ── Upload ──
  function addFiles(files: File[]) {
    setPending((prev) => [...prev, ...files])
    setPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ])
  }

  function removePending(i: number) {
    setPending((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i])
      return prev.filter((_, idx) => idx !== i)
    })
  }

  async function handleUpload() {
    if (pending.length === 0) return
    setUploading(true)
    try {
      const results = await uploadMediaLibraryImages(pending)
      const failed = results.filter((r) => !r.ok)
      if (failed.length > 0) {
        toastFromError(`${failed.length} image(s) failed to upload`)
      } else {
        toastSuccess(
          `Uploaded ${results.length} image${results.length === 1 ? '' : 's'}`
        )
      }
      previews.forEach((url) => URL.revokeObjectURL(url))
      setPending([])
      setPreviews([])
      router.refresh()
    } catch (err) {
      toastFromError(err, 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // ── Selection ──
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
  }

  // ── Delete ──
  async function handleDelete() {
    if (selected.size === 0) return
    setRemoving(true)
    try {
      const ids = Array.from(selected)
      await Promise.all(ids.map((id) => deleteMediaLibraryImage(id)))
      toastSuccess(
        `Deleted ${ids.length} image${ids.length === 1 ? '' : 's'}`
      )
      clearSelection()
      setConfirmDelete(false)
      router.refresh()
    } catch (err) {
      toastFromError(err, 'Failed to delete')
    } finally {
      setRemoving(false)
    }
  }

  // ── Lightbox keyboard ──
  useEffect(() => {
    if (lightboxIndex === null) return

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight' && lightboxIndex !== null)
        setLightboxIndex((i) => ((i ?? 0) + 1) % images.length)
      if (e.key === 'ArrowLeft' && lightboxIndex !== null)
        setLightboxIndex((i) => ((i ?? 0) - 1 + images.length) % images.length)
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, images.length])

  // ── Touch swipe for lightbox ──
  const touchStartX = useRef<number | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || lightboxIndex === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) < 50) return
    if (dx < 0) {
      setLightboxIndex((i) => ((i ?? 0) + 1) % images.length)
    } else {
      setLightboxIndex((i) => ((i ?? 0) - 1 + images.length) % images.length)
    }
    touchStartX.current = null
  }

  return (
    <>
      <div className="space-y-6">
        {/* Upload zone */}
        <DropZone
          multiple
          onFiles={addFiles}
          label="Upload images to the gallery"
          hint="PNG or JPG — drop several at once"
        />

        {/* Pending uploads */}
        {pending.length > 0 && (
          <div className="rounded-2xl border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {pending.length} image{pending.length === 1 ? '' : 's'} ready
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    previews.forEach((url) => URL.revokeObjectURL(url))
                    setPending([])
                    setPreviews([])
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="rounded-full"
                >
                  {uploading && (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  )}
                  Upload {pending.length}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {previews.map((url, i) => (
                <div
                  key={url}
                  className="relative aspect-square rounded-lg overflow-hidden border bg-muted group"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="140px"
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removePending(i)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selection bar (shown when items are selected) */}
        {selected.size > 0 && (
          <div className="sticky top-2 z-20 rounded-2xl border bg-card shadow-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {selected.size}
              </div>
              <p className="text-sm font-medium">
                {selected.size === 1 ? 'image' : 'images'} selected
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="rounded-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Library grid */}
        {images.length === 0 ? (
          <div className="rounded-2xl border bg-card">
            <EmptyState
              icon={ImageIcon}
              title="No gallery images yet"
              description="Upload images above — they'll appear on the public gallery page."
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {images.length} image{images.length === 1 ? '' : 's'}
              </p>
              <p className="text-xs text-muted-foreground hidden md:block">
                Hover to select · Click to view
              </p>
              <p className="text-xs text-muted-foreground md:hidden">
                Long press to select · Tap to view
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {images.map((img, i) => (
                <GalleryTile
                  key={img.id}
                  img={img}
                  selected={selected.has(img.id)}
                  onSelect={() => toggleSelect(img.id)}
                  onOpen={() => setLightboxIndex(i)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bulk delete confirm */}
      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${selected.size} image${
          selected.size === 1 ? '' : 's'
        }?`}
        description="They will be permanently removed from the media library and the public gallery. The image files will also be deleted from storage. This cannot be undone."
        onConfirm={handleDelete}
        loading={removing}
      />

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIndex(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center select-none"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex(
                    (i) => ((i ?? 0) - 1 + images.length) % images.length
                  )
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-10"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((i) => ((i ?? 0) + 1) % images.length)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-10"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <img
            src={images[lightboxIndex].image_url}
            alt={images[lightboxIndex].alt_text ?? ''}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl"
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm tabular-nums">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}

/* ─────────────────── GalleryTile ─────────────────── */

function GalleryTile({
  img,
  selected,
  onSelect,
  onOpen,
}: {
  img: MediaLibraryItem
  selected: boolean
  onSelect: () => void
  onOpen: () => void
}) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggered = useRef(false)

  function startLongPress() {
    longPressTriggered.current = false
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      onSelect()
    }, 500)
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function handleClick() {
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }
    onOpen()
  }

  return (
    <div
      onMouseEnter={() => {
        // Desktop hover selects — see note below if this feels wrong
      }}
      className={cn(
        'relative aspect-square rounded-xl overflow-hidden border bg-muted group cursor-pointer transition-all',
        selected
          ? 'border-primary ring-2 ring-primary/40'
          : 'border-border md:hover:border-primary/50'
      )}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      onTouchCancel={cancelLongPress}
      onClick={handleClick}
    >
      <Image
        src={img.image_url}
        alt={img.alt_text ?? img.caption ?? ''}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className="object-cover"
      />

      {/* Dim overlay when selected */}
      {selected && (
        <div className="absolute inset-0 bg-primary/20" />
      )}

      {/* Checkmark when selected */}
      {selected && (
        <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      )}

      {/* Desktop hover: quick delete button */}
      {!selected && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          aria-label="Select"
          className="hidden md:flex absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-primary hover:text-primary-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Caption overlay */}
      {img.caption && (
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-[11px] text-white line-clamp-2">
            {img.caption}
          </p>
        </div>
      )}
    </div>
  )
}