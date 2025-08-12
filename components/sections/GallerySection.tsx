'use client'

import { useRouter } from 'next/navigation'
import RollingGallery from '@/components/ui/RollingGallery'

interface GallerySectionProps {
  galleryImages: string[]
  galleryCrops: {[key: string]: {scale: number, x: number, y: number}}
  getImageUrl: (imagePath: string) => string
}

export default function GallerySection({ 
  galleryImages, 
  galleryCrops,
  getImageUrl 
}: GallerySectionProps) {
  const router = useRouter()

  // Handle rolling gallery image click - navigate to gallery page
  const handleRollingGalleryClick = (index: number) => {
    router.push(`/gallery?index=${index}`)
  }

  return (
    <section id="gallery" className="pt-20 pb-20 mb-8 bg-zinc-100">
      <div className="container mx-auto px-4">
        <div className="relative max-w-6xl mx-auto">
          <RollingGallery
            images={galleryImages.map(img => getImageUrl(img))}
            autoplay={true}
            pauseOnHover={false}
            onImageClick={handleRollingGalleryClick}
            className="border-8 border-slate-700 bg-black"
          />
        </div>
      </div>
    </section>
  )
}