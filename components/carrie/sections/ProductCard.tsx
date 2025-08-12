'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

interface Product {
  id: number
  title: string
  description: string
  features: string[]
  image: string
  price: string
}

interface ProductCardProps {
  product: Product
  featuredCategory: string
  cropSettings: { [key: string]: { scale: number; x: number; y: number } }
  getImageUrl: (path: string, isGallery: boolean) => string
}

export default function ProductCard({
  product,
  featuredCategory,
  cropSettings,
  getImageUrl
}: ProductCardProps) {
  const crop = cropSettings[product.image] || { scale: 1, x: 50, y: 50 }

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all border-4 border-slate-600 bg-zinc-100">
      <div className="relative h-56 group overflow-hidden bg-black">
        <div 
          className="absolute inset-0"
          style={{
            transform: `translate(${crop.x - 50}%, ${crop.y - 50}%) scale(${crop.scale})`,
            transition: 'transform 0.3s'
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
      </div>
      
      <CardContent className="pt-2 px-6 pb-3">
        {/* Title */}
        <h3 className="text-xl font-black mb-1 tracking-wide">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-slate-600 mb-1 font-semibold">
          {product.description}
        </p>

        {/* Features */}
        {product.features && (
          <ul className="text-sm text-slate-500 space-y-0.5">
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
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Price */}
        {product.price && (
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
        )}
      </CardContent>
    </Card>
  )
}