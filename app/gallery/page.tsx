"use client"

import { useState, useEffect, Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import FlyingPosters from '@/components/ui/FlyingPosters'

function GalleryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialIndex = parseInt(searchParams.get('index') || '0')
  
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [mobileGalleryImages, setMobileGalleryImages] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Load gallery images from content.json
    const loadGalleryImages = async () => {
      try {
        const response = await fetch('/content.json')
        if (response.ok) {
          const data = await response.json()
          if (data.gallery) {
            setGalleryImages(data.gallery)
          }
          if (data.mobileGallery) {
            setMobileGalleryImages(data.mobileGallery)
          }
        }
      } catch (err) {
        console.log('Could not load gallery images:', err)
        // Try localStorage as fallback
        const savedGallery = localStorage.getItem('foxbuilt-gallery')
        if (savedGallery) {
          try {
            const images = JSON.parse(savedGallery)
            setGalleryImages(images)
          } catch (e) {
            console.error('Error parsing saved gallery:', e)
          }
        }
        
        const savedMobileGallery = localStorage.getItem('foxbuilt-mobile-gallery')
        if (savedMobileGallery) {
          try {
            const images = JSON.parse(savedMobileGallery)
            setMobileGalleryImages(images)
          } catch (e) {
            console.error('Error parsing saved mobile gallery:', e)
          }
        }
      }
    }
    
    loadGalleryImages()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const images = isMobile ? mobileGalleryImages : galleryImages

  return (
    <div className="min-h-screen bg-slate-800 relative flex items-center justify-center">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-8 left-8 z-50 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Flying Posters Carousel */}
      {images.length > 0 && (
        <div className="w-full max-w-7xl px-4">
          <FlyingPosters 
            items={images}
            height={isMobile ? '400px' : '600px'}
            initialIndex={initialIndex}
            onFullImageToggle={() => {}}
          />
        </div>
      )}
    </div>
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  )
}