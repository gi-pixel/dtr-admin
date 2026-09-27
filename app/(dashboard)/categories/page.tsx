import CategoryForm from '@/components/CategoryForm'
import CategoryList from '@/components/CategoryList'
import { getCategories } from '@/lib/queries'

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Categories</h1>

      <section>
        <h2 className="text-lg font-semibold mb-3">Add Category</h2>
        <CategoryForm />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Existing Categories</h2>
        <CategoryList categories={categories} />
      </section>
    </div>
  )
}