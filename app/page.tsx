'use client'

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from 'next/navigation'
import { getMainProducts, defaultMainProducts } from "@/lib/main-products-data"

// Import all our extracted components
import FloatingActionButtons from "@/components/sections/FloatingActionButtons"
import Header from "@/components/sections/Header"
import HeroSection from "@/components/sections/HeroSection"
import HeroLanding from "@/components/sections/HeroLanding"
import InteractiveParticles from "@/components/sections/InteractiveParticles"
import FeaturedProducts from "@/components/sections/FeaturedProducts"
import CatalogSection from "@/components/sections/CatalogSection"
import AboutSection from "@/components/sections/AboutSection"
import ContactSection from "@/components/sections/ContactSection"
import ASCIISection from "@/components/sections/ASCIISection"
import Footer from "@/components/sections/Footer"

// Declare window.emailjs type
declare global {
  interface Window {
    emailjs: any
  }
}

function FoxBuiltWebsiteContent() {
  const searchParams = useSearchParams()
  const [showAddress, setShowAddress] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState(defaultMainProducts)
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [galleryCrops, setGalleryCrops] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [openCarouselData, setOpenCarouselData] = useState<{open: boolean, category?: string, index?: number}>({open: false})
  
  // Helper function to get displayable image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg"
    return imagePath
  }

  // Gallery images - start empty to prevent flash
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [mobileGalleryImages, setMobileGalleryImages] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load products from products.json (published by editor) and gallery from content.json
  useEffect(() => {
    // Load products from main-products.json (what the carrie editor publishes)
    fetch('/main-products.json')
      .then(response => response.json())
      .then(data => {
        if (data.products) {
          setFeaturedProducts(data.products)
          
          // Use productsCrops if available, otherwise extract from products
          if (data.productsCrops) {
            setCropSettings(data.productsCrops)
          } else {
            // Extract crop settings from products
            const crops: {[key: string]: {scale: number, x: number, y: number}} = {}
            Object.keys(data.products).forEach(category => {
              data.products[category].forEach((product: any) => {
                if (product.imageCrop && product.image) {
                  crops[product.image] = product.imageCrop
                }
              })
            })
            setCropSettings(crops)
          }
        }
      })
      .catch(error => {
        console.error('Error loading main-products.json, falling back to defaults:', error)
        setFeaturedProducts(getMainProducts())
      })
    
    // Load gallery images from content.json
    fetch('/content.json')
      .then(response => response.json())
      .then(data => {
        if (data.gallery) {
          setGalleryImages(data.gallery)
        }
        if (data.mobileGallery) {
          setMobileGalleryImages(data.mobileGallery)
        }
        if (data.galleryCrops) {
          setGalleryCrops(data.galleryCrops)
        }
      })
      .catch(error => {
        console.error('Error loading content.json gallery:', error)
        const savedGallery = localStorage.getItem('foxbuilt-gallery')
        if (savedGallery) {
          try {
            setGalleryImages(JSON.parse(savedGallery))
          } catch (e) {
            console.error('Error loading gallery images:', e)
          }
        }
      })
  }, [])

  // Check if we should open carousel (returning from product detail)
  useEffect(() => {
    if (searchParams.get('openCarousel') === 'true') {
      const categoryParam = searchParams.get('category')
      const indexParam = searchParams.get('index')
      setOpenCarouselData({
        open: true,
        category: categoryParam || undefined,
        index: indexParam ? parseInt(indexParam) : undefined
      })
      // Clean up the URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('openCarousel')
      newUrl.searchParams.delete('category')
      newUrl.searchParams.delete('index')
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-slate-800">
      <FloatingActionButtons />
      <Header showAddress={showAddress} setShowAddress={setShowAddress} />
      <div style={{ marginTop: isMobile ? '80px' : '90px' }}>
        <HeroLanding 
          galleryImages={isMobile ? mobileGalleryImages : galleryImages}
          getImageUrl={getImageUrl}
        />
        <FeaturedProducts 
          featuredProducts={featuredProducts}
          cropSettings={cropSettings}
          getImageUrl={getImageUrl}
          openCarouselData={openCarouselData}
        />
        <CatalogSection />
        <InteractiveParticles />
        <AboutSection 
          showAddress={showAddress}
          setShowAddress={setShowAddress}
        />
        <ContactSection />
        <ASCIISection />
        <Footer />
      </div>
    </div>
  )
}

export default function FoxBuiltWebsite() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-black text-xl">Loading...</div>
      </div>
    }>
      <FoxBuiltWebsiteContent />
    </Suspense>
  )
}