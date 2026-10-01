'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategory, renameCategory } from '@/lib/mutations'
import { toastSuccess, toastFromError } from '@/lib/toast'

export default function CategoryFormDialog({
  open,
  onOpenChange,
  onSaved,
  editing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editing?: { id: string; name: string } | null
}) {
  const isEdit = Boolean(editing)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      setError(null)
    }
  }, [open, editing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name is required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (isEdit && editing) {
        await renameCategory(editing.id, trimmed)
        toastSuccess('Category renamed')
      } else {
        await createCategory(trimmed)
        toastSuccess('Category added')
      }
      onOpenChange(false)
      onSaved()
    } catch (err: any) {
      const msg = err?.message ?? ''
      if (msg.includes('duplicate key') || msg.includes('unique')) {
        setError('A category with this name already exists')
      } else {
        setError(msg || 'Something went wrong')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Rename category' : 'Add category'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'The slug will be regenerated to match the new name.'
              : 'Categories group related events. Slugs are generated automatically.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              autoFocus
              value={name}
              disabled={saving}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nightlife, Concerts, Festival"
            />
            {error && (
              <p className="text-xs text-destructive mt-1">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Add category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}