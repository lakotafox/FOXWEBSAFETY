'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ComingSoonModal from '@/components/ui/ComingSoonModal'

interface Product {
  id: number
  title: string
  description: string
  features: string[]
  image: string
  price: string
}

interface FeaturedProductsProps {
  isEditMode: boolean
  featuredCategory: string
  featuredProducts: { [key: string]: Product[] }
  editingId: number | null
  cropSettings: { [key: string]: { scale: number; x: number; y: number } }
  editingCrop: string | null
  onCategorySelect: (category: string) => void
  onEditingIdChange: (id: number | null) => void
  onUpdateProduct: (category: string, productId: number, field: string, value: any) => void
  onImageUpload: (category: string, productId: number, file: File) => void
  onSetEditingCrop: (imageKey: string | null) => void
  getImageUrl: (path: string, isGallery: boolean) => string
}

export default function FeaturedProducts({
  isEditMode,
  featuredCategory,
  featuredProducts,
  editingId,
  cropSettings,
  editingCrop,
  onCategorySelect,
  onEditingIdChange,
  onUpdateProduct,
  onImageUpload,
  onSetEditingCrop,
  getImageUrl
}: FeaturedProductsProps) {
  const [showComingSoon, setShowComingSoon] = useState(false)
  
  return (
    <section className="py-20 bg-slate-800">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-black text-center text-white mb-16 tracking-tight">
          FEATURED <span className="text-blue-400">PRODUCTS</span>
        </h2>

        {/* Category Buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-700 border-4 border-slate-600 p-2 flex flex-wrap justify-center">
            <Button
              className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                featuredCategory === "new"
                  ? "bg-red-600 text-white border-2 border-red-600"
                  : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
              }`}
              onClick={() => onCategorySelect("new")}
            >
              NEW
            </Button>
            <Button
              className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                featuredCategory === "battleTested"
                  ? "bg-blue-600 text-white border-2 border-blue-600"
                  : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
              }`}
              onClick={() => onCategorySelect("battleTested")}
            >
              BATTLE TESTED
            </Button>
            <Button
              className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                featuredCategory === "seating"
                  ? "bg-green-600 text-white border-2 border-green-600"
                  : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
              }`}
              onClick={() => onCategorySelect("seating")}
            >
              CHAIRS
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {featuredProducts[featuredCategory].map((product) => (
            <Card
              key={product.id}
              className={`overflow-hidden hover:shadow-2xl transition-all border-4 border-slate-600 bg-zinc-100 ${
                isEditMode ? `ring-2 ${
                  featuredCategory === "new"
                    ? "ring-red-500"
                    : featuredCategory === "battleTested"
                      ? "ring-blue-500"
                      : "ring-green-500"
                }` : ""
              }`}
            >
              <div className="relative h-56 group overflow-hidden bg-black">
                {(() => {
                  const crop = cropSettings[product.image] || { scale: 1, x: 50, y: 50 }
                  const isEditing = editingCrop === product.image
                  
                  return (
                    <>
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
                      
                      {isEditMode && !isEditing && (
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
                    </>
                  )
                })()}
              </div>
              <CardContent className="p-6">
                {/* Title */}
                {isEditMode && editingId === product.id ? (
                  <input
                    type="text"
                    value={product.title}
                    onChange={(e) => onUpdateProduct(featuredCategory, product.id, 'title', e.target.value)}
                    className="text-xl font-black mb-3 tracking-wide w-full p-1 border rounded"
                    onBlur={() => onEditingIdChange(null)}
                    autoFocus
                  />
                ) : (
                  <h3 
                    className={`text-xl font-black mb-3 tracking-wide ${
                      isEditMode ? "cursor-pointer hover:bg-yellow-100 p-1 rounded" : ""
                    }`}
                    onClick={() => isEditMode && onEditingIdChange(product.id)}
                  >
                    {product.title}
                  </h3>
                )}

                {/* Description */}
                {isEditMode && editingId === -product.id ? (
                  <textarea
                    value={product.description}
                    onChange={(e) => onUpdateProduct(featuredCategory, product.id, 'description', e.target.value)}
                    className="text-slate-600 mb-4 font-semibold w-full p-1 border rounded resize-none"
                    rows={2}
                    onBlur={() => onEditingIdChange(null)}
                    autoFocus
                  />
                ) : (
                  <p 
                    className={`text-slate-600 mb-4 font-semibold ${
                      isEditMode ? "cursor-pointer hover:bg-yellow-100 p-1 rounded" : ""
                    }`}
                    onClick={() => isEditMode && onEditingIdChange(-product.id)}
                  >
                    {product.description}
                  </p>
                )}

                {/* Features */}
                {product.features && (
                  <ul className="text-sm text-slate-500 mb-4 space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            featuredCategory === "new"
                              ? "bg-red-600"
                              : featuredCategory === "battleTested"
                                ? "bg-blue-600"
                                : "bg-green-600"
                          }`}
                        ></span>
                        {isEditMode && editingId === product.id * 1000 + index ? (
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...product.features]
                              newFeatures[index] = e.target.value
                              onUpdateProduct(featuredCategory, product.id, 'features', newFeatures)
                            }}
                            onBlur={() => onEditingIdChange(null)}
                            onKeyPress={(e) => e.key === 'Enter' && onEditingIdChange(null)}
                            className="flex-1 p-1 border rounded text-sm"
                            autoFocus
                          />
                        ) : (
                          <span 
                            className={isEditMode ? "cursor-pointer hover:bg-yellow-100 p-1 rounded" : ""}
                            onClick={() => isEditMode && onEditingIdChange(product.id * 1000 + index)}
                          >
                            {feature}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Price */}
                <div className="flex justify-between items-center">
                  {isEditMode && editingId === product.id * 10000 ? (
                    <input
                      type="text"
                      value={product.price}
                      onChange={(e) => onUpdateProduct(featuredCategory, product.id, 'price', e.target.value)}
                      onBlur={() => onEditingIdChange(null)}
                      onKeyPress={(e) => e.key === 'Enter' && onEditingIdChange(null)}
                      className={`text-2xl font-black p-1 border rounded ${
                        featuredCategory === "new"
                          ? "text-red-600"
                          : featuredCategory === "battleTested"
                            ? "text-blue-600"
                            : "text-green-600"
                      }`}
                      placeholder="e.g., $1,299"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`text-2xl font-black ${
                        featuredCategory === "new"
                          ? "text-red-600"
                          : featuredCategory === "battleTested"
                            ? "text-blue-600"
                            : "text-green-600"
                      } ${isEditMode ? "cursor-pointer hover:bg-yellow-100 p-1 rounded" : ""}`}
                      onClick={() => isEditMode && onEditingIdChange(product.id * 10000)}
                    >
                      {product.price}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* MORE button */}
        <div className="flex justify-center mt-12">
          <Button
            onClick={() => setShowComingSoon(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-black text-xl px-12 py-6 tracking-wide border-4 border-green-600 hover:border-green-700 transition-all"
          >
            MORE
          </Button>
        </div>
      </div>
      
      {/* Coming Soon Modal */}
      <ComingSoonModal isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} />
    </section>
  )
}