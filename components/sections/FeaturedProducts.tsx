'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import CroppedImageWithLoader from '@/components/ui/CroppedImageWithLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import FlyingPosters from '@/components/ui/FlyingPosters'
import BaseModal from '@/components/ui/BaseModal'
import VoidModal from '@/components/ui/VoidModal'
import ScrollFloat from '@/components/ui/ScrollFloat'
import MagicBento, { ParticleCard, GlobalSpotlight, BentoCardGrid } from '@/components/ui/MagicBento'
import CategorySlider from '@/components/ui/CategorySlider'
import { X } from 'lucide-react'

interface FeaturedProductsProps {
  featuredProducts: any
  cropSettings: {[key: string]: {scale: number, x: number, y: number}}
  getImageUrl: (imagePath: string) => string
  openCarouselData?: {open: boolean, category?: string, index?: number}
}

export default function FeaturedProducts({ 
  featuredProducts, 
  cropSettings,
  getImageUrl,
  openCarouselData 
}: FeaturedProductsProps) {
  const router = useRouter()
  const [featuredCategory, setFeaturedCategory] = useState("battleTested")
  const [showFlyingPosters, setShowFlyingPosters] = useState(false)
  const [clickedIndex, setClickedIndex] = useState(0)
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null)
  const [hideCloseButton, setHideCloseButton] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  
  // Get glow color based on category
  const getGlowColor = () => {
    switch(featuredCategory) {
      case 'new': return '220, 38, 38' // red-600
      case 'battleTested': return '37, 99, 235' // blue-600
      case 'seating': return '34, 197, 94' // green-600
      default: return '132, 0, 255' // purple
    }
  }
  
  // Preload all images from all categories on mount
  useEffect(() => {
    const categories = ['new', 'battleTested', 'seating']
    categories.forEach(category => {
      if (featuredProducts[category]) {
        featuredProducts[category].forEach((product: any) => {
          if (product.image) {
            const img = new window.Image()
            img.src = getImageUrl(product.image)
          }
        })
      }
    })
  }, [featuredProducts, getImageUrl])
  
  // Clean up glow effects when carousel opens
  useEffect(() => {
    if (showFlyingPosters) {
      // Reset all glow properties when carousel opens
      const cards = document.querySelectorAll('.card')
      cards.forEach((card) => {
        const cardElement = card as HTMLElement
        cardElement.style.setProperty('--glow-intensity', '0')
        cardElement.style.setProperty('--glow-x', '50%')
        cardElement.style.setProperty('--glow-y', '50%')
      })
      
      // Hide spotlight
      const spotlight = document.querySelector('.global-spotlight') as HTMLElement
      if (spotlight) {
        spotlight.style.opacity = '0'
      }
    }
  }, [showFlyingPosters])

  // Handle opening carousel when returning from product detail
  useEffect(() => {
    if (openCarouselData?.open) {
      if (openCarouselData.category) {
        setFeaturedCategory(openCarouselData.category)
      }
      if (openCarouselData.index !== undefined) {
        setClickedIndex(openCarouselData.index)
      }
      setShowFlyingPosters(true)
    }
  }, [openCarouselData])

  return (
    <section id="featured" className="pt-20 pb-8 bg-slate-800">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-black text-center text-white mb-4 tracking-tight">
          OUR FAVORITES
        </h2>
        
        {/* Pick a category text */}
        <p className="text-center text-zinc-400 text-sm mb-2">Pick a category</p>

        {/* Category Slider */}
        <CategorySlider
          categories={[
            { id: 'new', label: 'NEW', color: 'text-white', bgColor: 'bg-red-600' },
            { id: 'battleTested', label: 'PRE-OWNED', color: 'text-white', bgColor: 'bg-blue-600' },
            { id: 'seating', label: 'CHAIRS', color: 'text-white', bgColor: 'bg-green-600' }
          ]}
          selectedCategory={featuredCategory}
          onCategoryChange={setFeaturedCategory}
          className="mb-2"
        />

        {/* Tap/Click to expand text */}
        <p className="text-center text-zinc-400 text-sm mb-6">
          <span className="md:hidden">Tap images to expand</span>
          <span className="hidden md:inline">Click images to expand</span>
        </p>

        {/* Product Grid with MagicBento */}
        <MagicBento
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={typeof window !== 'undefined' && window.innerWidth >= 768 && !showFlyingPosters}  // Desktop only
          enableBorderGlow={typeof window !== 'undefined' && window.innerWidth >= 768 && !showFlyingPosters}  // Desktop only
          enableTilt={true}
          enableMagnetism={false}  // Remove magnetism
          clickEffect={true}
          spotlightRadius={typeof window !== 'undefined' && window.innerWidth < 768 ? 450 : 250}  // Smaller on desktop
          particleCount={1}  // Just one particle
          glowColor={getGlowColor()}
          disableAnimations={showFlyingPosters}  // Disable all animations when carousel is open
        >
          {featuredProducts[featuredCategory] && featuredProducts[featuredCategory].length > 0 ? featuredProducts[featuredCategory].slice(0, 3).map((product: any, index: number) => (
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
                '--glow-color': getGlowColor(),
              } as React.CSSProperties}
              particleCount={1}  // Just one particle
              glowColor={getGlowColor()}
              enableTilt={!showFlyingPosters}  // All cards active
              clickEffect={!showFlyingPosters}  // All cards active
              enableMagnetism={false}  // Remove magnetism
              disableAnimations={showFlyingPosters}  // Disable when carousel is open
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
                        setClickedIndex(index)
                        setShowFlyingPosters(true)
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
                      setClickedIndex(index)
                      setShowFlyingPosters(true)
                    }
                  } else {
                    // Desktop: entire image is clickable
                    setClickedIndex(index)
                    setShowFlyingPosters(true)
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
                    {product.features.map((feature: string, idx: number) => (
                      <li key={idx}>
                        <span style={{
                          backgroundColor: featuredCategory === "new"
                            ? "rgb(220, 38, 38)"
                            : featuredCategory === "battleTested"
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
                    color: featuredCategory === "new"
                      ? "rgb(220, 38, 38)"
                      : featuredCategory === "battleTested"
                        ? "rgb(37, 99, 235)"
                        : "rgb(34, 197, 94)"
                  }}>
                    {product.price}
                  </div>
                )}
              </div>
            </ParticleCard>
          )) : null}
        </MagicBento>
        
      </div>
      
      
      {/* Flying Posters Modal */}
      <VoidModal
        isOpen={showFlyingPosters}
        onClose={() => setShowFlyingPosters(false)}
        className="max-w-7xl w-full bg-slate-800 rounded-lg relative"
        backdropClassName="bg-slate-800"
        closeOnEscape={true}
        closeOnBackdrop={true}
        showParticles={false}
      >
        {/* Close button - hide on desktop when full image is open */}
        {!hideCloseButton && (
          <button
            onClick={() => setShowFlyingPosters(false)}
            className="absolute top-2 right-2 md:top-4 md:right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}
        
        <FlyingPosters 
          items={featuredProducts[featuredCategory] && featuredProducts[featuredCategory].length > 0 ? featuredProducts[featuredCategory].slice(0, 3).map((p: any) => getImageUrl(p.image)) : []}
          height={typeof window !== 'undefined' && window.innerWidth < 768 ? '400px' : '600px'}
          initialIndex={clickedIndex}
          products={featuredProducts[featuredCategory] && featuredProducts[featuredCategory].length > 0 ? featuredProducts[featuredCategory].slice(0, 3) : []}
          category={featuredCategory}
          onFullImageToggle={(isOpen) => {
            // Only hide close button on desktop
            if (typeof window !== 'undefined' && window.innerWidth >= 768) {
              setHideCloseButton(isOpen)
            }
          }}
          onInfoClick={(index) => {
            // Get the product at this index
            const products = featuredProducts[featuredCategory] && featuredProducts[featuredCategory].length > 0 ? featuredProducts[featuredCategory].slice(0, 3) : []
            if (products && products[index]) {
              const product = products[index]
              const productWithCategory = {
                ...product,
                category: featuredCategory
              }
              const productParam = encodeURIComponent(JSON.stringify(productWithCategory))
              router.push(`/product-detail?product=${productParam}&category=${featuredCategory}&returnTo=main-carousel&index=${index}`)
            }
          }}
        />
      </VoidModal>
      
    </section>
  )
}