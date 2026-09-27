'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCategory } from '@/lib/mutations'

type Category = { id: string; name: string; slug: string }

export default function CategoryList({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete category "${name}"? This cannot be undone.`)) {
      return
    }

    setDeletingId(id)
    try {
      await deleteCategory(id)
      router.refresh()
    } catch (err: any) {
      alert(err?.message ?? 'Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  if (categories.length === 0) {
    return <p className="text-gray-500 py-6">No categories yet.</p>
  }

  return (
    <ul className="border rounded divide-y max-w-md bg-white">
      {categories.map((c) => (
        <li key={c.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-gray-500">{c.slug}</p>
          </div>
          <button
            onClick={() => handleDelete(c.id, c.name)}
            disabled={deletingId === c.id}
            className="text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            {deletingId === c.id ? 'Deleting...' : 'Delete'}
          </button>
        </li>
      ))}
    </ul>
  )
}