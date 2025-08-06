'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GallerySectionProps {
  isEditMode: boolean
  pendingGalleryImages: string[]
  currentSlide: number
  cropSettings: {[key: string]: {scale: number, x: number, y: number}}
  editingCrop: string | null
  onEditGallery: () => void
  onSetCurrentSlide: (index: number) => void
  onSetEditingCrop: (image: string | null) => void
  onNextSlide: () => void
  onPrevSlide: () => void
  getImageUrl: (path: string, isGallery: boolean) => string
}

export default function GallerySection({
  isEditMode,
  pendingGalleryImages,
  currentSlide,
  cropSettings,
  editingCrop,
  onEditGallery,
  onSetCurrentSlide,
  onSetEditingCrop,
  onNextSlide,
  onPrevSlide,
  getImageUrl
}: GallerySectionProps) {
  return (
    <section id="gallery" className="py-20 bg-zinc-100">
      <div className="container mx-auto px-4">
        <div className="relative max-w-6xl mx-auto">
          {isEditMode && (
            <div className="text-center mb-4">
              <Button
                onClick={onEditGallery}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Gallery Images
              </Button>
            </div>
          )}
          <div className="relative h-96 md:h-[500px] overflow-hidden border-8 border-slate-700 group bg-black">
            {pendingGalleryImages.map((image, index) => {
              const crop = cropSettings[image] || { scale: 1, x: 50, y: 50 }
              const isEditing = editingCrop === image
              const isActive = index === currentSlide
              
              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      transform: `translate(${crop.x - 50}%, ${crop.y - 50}%) scale(${crop.scale})`,
                      transition: isEditing ? 'none' : 'transform 0.3s'
                    }}
                  >
                    <Image 
                      src={getImageUrl(image, true)} 
                      alt={`Project ${index + 1}`} 
                      width={1000}
                      height={600}
                      className="w-full h-full object-contain"
                      unoptimized
                      priority={index === 0}
                    />
                  </div>
                  
                  {isEditMode && isActive && !isEditing && (
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={() => onSetEditingCrop(image)}
                        className="hover:scale-110 transition-transform"
                      >
                        <Image
                          src="/icons/locked.jpeg"
                          alt="Resize"
                          width={48}
                          height={48}
                          className="drop-shadow-lg"
                        />
                      </button>
                    </div>
                  )}
                  
                  {isEditing && isActive && (
                    <div className="absolute top-2 right-2 z-30">
                      <button
                        onClick={() => onSetEditingCrop(null)}
                        className="hover:scale-110 transition-transform"
                      >
                        <Image
                          src="/icons/unlocked.jpeg"
                          alt="Save"
                          width={48}
                          height={48}
                          className="drop-shadow-lg"
                        />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={onPrevSlide}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 p-2 md:p-3 border-2 md:border-4 border-white shadow-xl transition-all z-30"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </button>
          <button
            onClick={onNextSlide}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 p-2 md:p-3 border-2 md:border-4 border-white shadow-xl transition-all z-30"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </button>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {pendingGalleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => onSetCurrentSlide(index)}
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