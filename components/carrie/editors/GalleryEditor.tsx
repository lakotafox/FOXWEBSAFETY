'use client'

import Image from 'next/image'
import { X, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GalleryEditorProps {
  show: boolean
  onClose: () => void
  galleryImages: string[]
  mobileGalleryImages?: string[] // Optional for backward compatibility
  onImageUpload: (index: number, file: File, isMobile?: boolean) => void
  getImageUrl: (image: string, isGallery?: boolean) => string
  viewMode?: 'desktop' | 'mobile' // Optional for backward compatibility
  onViewModeChange?: (mode: 'desktop' | 'mobile') => void // Optional for backward compatibility
}

export default function GalleryEditor({ 
  show, 
  onClose, 
  galleryImages,
  mobileGalleryImages, 
  onImageUpload,
  getImageUrl,
  viewMode,
  onViewModeChange
}: GalleryEditorProps) {
  const currentImages = galleryImages // Always use galleryImages
  
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Gallery Images</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-black hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <p className="text-center text-gray-600 mb-4">
          These images will be displayed on all devices
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {currentImages.map((image, index) => (
            <div key={index} className="space-y-2">
              <label className="block text-sm font-medium">
                Image {index + 1}
              </label>
              <div className="relative aspect-video bg-black rounded border-2 border-dashed border-gray-300 overflow-hidden group">
                {image && (
                  <Image 
                    src={getImageUrl(image, true)} 
                    alt={`Gallery ${index + 1}`} 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                )}
                <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                  <div className="text-white opacity-0 group-hover:opacity-100 text-center">
                    <Edit2 className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">Click to change</span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onImageUpload(index, file, false) // Always false since we only have one gallery
                    }}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => {
              onClose()
              // Gallery changes are now staged in pendingGalleryImages
              // They will be published when user clicks Publish button
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}