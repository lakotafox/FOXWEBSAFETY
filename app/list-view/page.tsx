'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import AnimatedList from '@/components/ui/AnimatedList'
import FloatingActionButtons from '@/components/sections/FloatingActionButtons'
import ASCIISection from '@/components/sections/ASCIISection'
import ContactForm from '@/components/products/ContactForm'
import { getPublishedProductsPageItems } from '@/lib/products-page-data'
import VoidModal from '@/components/ui/VoidModal'
import FlyingPosters from '@/components/ui/FlyingPosters'
import { X } from 'lucide-react'
import '@/components/ui/AnimatedList.css'

interface Product {
  id: number
  title: string
  image: string
  description: string
  features: string[]
  price: string
}

function ListViewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [showFlyingPosters, setShowFlyingPosters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showInstructionText, setShowInstructionText] = useState(true)

  useEffect(() => {
    // Load products when component mounts - this will load from products.json (published data)
    const loadProducts = async () => {
      const data = await getPublishedProductsPageItems()
      
      // Combine all products from all categories with alternating colors
      const combinedProducts: any[] = []
      const categories = ['new', 'battleTested', 'seating']
      let colorIndex = 0
      
      // Add products with their category info for color coding
      if (data.products.new) {
        data.products.new.forEach((product: any) => {
          combinedProducts.push({
            ...product,
            category: categories[colorIndex % 3]
          })
          colorIndex++
        })
      }
      if (data.products.battleTested) {
        data.products.battleTested.forEach((product: any) => {
          combinedProducts.push({
            ...product,
            category: categories[colorIndex % 3]
          })
          colorIndex++
        })
      }
      if (data.products.seating) {
        data.products.seating.forEach((product: any) => {
          combinedProducts.push({
            ...product,
            category: categories[colorIndex % 3]
          })
          colorIndex++
        })
      }
      
      setAllProducts(combinedProducts)
    }
    loadProducts()
  }, [])

  // Check if we should open carousel (returning from product detail)
  useEffect(() => {
    if (searchParams.get('openCarousel') === 'true') {
      const categoryParam = searchParams.get('category')
      const indexParam = searchParams.get('index')
      if (categoryParam) {
        setSelectedCategory(categoryParam)
      }
      if (indexParam) {
        setSelectedIndex(parseInt(indexParam))
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

  // Hide instruction text after 4.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructionText(false)
    }, 4500)

    return () => clearTimeout(timer)
  }, [])

  // Handle product selection
  const handleProductSelect = (product: any, index: number) => {
    setSelectedProduct(product)
    setSelectedIndex(index)
    setSelectedCategory(product.category)
    setShowFlyingPosters(true)
  }

  // Get all image URLs 
  const getAllImageUrls = () => {
    return allProducts.map((product: any) => product.image)
  }

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Floating Action Buttons */}
      <FloatingActionButtons />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-slate-900 border-b-4 border-yellow-500 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => router.push('/products')}
              className="flex items-center gap-2 text-white hover:text-yellow-500 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="font-black text-lg">BACK</span>
            </button>
            
            <h1 className="text-2xl md:text-3xl font-black text-yellow-500 tracking-wide">
              LIST VIEW
            </h1>
            
            <div className="w-20">{/* Spacer to keep title centered */}</div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      {/* Animated List */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          {/* Instruction text with fade out */}
          <p 
            className="text-center text-yellow-500 font-black text-lg mb-6 tracking-wider transition-opacity duration-1000"
            style={{ 
              opacity: showInstructionText ? 1 : 0,
              pointerEvents: showInstructionText ? 'auto' : 'none'
            }}
          >
            <span className="hidden md:inline">CLICK ANY IMAGE TO ZOOM</span>
            <span className="md:hidden">TAP ANY IMAGE TO ZOOM</span>
          </p>
          
          <AnimatedList
            items={allProducts}
            onItemSelect={handleProductSelect}
            showGradients={true}
            enableArrowNavigation={true}
            displayScrollbar={true}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Contact Form */}
      <ContactForm />

      {/* ASCII Section */}
      <ASCIISection />

      {/* Footer */}
      <footer className="bg-slate-800 border-t-4 border-yellow-500 text-zinc-400 py-6">
        <div className="container mx-auto px-4">
          <p className="text-sm font-bold">&copy; 2025, FOXBUILT.</p>
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
          items={getAllImageUrls()}
          height={typeof window !== 'undefined' && window.innerWidth < 768 ? '400px' : '600px'}
          initialIndex={selectedIndex}
          products={allProducts}
          category={selectedCategory}
          onInfoClick={(index) => {
            // Get the product at this index from all products
            if (allProducts && allProducts[index]) {
              const product = allProducts[index]
              const productWithCategory = {
                ...product,
                category: product.category
              }
              const productParam = encodeURIComponent(JSON.stringify(productWithCategory))
              router.push(`/product-detail?product=${productParam}&category=${product.category}&returnTo=list-carousel&index=${index}`)
            }
          }}
        />
      </VoidModal>
    </div>
  )
}

export default function ListView() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-yellow-500 flex items-center justify-center">
        <div className="text-black text-xl font-bold">Loading...</div>
      </div>
    }>
      <ListViewContent />
    </Suspense>
  )
}