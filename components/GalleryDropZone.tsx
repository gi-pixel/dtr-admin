'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Loader2 } from 'lucide-react'
import DropZone from './DropZone'
import { deleteGalleryImage } from '@/lib/mutations'
import { toastSuccess, toastFromError } from '@/lib/toast'

export type ExistingGalleryImage = {
  id: string
  image_url: string
}

export default function GalleryDropZone({
  existingImages = [],
  pendingFiles = [],
  onAddFiles,
  onRemovePending,
  onDeleted,
  mode = 'edit',
}: {
  existingImages?: ExistingGalleryImage[]
  pendingFiles?: File[]
  onAddFiles?: (files: File[]) => void
  onRemovePending?: (index: number) => void
  onDeleted?: () => void
  mode?: 'create' | 'edit'
}) {
  const [previews, setPreviews] = useState<string[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const urls = pendingFiles.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [pendingFiles])

  async function handleDelete(id: string) {
    if (!window.confirm('Remove this gallery image?')) return
    setDeletingId(id)
    try {
      await deleteGalleryImage(id)
      toastSuccess('Image removed')
      onDeleted?.()
    } catch (err) {
      toastFromError(err, 'Failed to remove image')
    } finally {
      setDeletingId(null)
    }
  }

  const hasAny = existingImages.length > 0 || pendingFiles.length > 0

  return (
    <div className="space-y-3">
      <DropZone
        multiple
        onFiles={(files) => onAddFiles?.(files)}
        label="Add gallery images"
        hint="Drop multiple images at once"
      />

      {hasAny && (
        <div className="grid grid-cols-3 gap-2">
          {/* Existing (edit mode) */}
          {existingImages.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded overflow-hidden border bg-muted group"
            >
              <Image
                src={img.image_url}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                disabled={deletingId === img.id}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition disabled:opacity-100"
                aria-label="Delete image"
              >
                {deletingId === img.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </button>
            </div>
          ))}

          {/* Pending (create mode + new adds in edit mode) */}
          {previews.map((url, i) => (
            <div
              key={url}
              className="relative aspect-square rounded overflow-hidden border bg-muted group"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => onRemovePending?.(i)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {mode === 'create' && pendingFiles.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {pendingFiles.length} image{pendingFiles.length === 1 ? '' : 's'} will
          upload after the event is saved.
        </p>
      )}
    </div>
  )
}