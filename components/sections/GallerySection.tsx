'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isUserControlled, setIsUserControlled] = useState(false)

  // Auto-slide gallery every 4 seconds (only if user hasn't manually navigated)
  useEffect(() => {
    if (isUserControlled) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [galleryImages, isUserControlled])

  const nextSlide = () => {
    setIsUserControlled(true)
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length)
  }

  const prevSlide = () => {
    setIsUserControlled(true)
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  return (
    <section id="gallery" className="py-20 bg-zinc-100">
      <div className="container mx-auto px-4">
        <div className="relative max-w-6xl mx-auto">
          <div className="relative h-96 md:h-[500px] overflow-hidden border-8 border-slate-700 bg-black">
            {galleryImages.map((image, index) => {
              const crop = galleryCrops[image] || { scale: 1, x: 50, y: 50 }
              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      transform: `translate(${crop.x - 50}%, ${crop.y - 50}%) scale(${crop.scale})`
                    }}
                  >
                    <Image 
                      src={getImageUrl(image)} 
                      alt={`Project ${index + 1}`} 
                      width={1000}
                      height={600}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 p-2 md:p-3 border-2 md:border-4 border-white shadow-xl transition-all"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 p-2 md:p-3 border-2 md:border-4 border-white shadow-xl transition-all"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </button>

          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsUserControlled(true)
                  setCurrentSlide(index)
                }}
                className={`w-4 h-4 border-2 border-white transition-all ${
                  index === currentSlide ? "bg-red-600" : "bg-slate-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}