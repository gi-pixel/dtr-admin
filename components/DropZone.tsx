'use client'

import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DropZone({
  onFiles,
  accept = 'image/*',
  multiple = false,
  label = 'Drop files here or click to upload',
  hint,
  disabled,
  className,
}: {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  label?: string
  hint?: string
  disabled?: boolean
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    onFiles(Array.from(list))
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        if (disabled) return
        handleFiles(e.dataTransfer.files)
      }}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition',
        dragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/60',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm font-medium">{label}</p>
      {hint && (
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      )}
    </div>
  )
}