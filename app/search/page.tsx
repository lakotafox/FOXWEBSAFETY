'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/sections/Header'
import ProductsSection from '@/components/products/ProductsSection'
import ContactForm from '@/components/products/ContactForm'
import ASCIISection from '@/components/sections/ASCIISection'
import FloatingActionButtons from '@/components/sections/FloatingActionButtons'
import VoidModal from '@/components/ui/VoidModal'
import FlyingPosters from '@/components/ui/FlyingPosters'
import { X } from 'lucide-react'
import { getPublishedProductsPageItems } from '@/lib/products-page-data'

// All categories with their products
const allCategories = [
  { id: 'executive-desks', name: 'Executive Desks', group: 'Desks & Workstations' },
  { id: 'computer-desks', name: 'Computer Desks', group: 'Desks & Workstations' },
  { id: 'standing-desks', name: 'Standing Desks', group: 'Desks & Workstations' },
  { id: 'modular-benching', name: 'Modular Benching Systems', group: 'Desks & Workstations' },
  { id: 'cubicle-workstations', name: 'Cubicle Workstations', group: 'Cubicles' },
  { id: 'panel-systems', name: 'Panel Systems', group: 'Cubicles' },
  { id: 'modular-cubicles', name: 'Modular Cubicles', group: 'Cubicles' },
  { id: 'privacy-screens', name: 'Privacy Screens', group: 'Cubicles' },
  { id: 'task-chairs', name: 'Task Chairs', group: 'Seating' },
  { id: 'executive-chairs', name: 'Executive Chairs', group: 'Seating' },
  { id: 'conference-chairs', name: 'Conference Chairs', group: 'Seating' },
  { id: 'drafting-stools', name: 'Drafting Stools', group: 'Seating' },
  { id: 'ergonomic-seating', name: 'Ergonomic Seating', group: 'Seating' },
  { id: 'filing-cabinets', name: 'Filing Cabinets', group: 'Storage' },
  { id: 'shelving-units', name: 'Shelving Units', group: 'Storage' },
  { id: 'bookcases', name: 'Bookcases', group: 'Storage' },
  { id: 'lockers', name: 'Lockers', group: 'Storage' },
  { id: 'credenzas', name: 'Credenzas', group: 'Storage' },
  { id: 'conference-tables', name: 'Conference Tables', group: 'Conference & Meeting' },
  { id: 'meeting-chairs', name: 'Meeting Room Chairs', group: 'Conference & Meeting' },
  { id: 'collaborative-tables', name: 'Collaborative Tables', group: 'Conference & Meeting' },
  { id: 'av-carts', name: 'AV Carts', group: 'Conference & Meeting' },
  { id: 'reception-desks', name: 'Reception Desks', group: 'Reception & Lounge' },
  { id: 'sofas', name: 'Sofas', group: 'Reception & Lounge' },
  { id: 'lounge-chairs', name: 'Lounge Chairs', group: 'Reception & Lounge' },
  { id: 'coffee-tables', name: 'Coffee Tables', group: 'Reception & Lounge' },
  { id: 'side-tables', name: 'Side Tables', group: 'Reception & Lounge' }
]

