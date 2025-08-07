'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Edit2 } from 'lucide-react'
import { getImageTransform } from '@/lib/utils/imageTransform'
import { getCategoryColor } from '@/lib/utils/categoryColors'
import EditableField from './EditableField'

interface Product {
  id: number
  title: string
  image: string
  description: string
  features?: string[]
  price: string
}

interface ProductCardProps {
  product: Product
  productCategory: string
  editingId: number | null
  editingCrop: string | null
  cropSettings: {[key: string]: {scale: number, x: number, y: number}}
  setEditingId: (id: number | null) => void
  setEditingCrop: (image: string | null) => void
  updateProduct: (id: number, field: string, value: any) => void
  handleImageUpload: (file: File, productId: number) => void
  getImageUrl: (imagePath: string) => string
}

export default function ProductCard({
  product,
  productCategory,
  editingId,
  editingCrop,
  cropSettings,
  setEditingId,
  setEditingCrop,
  updateProduct,
  handleImageUpload,
  getImageUrl
}: ProductCardProps) {
  return (
    <Card
      className={`overflow-hidden hover:shadow-2xl transition-all border-4 border-slate-600 bg-zinc-100 ring-2 ${getCategoryColor(productCategory, 'ring')}`}
    >
      <div className="relative h-56 group overflow-hidden bg-black">
        <div 
          className="absolute inset-0"
          style={{ transform: getImageTransform(product.image, cropSettings) }}
        >
          <Image 
            src={getImageUrl(product.image)} 
            alt={product.title} 
            width={500}
            height={500}
            className="w-full h-full object-contain"
            unoptimized
          />
        </div>
        
        {/* Edit Controls */}
        {
          <>
            {/* Image Upload - appears on hover at bottom like main page editor */}
            {editingCrop !== product.image && (
              <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <label className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded cursor-pointer flex items-center gap-2 font-bold shadow-lg">
                  <Edit2 className="w-4 h-4" />
                  Change Image
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, product.id)
                    }}
                  />
                </label>
              </div>
            )}

            {/* Crop Controls */}
            <div className={`absolute top-2 right-2 ${editingCrop === product.image ? 'z-30' : 'z-10'}`}>
              <button
                onClick={() => setEditingCrop(editingCrop === product.image ? null : product.image)}
                className="hover:scale-110 transition-transform"
              >
                {editingCrop === product.image ? (
                  <Image src="/icons/unlocked.jpeg" alt="Save" width={48} height={48} />
                ) : (
                  <Image src="/icons/locked.jpeg" alt="Resize" width={48} height={48} />
                )}
              </button>
            </div>

          </>
        }
      </div>
      
      <CardContent className="pt-2 px-6 pb-3">
        {/* Title */}
        <h3 className="text-xl font-black mb-1 tracking-wide">
          <EditableField
            value={product.title}
            isEditing={editingId === product.id}
            onStartEdit={() => setEditingId(product.id)}
            onEndEdit={() => setEditingId(null)}
            onChange={(value) => updateProduct(product.id, 'title', value)}
            type="text"
            className={{
              display: "cursor-pointer hover:text-red-600",
              input: "text-xl font-black tracking-wide w-full p-1 border rounded"
            }}
          />
        </h3>
        
        {/* Description */}
        <div className="text-slate-600 mb-1 font-semibold">
          <EditableField
            value={product.description}
            isEditing={editingId === -product.id}
            onStartEdit={() => setEditingId(-product.id)}
            onEndEdit={() => setEditingId(null)}
            onChange={(value) => updateProduct(product.id, 'description', value)}
            type="textarea"
            className={{
              display: "cursor-pointer hover:text-red-600",
              input: "text-slate-600 font-semibold w-full p-1 border rounded"
            }}
            rows={2}
          />
        </div>
        
        {/* Features */}
        {product.features && (
          <ul className="text-sm text-slate-500 space-y-0.5">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${getCategoryColor(productCategory, 'bg')}`}
                ></span>
                <EditableField
                  value={feature}
                  isEditing={editingId === product.id * 1000 + index}
                  onStartEdit={() => setEditingId(product.id * 1000 + index)}
                  onEndEdit={() => setEditingId(null)}
                  onChange={(value) => {
                    const newFeatures = [...product.features!]
                    newFeatures[index] = value
                    updateProduct(product.id, 'features', newFeatures)
                  }}
                  type="text"
                  className={{
                    display: "cursor-pointer hover:text-red-600 flex-1",
                    input: "flex-1 p-1 border-b border-gray-300"
                  }}
                />
              </li>
            ))}
          </ul>
        )}
        
        {/* Price */}
        {(product.price || editingId === product.id * 10000) && (
          <div className={`text-2xl font-black ${getCategoryColor(productCategory)}`}>
          <EditableField
            value={product.price}
            isEditing={editingId === product.id * 10000}
            onStartEdit={() => setEditingId(product.id * 10000)}
            onEndEdit={() => setEditingId(null)}
            onChange={(value) => updateProduct(product.id, 'price', value)}
            type="text"
            className={{
              display: "cursor-pointer hover:underline",
              input: `text-2xl font-black p-1 border rounded ${getCategoryColor(productCategory)}`
            }}
          />
          </div>
        )}
      </CardContent>
    </Card>
  )
}