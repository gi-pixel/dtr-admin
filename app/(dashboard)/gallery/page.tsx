import PageHeader from '@/components/PageHeader'
import MediaLibraryUploader from '@/components/MediaLibraryUploader'
import { getMediaLibrary } from '@/lib/queries'

export default async function GalleryPage() {
  const images = await getMediaLibrary()

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Gallery"
        description="Images uploaded here appear on the public /gallery page."
      />
      <MediaLibraryUploader images={images} />
    </div>
  )
}