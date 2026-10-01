'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2, Tag } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import EmptyState from '@/components/EmptyState'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import CategoryFormDialog from '@/components/CategoryFormDialog'
import { deleteCategory } from '@/lib/mutations'
import { toastSuccess, toastFromError } from '@/lib/toast'

export type CategoryRow = {
  id: string
  name: string
  slug: string
  created_at: string | null
  event_count: number
}

export default function CategoriesTable({
  categories,
  onCreate,
}: {
  categories: CategoryRow[]
  onCreate: () => void
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [deleting, setDeleting] = useState<CategoryRow | null>(null)
  const [removing, setRemoving] = useState(false)

  async function handleDelete() {
    if (!deleting) return
    setRemoving(true)
    try {
      await deleteCategory(deleting.id)
      toastSuccess('Category deleted')
      setDeleting(null)
      router.refresh()
    } catch (err) {
      toastFromError(err, 'Failed to delete category')
    } finally {
      setRemoving(false)
    }
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <EmptyState
          icon={Tag}
          title="No categories yet"
          description="Add your first category to start grouping events."
          action={<Button onClick={onCreate}>Add category</Button>}
        />
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead className="text-center w-[120px]">Events</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground font-mono text-xs">
                  {c.slug}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="tabular-nums">
                    {c.event_count}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => setEditing(c)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setDeleting(c)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit (rename) */}
      <CategoryFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        editing={editing ? { id: editing.id, name: editing.name } : null}
        onSaved={() => {
          setEditing(null)
          router.refresh()
        }}
      />

      {/* Delete confirm */}
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this category?"
        description={
          deleting
            ? deleting.event_count > 0
              ? `"${deleting.name}" will be removed. ${deleting.event_count} ${
                  deleting.event_count === 1 ? 'event' : 'events'
                } will become uncategorized — the events themselves won't be deleted.`
              : `"${deleting.name}" will be removed. It isn't used by any events.`
            : ''
        }
        onConfirm={handleDelete}
        loading={removing}
      />
    </>
  )
}