'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Loader2, ImageIcon, Trash2 } from 'lucide-react'

import DropZone from './DropZone'
import EmptyState from './EmptyState'
import ConfirmDeleteDialog from './ConfirmDeleteDialog'
import { Button } from '@/components/ui/button'
import {
  uploadMediaLibraryImages,
  deleteMediaLibraryImage,
} from '@/lib/mutations'
import { toastSuccess, toastFromError } from '@/lib/toast'

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
  const [deleting, setDeleting] = useState<MediaLibraryItem | null>(null)
  const [removing, setRemoving] = useState(false)

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

  async function handleDelete() {
    if (!deleting) return
    setRemoving(true)
    try {
      await deleteMediaLibraryImage(deleting.id)
      toastSuccess('Image deleted')
      setDeleting(null)
      router.refresh()
    } catch (err) {
      toastFromError(err, 'Failed to delete image')
    } finally {
      setRemoving(false)
    }
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

        {/* Pending previews with an Upload button */}
        {pending.length > 0 && (
          <div className="rounded-2xl border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {pending.length} image{pending.length === 1 ? '' : 's'} ready
                to upload
              </p>
              <Button size="sm" onClick={handleUpload} disabled={uploading}>
                {uploading && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                Upload {pending.length}
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {previews.map((url, i) => (
                <div
                  key={url}
                  className="relative aspect-square rounded-lg overflow-hidden border bg-muted group"
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
                    onClick={() => removePending(i)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing library grid with delete buttons */}
        {images.length === 0 ? (
          <div className="rounded-2xl border bg-card">
            <EmptyState
              icon={ImageIcon}
              title="No gallery images yet"
              description="Upload images above — they'll appear on the public gallery page."
            />
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">
                {images.length} image{images.length === 1 ? '' : 's'} in
                library
              </p>
              <p className="text-xs text-muted-foreground">
                Hover an image to delete
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-xl overflow-hidden border bg-muted group"
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text ?? img.caption ?? ''}
                    fill
                    sizes="180px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => setDeleting(img)}
                    aria-label="Delete image"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Caption overlay if present */}
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[11px] text-white line-clamp-2">
                        {img.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this image?"
        description="It will be permanently removed from the media library and the public gallery page. The image file will also be deleted from storage. This cannot be undone."
        onConfirm={handleDelete}
        loading={removing}
      />
    </>
  )
}