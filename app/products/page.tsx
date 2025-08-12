'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import FlyingPosters from '@/components/ui/FlyingPosters'
import VoidModal from '@/components/ui/VoidModal'
import { X } from 'lucide-react'
import FloatingActionButtons from '@/components/sections/FloatingActionButtons'
import ProductsSection from '@/components/products/ProductsSection'
import CategorySelector from '@/components/products/CategorySelector'
import ShowroomCTA from '@/components/products/ShowroomCTA'
import ProductsHeader from '@/components/products/ProductsHeader'
import FloatingCategoryButtons from '@/components/products/FloatingCategoryButtons'
import ContactForm from '@/components/products/ContactForm'
import ASCIISection from '@/components/sections/ASCIISection'
import { getProductsPageItems } from '@/lib/products-data'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [productCategory, setProductCategory] = useState('new')
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [isScrolled, setIsScrolled] = useState(false)
  const [showFlyingPosters, setShowFlyingPosters] = useState(false)
  const [clickedCategory, setClickedCategory] = useState('')
  const [clickedIndex, setClickedIndex] = useState(0)
  const [showFloatingCategories, setShowFloatingCategories] = useState(false)
  const [productsByCategory, setProductsByCategory] = useState<any>({
    new: [],
    battleTested: [],
    seating: []
  })
  
  useEffect(() => {
    // Load crop settings from localStorage
    const savedCrops = localStorage.getItem('foxbuilt-products-page-crops')
    if (savedCrops) {
      try {
        setCropSettings(JSON.parse(savedCrops))
      } catch (e) {
        console.error('Error loading crop settings:', e)
      }
    }
  }, [])

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  useEffect(() => {
    // Load products when component mounts
    const loadProducts = async () => {
      const data = await getProductsPageItems()
      setProductsByCategory(data.products)
      setCropSettings(data.crops || {})
    }
    loadProducts()
    
    // Check if we should open carousel (returning from product detail)
    if (searchParams.get('openCarousel') === 'true') {
      const categoryParam = searchParams.get('category')
      const indexParam = searchParams.get('index')
      if (categoryParam) {
        setClickedCategory(categoryParam)
      }
      if (indexParam) {
        setClickedIndex(parseInt(indexParam))
      }
      setShowFlyingPosters(true)
      // Clean up the URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('openCarousel')
      newUrl.searchParams.delete('category')
      newUrl.searchParams.delete('index')
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams])


  // Get current products based on selected category
  const currentProducts = productsByCategory[productCategory as keyof typeof productsByCategory] || []
  
  // Get glow color based on category
  const getGlowColor = () => {
    switch(clickedCategory || productCategory) {
      case 'new': return '220, 38, 38' // red-600
      case 'battleTested': return '37, 99, 235' // blue-600
      case 'seating': return '34, 197, 94' // green-600
      default: return '132, 0, 255' // purple
    }
  }
  
  // Helper function to get displayable image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg"
    return imagePath
  }

  // Handle image click to open flying posters carousel
  const handleImageClick = (imageSrc: string, imageAlt: string, category: string, index: number) => {
    setClickedCategory(category)
    setClickedIndex(index)
    setShowFlyingPosters(true)
  }
  
  // Get image URLs for the clicked category
  const getCategoryImageUrls = () => {
    const products = productsByCategory[clickedCategory as keyof typeof productsByCategory] || []
    return products.map((product: any) => product.image)
  }

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Floating Action Buttons */}
      <FloatingActionButtons />

      {/* Floating Category Buttons - Desktop Only */}
      <FloatingCategoryButtons 
        showFloatingCategories={showFloatingCategories}
        productCategory={productCategory}
        onCategoryChange={setProductCategory}
      />

      {/* Header */}
      <ProductsHeader isScrolled={isScrolled} />

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      {/* Category Selector and Products Section */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <CategorySelector 
            selectedCategory={productCategory}
            onCategoryChange={setProductCategory}
            onFloatingVisibilityChange={setShowFloatingCategories}
          />
        </div>
      </section>
      
      <ProductsSection 
        products={currentProducts}
        category={productCategory}
        cropSettings={cropSettings}
        onImageClick={handleImageClick}
        isCarouselOpen={showFlyingPosters}
      />

      {/* Visit Our Showroom CTA */}
      <ShowroomCTA />

      {/* Contact Form */}
      <ContactForm />

      {/* ASCII Section */}
      <ASCIISection />

      {/* Footer */}
      <footer className="bg-slate-800 border-t-4 border-red-600 text-zinc-400 py-6">
        <div className="container mx-auto px-4">
          <p className="text-sm font-bold">&copy; 2025, FOXBUILT. ESTABLISHED 1999. BUILT IN AMERICA.</p>
          <p className="text-xs text-zinc-500 mt-1">THIS SITE IS A PRODUCT OF LAKOTA.CODE.CO. USER ACCEPTS IT IS WHAT IT IS.</p>
          <p className="text-xs text-yellow-500 mt-1">Want a free website? Email lakota.code@gmail.com</p>
        </div>
      </footer>
      
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
        {/* Close button */}
        <button
          onClick={() => setShowFlyingPosters(false)}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
          aria-label="Close gallery"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <FlyingPosters 
          items={getCategoryImageUrls()}
          height={typeof window !== 'undefined' && window.innerWidth < 768 ? '400px' : '600px'}
          initialIndex={clickedIndex}
          products={productsByCategory[clickedCategory as keyof typeof productsByCategory]}
          category={clickedCategory}
          onInfoClick={(index) => {
            // Get the product at this index from the clicked category
            const products = productsByCategory[clickedCategory as keyof typeof productsByCategory]
            if (products && products[index]) {
              const product = products[index]
              const productWithCategory = {
                ...product,
                category: clickedCategory
              }
              const productParam = encodeURIComponent(JSON.stringify(productWithCategory))
              router.push(`/product-detail?product=${productParam}&category=${clickedCategory}&returnTo=products-carousel&index=${index}`)
            }
          }}
        />
      </VoidModal>

    </div>
  )
}