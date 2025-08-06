'use client'

import { useState, useEffect } from "react"
import { getProducts, defaultProducts } from "@/lib/products-data"

// Import all our extracted components
import FloatingActionButtons from "@/components/sections/FloatingActionButtons"
import Header from "@/components/sections/Header"
import HeroSection from "@/components/sections/HeroSection"
import InteractiveParticles from "@/components/sections/InteractiveParticles"
import GallerySection from "@/components/sections/GallerySection"
import FeaturedProducts from "@/components/sections/FeaturedProducts"
import AboutSection from "@/components/sections/AboutSection"
import ContactSection from "@/components/sections/ContactSection"
import Footer from "@/components/sections/Footer"

// Declare window.emailjs type
declare global {
  interface Window {
    emailjs: any
  }
}

export default function FoxBuiltWebsite() {
  const [showAddress, setShowAddress] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState(defaultProducts)
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [galleryCrops, setGalleryCrops] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  
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

  // Load products from content.json
  useEffect(() => {
    fetch('/content.json')
      .then(response => response.json())
      .then(data => {
        if (data.products) {
          setFeaturedProducts(data.products)
          
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
        console.error('Error loading content.json, falling back to defaults:', error)
        setFeaturedProducts(getProducts())
        
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

  return (
    <div className="min-h-screen bg-zinc-100">
      <FloatingActionButtons />
      <Header showAddress={showAddress} setShowAddress={setShowAddress} />
      <HeroSection />
      <GallerySection 
        galleryImages={isMobile ? mobileGalleryImages : galleryImages}
        galleryCrops={galleryCrops}
        getImageUrl={getImageUrl}
      />
      <FeaturedProducts 
        featuredProducts={featuredProducts}
        cropSettings={cropSettings}
        getImageUrl={getImageUrl}
      />
      <InteractiveParticles />
      <AboutSection 
        showAddress={showAddress}
        setShowAddress={setShowAddress}
      />
      <ContactSection />
      <Footer />
    </div>
  )
}