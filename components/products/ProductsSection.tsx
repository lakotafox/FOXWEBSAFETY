'use client'

import { useRef } from 'react'
import Image from 'next/image'
import CroppedImageWithLoader from '@/components/ui/CroppedImageWithLoader'
import MagicBento, { ParticleCard } from '@/components/ui/MagicBento'

interface Product {
  id: number
  title: string
  image: string
  description: string
  features: string[]
  price: string
}

interface ProductsSectionProps {
  products: Product[]
  category: string
  cropSettings: {[key: string]: {scale: number, x: number, y: number}}
  onImageClick: (imageSrc: string, imageAlt: string, category: string, index: number) => void
  isCarouselOpen?: boolean
}

export default function ProductsSection({ 
  products, 
  category, 
  cropSettings, 
  onImageClick,
  isCarouselOpen = false
}: ProductsSectionProps) {
  // Image URL helper function
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg"
    return imagePath
  }

  // Get glow color based on category
  const getGlowColor = () => {
    switch(category) {
      case 'new': return '220, 38, 38' // red-600
      case 'battleTested': return '37, 99, 235' // blue-600
      case 'seating': return '34, 197, 94' // green-600
      default: return '132, 0, 255' // purple
    }
  }

  return (
    <section className="py-20 bg-slate-800">
      <div className="container mx-auto px-4">
        {/* Products Grid with MagicBento */}
        <MagicBento
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={typeof window !== 'undefined' && window.innerWidth >= 768 && !isCarouselOpen}
          enableBorderGlow={typeof window !== 'undefined' && window.innerWidth >= 768 && !isCarouselOpen}
          enableTilt={true}
          enableMagnetism={false}
          clickEffect={true}
          spotlightRadius={typeof window !== 'undefined' && window.innerWidth < 768 ? 450 : 250}
          particleCount={1}
          glowColor={getGlowColor()}
          disableAnimations={isCarouselOpen}
        >
          {products.map((product, index) => (
            <ParticleCard
              key={product.id}
              className={`card featured-card card--border-glow ${
                category === "new"
                  ? "ring-2 ring-red-500"
                  : category === "battleTested"
                    ? "ring-2 ring-blue-500"
                    : "ring-2 ring-green-500"
              }`}
              style={{
                backgroundColor: '#060010',
                '--glow-color': getGlowColor(),
              } as React.CSSProperties}
              particleCount={1}
              glowColor={getGlowColor()}
              enableTilt={!isCarouselOpen}
              clickEffect={!isCarouselOpen}
              enableMagnetism={false}
              disableAnimations={isCarouselOpen}
            >
              <div 
                className="card__image relative"
                onPointerDown={(e) => {
                  const isMobile = window.innerWidth < 768
                  
                  if (isMobile) {
                    // Mobile: detect press and hold in center 85%
                    const target = e.currentTarget
                    const rect = target.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / rect.width
                    const y = (e.clientY - rect.top) / rect.height
                    
                    const centerThreshold = 0.85
                    const margin = (1 - centerThreshold) / 2
                    
                    if (x > margin && x < (1 - margin) && y > margin && y < (1 - margin)) {
                      // Start timer for press and hold
                      const timer = window.setTimeout(() => {
                        onImageClick(getImageUrl(product.image), product.title, category, index)
                      }, 400) // 400ms hold time
                      
                      // Store timer ID to clear on release
                      target.dataset.pressTimer = timer.toString()
                    }
                  }
                }}
                onPointerUp={(e) => {
                  // Clear timer on release
                  const timer = e.currentTarget.dataset.pressTimer
                  if (timer) {
                    clearTimeout(parseInt(timer))
                    delete e.currentTarget.dataset.pressTimer
                  }
                }}
                onPointerCancel={(e) => {
                  // Clear timer if cancelled
                  const timer = e.currentTarget.dataset.pressTimer
                  if (timer) {
                    clearTimeout(parseInt(timer))
                    delete e.currentTarget.dataset.pressTimer
                  }
                }}
                onClick={(e) => {
                  const isMobile = window.innerWidth < 768
                  
                  if (isMobile) {
                    // Mobile: only center 85% is tappable (avoid corners/edges)
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / rect.width
                    const y = (e.clientY - rect.top) / rect.height
                    
                    const centerThreshold = 0.85
                    const margin = (1 - centerThreshold) / 2
                    
                    if (x > margin && x < (1 - margin) && y > margin && y < (1 - margin)) {
                      onImageClick(getImageUrl(product.image), product.title, category, index)
                    }
                  } else {
                    // Desktop: entire image is clickable
                    onImageClick(getImageUrl(product.image), product.title, category, index)
                  }
                }}
              >
                <CroppedImageWithLoader 
                  src={getImageUrl(product.image)} 
                  alt={product.title} 
                  crop={cropSettings[product.image] || { scale: 1, x: 50, y: 50 }}
                  width={500}
                  height={500}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              
              <div className="card__content">
                <h2 className="card__title">{product.title}</h2>
                {product.description && (
                  <p className="card__description">{product.description}</p>
                )}
                {product.features && (
                  <ul className="card__features">
                    {product.features.map((feature, idx) => (
                      <li key={idx}>
                        <span style={{
                          backgroundColor: category === "new"
                            ? "rgb(220, 38, 38)"
                            : category === "battleTested"
                              ? "rgb(37, 99, 235)"
                              : "rgb(34, 197, 94)"
                        }}></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                {product.price && (
                  <div className="card__price" style={{
                    color: category === "new"
                      ? "rgb(220, 38, 38)"
                      : category === "battleTested"
                        ? "rgb(37, 99, 235)"
                        : "rgb(34, 197, 94)"
                  }}>
                    {product.price}
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