'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ComingSoonModal from '@/components/ui/ComingSoonModal'

interface FeaturedProductsProps {
  featuredProducts: any
  cropSettings: {[key: string]: {scale: number, x: number, y: number}}
  getImageUrl: (imagePath: string) => string
}

export default function FeaturedProducts({ 
  featuredProducts, 
  cropSettings,
  getImageUrl 
}: FeaturedProductsProps) {
  const [featuredCategory, setFeaturedCategory] = useState("new")
  const [showComingSoon, setShowComingSoon] = useState(false)

  return (
    <section id="featured" className="py-20 bg-slate-800">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-black text-center text-white mb-16 tracking-tight">
          FEATURED <span className="text-blue-400">PRODUCTS</span>
        </h2>

        {/* Category Buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-700 border-4 border-slate-600 p-2 flex flex-wrap justify-center">
            <Button
              id="category-new"
              className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                featuredCategory === "new"
                  ? "bg-red-600 text-white border-2 border-red-600"
                  : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
              }`}
              onClick={() => setFeaturedCategory("new")}
            >
              NEW
            </Button>
            <Button
              id="category-battleTested"
              className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                featuredCategory === "battleTested"
                  ? "bg-blue-600 text-white border-2 border-blue-600"
                  : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
              }`}
              onClick={() => setFeaturedCategory("battleTested")}
            >
              PRE-OWNED
            </Button>
            <Button
              id="category-seating"
              className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                featuredCategory === "seating"
                  ? "bg-green-600 text-white border-2 border-green-600"
                  : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
              }`}
              onClick={() => setFeaturedCategory("seating")}
            >
              CHAIRS
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {featuredProducts[featuredCategory] && featuredProducts[featuredCategory].map((product: any) => (
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
              <div className="relative h-56 overflow-hidden bg-black">
                {(() => {
                  const crop = cropSettings[product.image] || { scale: 1, x: 50, y: 50 }
                  return (
                    <div 
                      className="absolute inset-0"
                      style={{
                        transform: `translate(${crop.x - 50}%, ${crop.y - 50}%) scale(${crop.scale})`
                      }}
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
                  )
                })()}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-black mb-3 tracking-wide">{product.title}</h3>
                <p className="text-slate-600 mb-4 font-semibold">{product.description}</p>
                {product.features && (
                  <ul className="text-sm text-slate-500 mb-4 space-y-1">
                    {product.features.map((feature: string, index: number) => (
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
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-between items-center">
                  <span
                    className={`text-2xl font-black ${
                      featuredCategory === "new"
                        ? "text-red-600"
                        : featuredCategory === "battleTested"
                          ? "text-blue-600"
                          : "text-green-600"
                    }`}
                  >
                    {product.price}
                  </span>
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