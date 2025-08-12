'use client'

import { useState } from 'react'
import { getProducts } from '@/lib/products-data'

export const useProductState = () => {
  const [featuredProducts, setFeaturedProducts] = useState(getProducts())
  const [featuredCategory, setFeaturedCategory] = useState("new")
  const [editingId, setEditingId] = useState<number | null>(null)

  return {
    featuredProducts,
    setFeaturedProducts,
    featuredCategory,
    setFeaturedCategory,
    editingId,
    setEditingId
  }
}