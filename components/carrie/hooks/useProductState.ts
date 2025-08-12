'use client'

import { useState } from 'react'
import { getMainProducts } from '@/lib/main-products-data'

export const useProductState = () => {
  const [featuredProducts, setFeaturedProducts] = useState(getMainProducts())
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