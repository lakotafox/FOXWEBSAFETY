'use client'

import CategoryButtons from '@/components/products-editor/ui/CategoryButtons'
import MagicBento, { ParticleCard } from '@/components/ui/MagicBento'
import Image from 'next/image'
import { getImageTransform } from '@/lib/utils/imageTransform'
import { getCategoryColor } from '@/lib/utils/categoryColors'
import EditableField from '@/components/products-editor/ui/EditableField'
import { Edit2 } from 'lucide-react'

interface ProductsGridProps {
  productCategory: string
  currentProducts: any[]
  editingId: number | null
  editingCrop: string | null
  cropSettings: {[key: string]: {scale: number, x: number, y: number}}
  setProductCategory: (category: string) => void
  setEditingId: (id: number | null) => void
  setEditingCrop: (crop: string | null) => void
  updateProduct: (productId: number, field: string, value: any) => void
  handleImageUpload: (file: File, productId: number) => void
  getImageUrl: (imagePath: string) => string
}

export default function ProductsGrid({
  productCategory,
  currentProducts,
  editingId,
  editingCrop,
  cropSettings,
  setProductCategory,
  setEditingId,
  setEditingCrop,
  updateProduct,
  handleImageUpload,
  getImageUrl
}: ProductsGridProps) {
  // Get glow color based on category
  const getGlowColor = () => {
    switch(productCategory) {
      case 'new': return '220, 38, 38' // red-600
      case 'battleTested': return '37, 99, 235' // blue-600
      case 'seating': return '34, 197, 94' // green-600
      default: return '132, 0, 255' // purple
    }
  }

  return (
    <section className="py-20 bg-slate-800">
      <div className="container mx-auto px-4">
        {/* Category Buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-700 border-4 border-slate-600 p-2 flex flex-wrap justify-center">
            <CategoryButtons 
              productCategory={productCategory as 'new' | 'battleTested' | 'seating'}
              onCategoryChange={setProductCategory}
            />
          </div>
        </div>

        {/* Products Grid with MagicBento - Show 9 products (3x3) */}
        <MagicBento
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect={true}
          spotlightRadius={typeof window !== 'undefined' && window.innerWidth < 768 ? 450 : 250}
          particleCount={1}
          glowColor={getGlowColor()}
        >
          {currentProducts.slice(0, 9).map((product) => (
            <ParticleCard
              key={product.id}
              className="card featured-card card--border-glow editor-card border-4 border-slate-600"
              style={{
                backgroundColor: '#060010',
                '--glow-color': getGlowColor(),
              } as React.CSSProperties}
              particleCount={1}
              glowColor={getGlowColor()}
              enableTilt={false}
              clickEffect={true}
              enableMagnetism={false}
            >
              <div className="card__image relative group">
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
                <>
                  {/* Image Upload - appears on hover at bottom */}
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
              </div>
              
              <div className="card__content">
                <h2 className="card__title">
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
                </h2>
                
                {product.description && (
                  <p className="card__description">
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
                  </p>
                )}
                
                {product.features && (
                  <ul className="card__features">
                    {product.features.map((feature: string, index: number) => (
                      <li key={index}>
                        <span style={{
                          backgroundColor: productCategory === "new"
                            ? "rgb(220, 38, 38)"
                            : productCategory === "battleTested"
                              ? "rgb(37, 99, 235)"
                              : "rgb(34, 197, 94)"
                        }}></span>
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
                
                {product.price && (
                  <div className="card__price" style={{
                    color: productCategory === "new"
                      ? "rgb(220, 38, 38)"
                      : productCategory === "battleTested"
                        ? "rgb(37, 99, 235)"
                        : "rgb(34, 197, 94)"
                  }}>
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
              </div>
            </ParticleCard>
          ))}
        </MagicBento>
      </div>
    </section>
  )
}