// Default images for products
const defaultImages = [
  '/images/showroom-1.jpg',
  '/images/tanconf.jpg',
  '/images/reception tan.jpg',
  '/images/small desk.jpg',
  '/images/showfacinggarage.jpg',
  '/images/Showroomwglassboard.jpg',
  '/images/conference-room.jpg',
  '/images/desk grey L showroom.jpg',
  '/images/reception-area.jpg'
]

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any>({})
  const [showAddress, setShowAddress] = useState(false)
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [showFlyingPosters, setShowFlyingPosters] = useState(false)
  const [clickedCategory, setClickedCategory] = useState('')
  const [clickedIndex, setClickedIndex] = useState(0)

  // Load all products from all categories
  useEffect(() => {
    const loadAllProducts = async () => {
      const productsData: any = {}
      
      // Load executive desks from main products.json
      try {
        const mainData = await getPublishedProductsPageItems()
        productsData['executive-desks'] = mainData.products['executive-desks'] || []
      } catch (e) {
        console.log('No main products file')
      }
      
      // Try to load category-specific files
      for (const category of allCategories) {
        if (category.id === 'executive-desks') continue // Already loaded
        
        try {
          const response = await fetch(`/products-${category.id}.json`, { cache: 'no-store' })
          if (response.ok) {
            const data = await response.json()
            productsData[category.id] = data.products[category.id] || []
          } else {
            // Create default products for this category
            productsData[category.id] = Array.from({ length: 9 }, (_, i) => ({
              id: i + 1,
              title: `${category.name} ${i + 1}`,
              image: defaultImages[i] || '/images/showroom-1.jpg',
              description: '',
              features: ['Premium Quality', 'Professional Grade', 'Warranty Included'],
              price: ''
            }))
          }
        } catch (e) {
          // Create default products if file doesn't exist
          productsData[category.id] = Array.from({ length: 9 }, (_, i) => ({
            id: i + 1,
            title: `${category.name} ${i + 1}`,
            image: defaultImages[i] || '/images/showroom-1.jpg',
            description: '',
            features: ['Premium Quality', 'Professional Grade', 'Warranty Included'],
            price: ''
          }))
        }
      }
      
      setAllProducts(productsData)
    }
    
    loadAllProducts()
  }, [])

  // Search products when query changes
  useEffect(() => {
    if (!query || !allProducts) {
      setSearchResults([])
      return
    }
    
    const searchTerm = query.toLowerCase()
    const results: any[] = []
    
    // Search through all categories
    Object.entries(allProducts).forEach(([categoryId, products]: [string, any]) => {
      if (!Array.isArray(products)) return
      
      // Check if category name matches
      const category = allCategories.find(c => c.id === categoryId)
      const categoryMatches = category && (
        category.name.toLowerCase().includes(searchTerm) ||
        category.group.toLowerCase().includes(searchTerm)
      )
      
      // Search through products
      products.forEach((product: any) => {
        const productMatches = 
          product.title?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.features?.some((f: string) => f.toLowerCase().includes(searchTerm)) ||
          product.price?.toLowerCase().includes(searchTerm) ||
          categoryMatches
        
        if (productMatches) {
          results.push({
            ...product,
            category: categoryId,
            categoryName: category?.name || categoryId
          })
        }
      })
    })
    
    setSearchResults(results)
  }, [query, allProducts])

  // Handle image click to open flying posters carousel
  const handleImageClick = (imageSrc: string, imageAlt: string, category: string, index: number) => {
    setClickedCategory(category)
    setClickedIndex(index)
    setShowFlyingPosters(true)
  }

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Floating Action Buttons */}
      <FloatingActionButtons />

      {/* Header with full navigation */}
      <Header showAddress={showAddress} setShowAddress={setShowAddress} />

      {/* Search Results Title - with proper spacing from fixed header */}
      <section className="bg-slate-900 py-8 border-b-4 border-red-600 mt-14 md:mt-[200px]">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-black text-center tracking-tight text-white">
            SEARCH RESULTS
          </h1>
          {query && (
            <p className="text-center text-gray-400 mt-2">
              Showing results for "<span className="text-red-500">{query}</span>"
            </p>
          )}
          {searchResults.length > 0 && (
            <p className="text-center text-gray-500 mt-1">
              Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* Back to Products button */}
      <section className="py-8 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/products')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-black text-sm md:text-base px-6 py-3 tracking-wider transition-all shadow-lg hover:shadow-xl rounded"
            >
              BACK TO PRODUCTS
            </button>
          </div>
        </div>
      </section>

      {/* Search Results or No Results Message */}
      {searchResults.length > 0 ? (
        <ProductsSection 
          products={searchResults}
          category="search"
          cropSettings={cropSettings}
          onImageClick={handleImageClick}
          isCarouselOpen={showFlyingPosters}
        />
      ) : query ? (
        <section className="py-20 bg-slate-800">
          <div className="container mx-auto px-4 text-center">
            <p className="text-2xl text-gray-400">No products found matching your search.</p>
            <p className="text-gray-500 mt-4">Try searching for different keywords or browse our categories.</p>
          </div>
        </section>
      ) : (
        <section className="py-20 bg-slate-800">
          <div className="container mx-auto px-4 text-center">
            <p className="text-2xl text-gray-400">Enter a search term to find products.</p>
          </div>
        </section>
      )}

      {/* Contact Form */}
      <ContactForm />

      {/* ASCII Section */}
      <ASCIISection />

      {/* Footer */}
      <footer className="bg-slate-800 border-t-4 border-red-600 text-zinc-400 py-6">
        <div className="container mx-auto px-4 relative">
          <p className="text-sm font-bold">&copy; 2025, FOXBUILT.</p>
          <p className="text-xs text-yellow-500 mt-1">Want a free website? Email lakota.code@gmail.com</p>
          
          {/* Global View button */}
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
        <button
          onClick={() => setShowFlyingPosters(false)}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
          aria-label="Close gallery"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <FlyingPosters 
          items={searchResults.filter(p => p.category === clickedCategory).map(p => p.image)}
          height={typeof window !== 'undefined' && window.innerWidth < 768 ? '400px' : '600px'}
          initialIndex={clickedIndex}
          products={searchResults.filter(p => p.category === clickedCategory)}
          category={clickedCategory}
          onInfoClick={(index) => {
            const categoryProducts = searchResults.filter(p => p.category === clickedCategory)
            if (categoryProducts[index]) {
              const product = categoryProducts[index]
              const productParam = encodeURIComponent(JSON.stringify(product))
              router.push(`/product-detail?product=${productParam}&category=${clickedCategory}&returnTo=search&index=${index}&q=${encodeURIComponent(query)}`)
            }
          }}
        />
      </VoidModal>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}