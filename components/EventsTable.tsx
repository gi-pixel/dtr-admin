'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ImageIcon,
  MoreHorizontal,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Star,
  Plus,
  Search,
} from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import { cn } from '@/lib/utils'
import { deleteEvent, setEventStatus } from '@/lib/mutations'
import { toastSuccess, toastFromError } from '@/lib/toast'

export type TableEvent = {
  id: string
  title: string
  slug: string
  image_url: string | null
  event_date: string
  event_time: string | null
  venue_name: string | null
  status: string
  is_featured: boolean | null
  created_at: string
  category_id: string | null
  categories: { id: string; name: string } | { id: string; name: string }[] | null
}

type Category = { id: string; name: string }

const PAGE_SIZE = 10

function categoryOf(
  c: TableEvent['categories']
): { id: string; name: string } | null {
  if (!c) return null
  if (Array.isArray(c)) return c[0] ?? null
  return c
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function EventsTable({
  events,
  categories,
  onRowClick,
}: {
  events: TableEvent[]
  categories: Category[]
  onRowClick?: (event: TableEvent) => void
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const [pendingId, setPendingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<TableEvent | null>(null)
  const [deleting, setDeleting] = useState(false)

  // -------- Filtering --------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return events.filter((e) => {
      if (q && !e.title.toLowerCase().includes(q)) return false
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (categoryFilter !== 'all') {
        const cat = categoryOf(e.categories)
        if (!cat || cat.id !== categoryFilter) return false
      }
      return true
    })
  }, [events, search, statusFilter, categoryFilter])

  // -------- Pagination --------
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageEvents = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  // Reset page when filters change
  useMemo(() => {
    setPage(1)
  }, [search, statusFilter, categoryFilter])

  // -------- Actions --------
  async function togglePublish(event: TableEvent) {
    const next = event.status === 'published' ? 'draft' : 'published'
    setPendingId(event.id)
    try {
      await setEventStatus(event.id, next)
      toastSuccess(
        next === 'published' ? 'Event published' : 'Event unpublished'
      )
      router.refresh()
    } catch (err) {
      toastFromError(err, 'Failed to update status')
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await deleteEvent(confirmDelete.id)
      toastSuccess('Event deleted')
      setConfirmDelete(null)
      router.refresh()
    } catch (err) {
      toastFromError(err, 'Failed to delete event')
    } finally {
      setDeleting(false)
    }
  }

  // -------- Render --------
  if (events.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <EmptyState
          icon={ImageIcon}
          title="No events yet"
          description="Create your first event to see it appear here."
          action={
            <Button asChild>
              <Link href="/events/new">
                <Plus className="mr-2 h-4 w-4" />
                Create your first event
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px] text-center">
                  <Star className="h-4 w-4 mx-auto" />
                </TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      No events match your filters.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                pageEvents.map((event) => {
                  const cat = categoryOf(event.categories)
                  return (
                    <TableRow
                      key={event.id}
                      onClick={() => onRowClick?.(event)}
                      className={cn(
                        onRowClick && 'cursor-pointer',
                        pendingId === event.id && 'opacity-60'
                      )}
                    >
                      <TableCell>
                        <div className="relative h-12 w-16 rounded overflow-hidden bg-muted">
                          {event.image_url ? (
                            <Image
                              src={event.image_url}
                              alt={event.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium max-w-[280px] truncate">
                          {event.title}
                        </div>
                        {event.venue_name && (
                          <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                            {event.venue_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatDate(event.event_date)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cat?.name ?? '—'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={event.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        {event.is_featured && (
                          <Star className="h-4 w-4 inline text-primary fill-primary" />
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => onRowClick?.(event)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/events/${event.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => togglePublish(event)}
                            >
                              {event.status === 'published' ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => setConfirmDelete(event)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
            <p className="text-muted-foreground">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-muted-foreground tabular-nums">
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Delete this event?"
        description={
          confirmDelete
            ? `"${confirmDelete.title}" will be permanently removed along with its gallery images. This cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}