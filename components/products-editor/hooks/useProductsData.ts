'use client'

import { useState, useEffect } from 'react'
import { defaultProductsPageItems } from '@/components/products-editor/constants/default-products'

// Helper functions to get/save products page items
async function getProductsPageItems() {
  // First try to fetch from the published products.json file
  try {
    const response = await fetch('/products.json', { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      if (data.products) {
        return data.products
      }
    }
  } catch (e) {
    console.log('No published products file, checking localStorage')
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('foxbuilt-products-page')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Organize into categories
        return {
          new: parsed.new || defaultProductsPageItems.slice(0, 9),
          battleTested: parsed.battleTested || defaultProductsPageItems.slice(9, 18),
          seating: parsed.seating || defaultProductsPageItems.slice(18, 27)
        }
      } catch (e) {
        console.error('Error parsing saved products page items:', e)
      }
    }
  }
  // Return organized default products
  return {
    new: defaultProductsPageItems.slice(0, 9),
    battleTested: defaultProductsPageItems.slice(9, 18),
    seating: defaultProductsPageItems.slice(18, 27)
  }
}

function saveProductsPageItems(products: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('foxbuilt-products-page', JSON.stringify(products))
  }
}

export function useProductsData() {
  const [products, setProducts] = useState({
    new: defaultProductsPageItems.slice(0, 9),
    battleTested: defaultProductsPageItems.slice(9, 18),
    seating: defaultProductsPageItems.slice(18, 27)
  })
  const [productCategory, setProductCategory] = useState('new')

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      const savedProducts = await getProductsPageItems()
      setProducts(savedProducts)
    }
    loadProducts()
  }, [])

  // Get current products based on selected category
  const currentProducts = products[productCategory as keyof typeof products] || []

  // Update a specific product field
  const updateProduct = (productId: number, field: string, value: any) => {
    setProducts(prev => {
      const newProducts = { ...prev }
      const categoryProducts = [...newProducts[productCategory as keyof typeof newProducts]]
      const productIndex = categoryProducts.findIndex(p => p.id === productId)
      
      if (productIndex !== -1) {
        categoryProducts[productIndex] = {
          ...categoryProducts[productIndex],
          [field]: value
        }
        newProducts[productCategory as keyof typeof newProducts] = categoryProducts
      }
      
      saveProductsPageItems(newProducts)
      return newProducts
    })
  }

  return {
    products,
    setProducts,
    productCategory,
    setProductCategory,
    currentProducts,
    updateProduct,
    saveProductsPageItems
  }
}