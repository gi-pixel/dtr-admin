'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

import PageHeader from './PageHeader'
import CategoriesTable, { type CategoryRow } from './CategoriesTable'
import CategoryFormDialog from './CategoryFormDialog'
import { Button } from '@/components/ui/button'

export default function CategoriesPageClient({
  categories,
}: {
  categories: CategoryRow[]
}) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group events into categories for easier filtering and discovery."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add category
          </Button>
        }
      />

      <CategoriesTable
        categories={categories}
        onCreate={() => setCreateOpen(true)}
      />

      <CategoryFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={() => {
          setCreateOpen(false)
          router.refresh()
        }}
      />
    </>
  )
}