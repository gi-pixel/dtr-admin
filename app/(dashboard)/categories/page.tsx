import CategoriesPageClient from '@/components/CategoriesPageClient'
import { getCategoriesWithCounts } from '@/lib/queries'

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts()

  return (
    <div className="p-6 sm:p-8">
      <CategoriesPageClient categories={categories} />
    </div>
  )
}