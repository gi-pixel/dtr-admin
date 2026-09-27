'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadGalleryImages, deleteGalleryImage } from '@/lib/mutations'

type GalleryImage = {
  id: string
  image_url: string
  sort_order: number | null
  created_at: string | null
}

export default function GalleryUploader({
  eventId,
  existingImages,
}: {
  eventId: string
  existingImages: GalleryImage[]
}) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const results = await uploadGalleryImages(eventId, Array.from(files))
      const failed = results.filter((r) => !r.ok)
      if (failed.length > 0) {
        setError(
          `${failed.length} of ${results.length} image(s) failed to upload`
        )
      }
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this image from the gallery?')) return
    setDeletingId(id)
    setError(null)
    try {
      await deleteGalleryImage(id)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Gallery images
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={handleFiles}
          className="w-full border rounded px-3 py-2 disabled:opacity-60"
        />
        {uploading && (
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            Uploading...
          </p>
        )}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {existingImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {existingImages.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded border overflow-hidden bg-gray-100"
            >
              <img
                src={img.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                disabled={deletingId === img.id}
                aria-label="Delete image"
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full text-xs flex items-center justify-center hover:bg-black disabled:opacity-50"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {existingImages.length === 0 && !uploading && (
        <p className="text-sm text-gray-500">No gallery images yet.</p>
      )}
    </div>
  )
}