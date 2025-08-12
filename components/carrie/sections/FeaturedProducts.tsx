'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ComingSoonModal from '@/components/ui/ComingSoonModal'
import ProductCard from './ProductCard'
import ProductEditor from './ProductEditor'
import CropControls from './CropControls'

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
          {featuredProducts[featuredCategory].map((product) => {
            // Use ProductCard for display mode, or Card with editing components for edit mode
            if (!isEditMode) {
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  featuredCategory={featuredCategory}
                  cropSettings={cropSettings}
                  getImageUrl={getImageUrl}
                />
              )
            }

            return (
              <Card
                key={product.id}
                className={`overflow-hidden hover:shadow-2xl transition-all border-4 border-slate-600 bg-zinc-100 ring-2 ${
                  featuredCategory === "new"
                    ? "ring-red-500"
                    : featuredCategory === "battleTested"
                      ? "ring-blue-500"
                      : "ring-green-500"
                }`}
              >
                <CropControls
                  product={product}
                  featuredCategory={featuredCategory}
                  cropSettings={cropSettings}
                  editingCrop={editingCrop}
                  onImageUpload={onImageUpload}
                  onSetEditingCrop={onSetEditingCrop}
                  getImageUrl={getImageUrl}
                />
                <CardContent className="pt-2 px-6 pb-3">
                  <ProductEditor
                    product={product}
                    featuredCategory={featuredCategory}
                    editingId={editingId}
                    onEditingIdChange={onEditingIdChange}
                    onUpdateProduct={onUpdateProduct}
                  />
                </CardContent>
              </Card>
            )
          })}
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