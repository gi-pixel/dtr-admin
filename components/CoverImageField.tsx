'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import DropZone from './DropZone'
import { Button } from '@/components/ui/button'

export default function CoverImageField({
  currentUrl,
  file,
  onChange,
  onClear,
}: {
  currentUrl: string | null
  file: File | null
  onChange: (file: File | null) => void
  onClear: () => void
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  function handleFiles(files: File[]) {
    const f = files[0]
    if (!f) return
    onChange(f)
    const url = URL.createObjectURL(f)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
  }

  const display = previewUrl ?? currentUrl

  if (display) {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted group">
        <Image
          src={display}
          alt="Cover"
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
          unoptimized={!!previewUrl}
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => {
            onChange(null)
            onClear()
            setPreviewUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev)
              return null
            })
          }}
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition"
          aria-label="Remove cover"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <DropZone
      onFiles={handleFiles}
      accept="image/*"
      label="Upload a cover image"
      hint="PNG or JPG, wide format works best"
    />
  )
}