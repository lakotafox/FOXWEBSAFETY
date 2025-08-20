'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ComingSoonModal from '@/components/ui/ComingSoonModal'
import MagicBento, { ParticleCard } from '@/components/ui/MagicBento'
import CroppedImageWithLoader from '@/components/ui/CroppedImageWithLoader'
import ProductCard from './ProductCard'
import ProductEditor from './ProductEditor'
import CropControls from './CropControls'
import { defaultMainProducts } from '@/lib/main-products-data'

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
  
  // Use default products if the category is missing
  const categoryProducts = featuredProducts[featuredCategory] || defaultMainProducts[featuredCategory] || []
  
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

        {/* Product Grid - MagicBento for edit mode, regular grid for display */}
        {isEditMode ? (
          <MagicBento
            textAutoHide={false}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={false}
            enableMagnetism={false}
            clickEffect={true}
            glowColor={
              featuredCategory === "new" ? "220, 38, 38" :
              featuredCategory === "battleTested" ? "37, 99, 235" :
              "34, 197, 94"
            }
          >
            {categoryProducts.length > 0 ? categoryProducts.slice(0, 3).map((product) => (
              <ParticleCard
                key={product.id}
                className={`card featured-card card--border-glow ${
                  featuredCategory === "new"
                    ? "ring-2 ring-red-500"
                    : featuredCategory === "battleTested"
                      ? "ring-2 ring-blue-500"
                      : "ring-2 ring-green-500"
                }`}
                style={{
                  backgroundColor: '#060010',
                  '--glow-color': featuredCategory === "new" ? "220, 38, 38" :
                                   featuredCategory === "battleTested" ? "37, 99, 235" :
                                   "34, 197, 94",
                } as React.CSSProperties}
                particleCount={1}
                glowColor={
                  featuredCategory === "new" ? "220, 38, 38" :
                  featuredCategory === "battleTested" ? "37, 99, 235" :
                  "34, 197, 94"
                }
                enableTilt={false}
                clickEffect={true}
                enableMagnetism={false}
                alwaysShowParticles={true}
              >
                {/* Use same image container structure as main page but with CropControls for editing */}
                <div className="card__image relative">
                  <CropControls
                    product={product}
                    featuredCategory={featuredCategory}
                    cropSettings={cropSettings}
                    editingCrop={editingCrop}
                    onImageUpload={onImageUpload}
                    onSetEditingCrop={onSetEditingCrop}
                    getImageUrl={getImageUrl}
                  />
                </div>
                
                {/* Use same content structure as main page */}
                <div className="card__content">
                  <ProductEditor
                    product={product}
                    featuredCategory={featuredCategory}
                    editingId={editingId}
                    onEditingIdChange={onEditingIdChange}
                    onUpdateProduct={onUpdateProduct}
                  />
                </div>
              </ParticleCard>
            )) : null}
          </MagicBento>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {categoryProducts.length > 0 ? categoryProducts.slice(0, 3).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                featuredCategory={featuredCategory}
                cropSettings={cropSettings}
                getImageUrl={getImageUrl}
              />
            )) : null}
          </div>
        )}
        
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