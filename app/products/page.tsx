'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import FlyingPosters from '@/components/ui/FlyingPosters'
import VoidModal from '@/components/ui/VoidModal'
import { X } from 'lucide-react'
import FloatingActionButtons from '@/components/sections/FloatingActionButtons'
import ProductsSection from '@/components/products/ProductsSection'
import CategorySelector from '@/components/products/CategorySelector'
import Header from '@/components/sections/Header'
import FloatingCategoryButtons from '@/components/products/FloatingCategoryButtons'
import ContactForm from '@/components/products/ContactForm'
import ASCIISection from '@/components/sections/ASCIISection'
import { getPublishedProductsPageItems } from '@/lib/products-page-data'
import { getCategoryNames } from '@/lib/category-names'

// Fallback category names if not loaded from file
function getCategoryDefaultName(categoryId: string): string {
  const defaultNames: Record<string, string> = {
    'executive-desks': 'Executive Desks',
    'computer-desks': 'Computer Desks',
    'standing-desks': 'Standing Desks',
    'modular-benching': 'Modular Benching Systems',
    'cubicle-workstations': 'Cubicle Workstations',
    'panel-systems': 'Panel Systems',
    'modular-cubicles': 'Modular Cubicles',
    'privacy-screens': 'Privacy Screens',
    'task-chairs': 'Task Chairs',
    'executive-chairs': 'Executive Chairs',
    'conference-chairs': 'Conference Chairs',
    'drafting-stools': 'Drafting Stools',
    'ergonomic-seating': 'Ergonomic Seating',
    'filing-cabinets': 'Filing Cabinets',
    'shelving-units': 'Shelving Units',
    'bookcases': 'Bookcases',
    'lockers': 'Lockers',
    'credenzas': 'Credenzas',
    'conference-tables': 'Conference Tables',
    'meeting-chairs': 'Meeting Room Chairs',
    'collaborative-tables': 'Collaborative Tables',
    'av-carts': 'AV Carts',
    'reception-desks': 'Reception Desks',
    'sofas': 'Sofas',
    'lounge-chairs': 'Lounge Chairs',
    'coffee-tables': 'Coffee Tables',
    'side-tables': 'Side Tables'
  }
  return defaultNames[categoryId] || 'Products'
}

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams.get('category') || 'executive-desks'
  const [productCategory, setProductCategory] = useState(categoryParam)
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [isScrolled, setIsScrolled] = useState(false)
  const [showFlyingPosters, setShowFlyingPosters] = useState(false)
  const [clickedCategory, setClickedCategory] = useState('')
  const [clickedIndex, setClickedIndex] = useState(0)
  const [showFloatingCategories, setShowFloatingCategories] = useState(false)
  const [productsByCategory, setProductsByCategory] = useState<any>({})
  const [pageName, setPageName] = useState('')
  const [showAddress, setShowAddress] = useState(false)
  const [categoryNames, setCategoryNames] = useState<any>(null)
  
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
    
    // Load category names
    const loadCategoryNames = async () => {
      const names = await getCategoryNames()
      setCategoryNames(names)
    }
    loadCategoryNames()
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
    // Load products when component mounts or category changes
    const loadProducts = async () => {
      try {
        // Try to load category-specific products file
        const response = await fetch(`/products-${categoryParam}.json`, { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          console.log(`Loaded products for ${categoryParam}:`, data)
          
          // Convert kebab-case to camelCase for the key
          const camelCaseKey = categoryParam.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
          
          // The products might be directly in data.products[camelCaseKey] or we need to restructure
          if (data.products && typeof data.products === 'object') {
            // Check if it's already categorized
            const firstKey = Object.keys(data.products)[0]
            if (firstKey && Array.isArray(data.products[firstKey])) {
              // It's already categorized, use as is
              setProductsByCategory(data.products)
            } else {
              // Might be a flat array, need to categorize it
              setProductsByCategory({ [categoryParam]: data.products })
            }
          }
          
          setCropSettings(data.productsCrops || {})
          if (data.pageName) {
            setPageName(data.pageName)
          }
          return
        }
      } catch (e) {
        console.log(`No products file for ${categoryParam}, trying default`)
      }
      
      // Fallback to main products.json
      const data = await getPublishedProductsPageItems()
      console.log('Loaded fallback products data:', data)
      setProductsByCategory(data.products || {})
      setCropSettings(data.crops || {})
      // Set page name from data or use default
      setPageName(data.pageName || 'Executive Desks')
    }
    loadProducts()
  }, [categoryParam])
  
  useEffect(() => {
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


  // Get current products - convert kebab-case to camelCase to match the data structure
  const productKey = categoryParam.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
  const currentProducts = productsByCategory[productKey] || productsByCategory[categoryParam] || []
  
  // Get glow color based on category
  const getGlowColor = () => {
    switch(clickedCategory || productCategory) {
      case 'executiveDesks': return '220, 38, 38' // red-600
      default: return '220, 38, 38' // red-600
    }
  }
  
  // Helper function to get displayable image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg"
    
    // Check if it's a Cloudinary URL
    if (imagePath.includes('cloudinary.com') || imagePath.includes('res.cloudinary.com')) {
      return imagePath
    }
    
    // Check if it's a pending upload (shouldn't happen on live site but handle it)
    if (imagePath.startsWith('cloudinary-pending-')) {
      return '/fox-loading.gif'
    }
    
    // Regular image path
    return imagePath
  }

  // Handle image click to open flying posters carousel
  const handleImageClick = (imageSrc: string, imageAlt: string, category: string, index: number) => {
    console.log('=== CAROUSEL OPENED ===')
    console.log('Clicked image:', imageSrc)
    console.log('Category:', category)
    console.log('Index:', index)
    
    // Try both kebab-case and camelCase keys
    const camelCaseKey = category.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    const products = productsByCategory[category as keyof typeof productsByCategory] || 
                    productsByCategory[camelCaseKey as keyof typeof productsByCategory] || []
    
    console.log('Products in category:', products)
    console.log('All categories available:', Object.keys(productsByCategory))
    
    setClickedCategory(category)
    setClickedIndex(index)
    setShowFlyingPosters(true)
  }
  
  // Get image URLs for the clicked category
  const getCategoryImageUrls = () => {
    // Try both kebab-case and camelCase keys
    const camelCaseKey = clickedCategory.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    const products = productsByCategory[clickedCategory as keyof typeof productsByCategory] || 
                    productsByCategory[camelCaseKey as keyof typeof productsByCategory] || []
    
    console.log('Getting URLs for category:', clickedCategory)
    console.log('CamelCase key:', camelCaseKey)
    console.log('All available categories:', Object.keys(productsByCategory))
    console.log('Raw products:', products)
    
    const urls = products.map((product: any) => {
      const url = getImageUrl(product.image)
      console.log(`Product "${product.title}": ${product.image} -> ${url}`)
      return url
    })
    console.log('Final carousel URLs:', urls)
    return urls
  }

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Floating Action Buttons */}
      <FloatingActionButtons />


      {/* Header with full navigation */}
      <Header showAddress={showAddress} setShowAddress={setShowAddress} />

      {/* Page Title - with proper spacing from fixed header */}
      <section className="bg-slate-900 py-8 border-b-4 border-red-600 mt-14 md:mt-[200px]">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black text-center tracking-tight text-white">
            <span 
              className={(() => {
                if (categoryParam.includes('desk') || categoryParam.includes('executive') || categoryParam.includes('reception')) return 'text-red-600'
                if (categoryParam.includes('chair') || categoryParam.includes('seat') || categoryParam.includes('stool') || categoryParam.includes('sofa') || categoryParam.includes('lounge')) return 'text-green-500'
                if (categoryParam.includes('cubicle') || categoryParam.includes('panel') || categoryParam.includes('workstation') || categoryParam.includes('privacy')) return 'text-orange-500'
                if (categoryParam.includes('storage') || categoryParam.includes('filing') || categoryParam.includes('cabinet') || categoryParam.includes('shelf') || categoryParam.includes('bookcase') || categoryParam.includes('locker') || categoryParam.includes('credenza')) return 'text-blue-500'
                if (categoryParam.includes('conference') || categoryParam.includes('meeting') || categoryParam.includes('collaborative') || categoryParam.includes('table')) return 'text-amber-400'
                return 'text-red-600'
              })()}
              style={{ color: categoryParam.includes('cubicle') || categoryParam.includes('panel') || categoryParam.includes('workstation') || categoryParam.includes('privacy') ? '#f97316' : undefined }}
            >
              {pageName.toUpperCase()}
            </span>
          </h1>
        </div>
      </section>

      {/* List View button */}
      <section className="py-8 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/list-view')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-black text-sm md:text-base px-6 py-3 tracking-wider transition-all shadow-lg hover:shadow-xl rounded"
            >
              LIST VIEW
            </button>
          </div>
        </div>
      </section>
      
      <ProductsSection 
        products={currentProducts}
        category={productCategory}
        cropSettings={cropSettings}
        onImageClick={handleImageClick}
        isCarouselOpen={showFlyingPosters}
      />


      {/* Contact Form */}
      <ContactForm />

      {/* ASCII Section */}
      <ASCIISection />

      {/* Footer */}
      <footer className="bg-slate-800 border-t-4 border-red-600 text-zinc-400 py-6">
        <div className="container mx-auto px-4 relative">
          <p className="text-sm font-bold">&copy; 2025, FOXBUILT.</p>
          <p className="text-xs text-yellow-500 mt-1">Want a free website? Email lakota.code@gmail.com</p>
          
          {/* Global View button - positioned in bottom right of footer */}
          <button
            onClick={() => router.push('/global-view')}
            className="absolute top-2 right-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm px-4 py-2 rounded-lg tracking-wider transition-all shadow-lg hover:shadow-xl"
          >
            GLOBAL VIEW
          </button>
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

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}