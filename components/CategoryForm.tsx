'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory } from '@/lib/mutations'

export default function CategoryForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      await createCategory(name.trim())
      setName('')
      router.refresh()
    } catch (err: any) {
      const message = err?.message ?? ''
      if (message.includes('duplicate key') || message.includes('unique')) {
        setError('A category with this name already exists')
      } else {
        setError(message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 max-w-md">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          disabled={loading}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 border rounded px-3 py-2 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </form>
  )
}