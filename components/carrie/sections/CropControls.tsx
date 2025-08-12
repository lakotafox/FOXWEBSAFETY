'use client'

import Image from 'next/image'
import { Edit2 } from 'lucide-react'

interface Product {
  id: number
  title: string
  description: string
  features: string[]
  image: string
  price: string
}

interface CropControlsProps {
  product: Product
  featuredCategory: string
  cropSettings: { [key: string]: { scale: number; x: number; y: number } }
  editingCrop: string | null
  onImageUpload: (category: string, productId: number, file: File) => void
  onSetEditingCrop: (imageKey: string | null) => void
  getImageUrl: (path: string, isGallery: boolean) => string
}

export default function CropControls({
  product,
  featuredCategory,
  cropSettings,
  editingCrop,
  onImageUpload,
  onSetEditingCrop,
  getImageUrl
}: CropControlsProps) {
  const crop = cropSettings[product.image] || { scale: 1, x: 50, y: 50 }
  const isEditing = editingCrop === product.image

  return (
    <div className="relative h-56 group overflow-hidden bg-black">
      <div 
        className="absolute inset-0"
        style={{
          transform: `translate(${crop.x - 50}%, ${crop.y - 50}%) scale(${crop.scale})`,
          transition: isEditing ? 'none' : 'transform 0.3s'
        }}
      >
        <Image 
          src={getImageUrl(product.image, false)} 
          alt={product.title} 
          width={500}
          height={500}
          className="w-full h-full object-contain"
          unoptimized
          key={product.image}
        />
      </div>
      
      {!isEditing && (
        <>
          <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <label className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded cursor-pointer flex items-center gap-2 font-bold shadow-lg">
              <Edit2 className="w-4 h-4" />
              Change Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onImageUpload(featuredCategory, product.id, file)
                }}
              />
            </label>
          </div>
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={() => onSetEditingCrop(product.image)}
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
        </>
      )}
      
      {isEditing && (
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
}