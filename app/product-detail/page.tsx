'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductInfoModal from '@/components/ui/ProductInfoModal'

interface Product {
  id: number
  title: string
  image: string
  price: string
  description: string
  category?: string
}

export default function ProductDetailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<string>('')
  const [returnTo, setReturnTo] = useState<string>('')
  const [imageIndex, setImageIndex] = useState<string>('')

  useEffect(() => {
    // Get product data from query params
    const productData = searchParams.get('product')
    const categoryParam = searchParams.get('category')
    const returnToParam = searchParams.get('returnTo')
    const indexParam = searchParams.get('index')
    
    if (productData) {
      try {
        // Try to decode - Next.js may have already decoded it
        let decodedData = productData
        try {
          // Only decode if it appears to be encoded (contains %20, %7B, etc)
          if (productData.includes('%')) {
            decodedData = decodeURIComponent(productData)
          }
        } catch (e) {
          // If decoding fails, use the original data
          decodedData = productData
        }
        
        const parsedProduct = JSON.parse(decodedData)
        setProduct(parsedProduct)
        setCategory(categoryParam || parsedProduct.category || 'new')
        setReturnTo(returnToParam || '')
        setImageIndex(indexParam || '0')
      } catch (error) {
        console.error('Error parsing product data:', error)
        // If there's an error, go back
        router.back()
      }
    } else {
      // No product data, go back
      router.back()
    }
  }, [searchParams, router])

  const handleClose = () => {
    // Handle navigation based on where user came from
    if (returnTo === 'products-carousel') {
      router.push(`/products?openCarousel=true&category=${category}&index=${imageIndex}`)
    } else if (returnTo === 'list-carousel') {
      router.push(`/list-view?openCarousel=true&category=${category}&index=${imageIndex}`)
    } else if (returnTo === 'main-carousel') {
      router.push(`/?openCarousel=true&category=${category}&index=${imageIndex}`)
    } else {
      // Default behavior for global-view or direct access
      router.back()
    }
  }

  if (!product) {
    return null // Loading or no product
  }

  return (
    <div className="fixed inset-0 bg-black">
      <ProductInfoModal
        isOpen={true}
        onClose={handleClose}
        product={product}
        category={category as 'new' | 'battleTested' | 'seating'}
      />
    </div>
  )
}