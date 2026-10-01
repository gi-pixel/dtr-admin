'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Loader2, ImageIcon } from 'lucide-react'

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
      toastSuccess('Image removed')
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
        <DropZone
          multiple
          onFiles={addFiles}
          label="Upload images to the gallery"
          hint="PNG or JPG — drop several at once"
        />

        {pending.length > 0 && (
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {pending.length} image{pending.length === 1 ? '' : 's'} ready
              </p>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                Upload
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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

        {images.length === 0 ? (
          <div className="rounded-xl border bg-card">
            <EmptyState
              icon={ImageIcon}
              title="No gallery images yet"
              description="Upload images above — they'll appear on the public /gallery page."
            />
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-medium mb-4">
              {images.length} image{images.length === 1 ? '' : 's'} in library
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-lg overflow-hidden border bg-muted group"
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text ?? ''}
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setDeleting(img)}
                    className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    aria-label="Delete"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this image?"
        description="It will be removed from the media library and the public gallery page."
        onConfirm={handleDelete}
        loading={removing}
      />
    </>
  )
}