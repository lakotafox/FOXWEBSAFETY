'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRight, Star, Shield, Truck } from 'lucide-react'
import ImageWithLoader from '@/components/ui/ImageWithLoader'
import { Star3DCSS } from '@/components/ui/Star3D'

interface HeroLandingProps {
  galleryImages?: string[]
  getImageUrl?: (imagePath: string) => string
}

export default function HeroLanding({ galleryImages = [], getImageUrl }: HeroLandingProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Cycle through gallery images as background
  useEffect(() => {
    if (galleryImages.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [galleryImages.length])


  // Use first image or a default hero image
  const heroImage = galleryImages.length > 0 && getImageUrl 
    ? getImageUrl(galleryImages[currentImageIndex]) 
    : '/hero-default.jpg'

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {galleryImages.length > 0 && getImageUrl && (
          <div className="absolute inset-0">
            <ImageWithLoader
              src={heroImage}
              alt="FoxBuilt Products"
              fill
              className="object-cover"
              priority
              onLoadComplete={() => setImagesLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/40" />
          </div>
        )}
        {/* Fallback gradient if no images */}
        {galleryImages.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900" />
        )}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col">
        
        {/* Rating Section - Near top */}
        <div className="flex justify-center pt-20 md:pt-24">
          <a 
            href="https://www.google.com/maps/place/FoxBuilt+Office/@40.7609421,-111.8910865,17z/data=!4m8!3m7!1s0x874d852112461743:0x378fbe70e0c25e5e!8m2!3d40.7609421!4d-111.8910865!9m1!1b1!16s%2Fg%2F11c5kyjb_x"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:scale-105 transition-transform cursor-pointer"
          >
            <Star3DCSS filled={true} size={35} />
            <Star3DCSS filled={true} size={35} />
            <Star3DCSS filled={true} size={35} />
            <Star3DCSS filled={true} size={35} />
            <Star3DCSS filled={true} size={35} />
            <span className="text-white text-3xl font-bold ml-4">5.0 Rated</span>
          </a>
        </div>

        {/* Main Title - Centered */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-black/50 backdrop-blur-sm border-2 border-white/20 rounded-lg px-4 md:px-8 py-3 md:py-6 inline-block">
            <h1 className="text-3xl md:text-8xl lg:text-9xl font-bold leading-tight mb-2">
              <span className="text-red-500">FOX</span>
              <span className="text-white">BUILT</span>
              <span className="text-blue-500">OFFICE</span>
            </h1>
            {/* Sub-headline */}
            <p className="text-sm md:text-2xl lg:text-3xl italic text-right">
              <span className="text-yellow-400">Your</span>
              <span className="text-white"> vision, realized</span>
            </p>
          </div>
        </div>

      </div>

    </section>
  )
}