'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Galaxy from '@/components/ui/Galaxy'
import InfiniteMenu from '@/components/ui/InfiniteMenu'
import { ArrowLeft } from 'lucide-react'

interface Product {
  id: number
  title: string
  image: string
  price: string
  description: string
}

export default function GlobalViewPage() {
  const router = useRouter()
  const [productItems, setProductItems] = useState<any[]>([])
  const [isGlobeIdle, setIsGlobeIdle] = useState(true)
  const menuRef = useRef<any>(null)

  useEffect(() => {
    // Load products from products.json
    fetch('/products.json')
      .then(response => response.json())
      .then(data => {
        if (data.products && data.products.executiveDesks) {
          const items: any[] = []
          
          // Only extract products from 'executiveDesks' category
          data.products.executiveDesks.forEach((product: Product, index: number) => {
            items.push({
              image: product.image || '/placeholder.svg',
              title: product.title || '',
              description: product.price || '',
              link: '', // No link functionality for now
              category: 'executiveDesks',
              categoryIndex: index,
              productData: product
            })
          })
          
          setProductItems(items)
        }
      })
      .catch(error => {
        console.error('Error loading products:', error)
        // Fallback to some default items
        setProductItems([
          { image: '/placeholder.svg', title: 'Product 1', description: '', link: '' },
          { image: '/placeholder.svg', title: 'Product 2', description: '', link: '' },
          { image: '/placeholder.svg', title: 'Product 3', description: '', link: '' },
          { image: '/placeholder.svg', title: 'Product 4', description: '', link: '' },
        ])
      })
  }, [])

  return (
    <div className="fixed inset-0 bg-black">
      {/* Galaxy background at low z-index */}
      <div className="absolute inset-0 z-0">
        <Galaxy 
          mouseInteraction={false}
          mouseRepulsion={false}
          density={1.5}
          glowIntensity={0.5}
          saturation={0.8}
          hueShift={240}
          transparent={false}
        />
      </div>

      {/* Globe of product images - placed first so button can overlay */}
      <div className="absolute inset-0 z-10">
        <InfiniteMenu 
          items={productItems} 
          onStateChange={setIsGlobeIdle}
          menuRef={menuRef}
        />
      </div>

      {/* Back button with dual behavior - higher z-index and pointer-events */}
      <button
        onClick={() => {
          if (isGlobeIdle) {
            // In idle mode: navigate back to products page
            router.back()
          } else {
            // In zoomed mode: reset globe to idle state
            if (menuRef.current?.resetToIdle) {
              menuRef.current.resetToIdle()
            }
          }
        }}
        className="fixed top-4 left-4 z-30 flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all backdrop-blur-sm"
        style={{ pointerEvents: 'auto' }}
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">BACK</span>
      </button>
    </div>
  )
}