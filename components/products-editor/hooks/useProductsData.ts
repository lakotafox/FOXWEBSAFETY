'use client'

import { useState, useEffect } from 'react'
import { defaultProductsPageItems, getProductsPageItems as getProductsData, saveProductsPageItems as saveProductsData } from '@/lib/products-page-data'

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
    console.log('No published products file, using defaults')
  }
  
  // Use the library function which handles localStorage
  return getProductsData()
}

function saveProductsPageItems(products: any) {
  saveProductsData(products)
}

export function useProductsData(categoryId?: string) {
  const [products, setProducts] = useState<any>({})
  const [productCategory, setProductCategory] = useState(categoryId || 'executive-desks')
  const [pageName, setPageName] = useState('')

  // Load products and page name on mount
  useEffect(() => {
    const loadProducts = async () => {
      if (!categoryId) return
      
      // Try to load category-specific products
      try {
        const response = await fetch(`/products-${categoryId}.json`, { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || {})
          if (data.pageName) {
            setPageName(data.pageName)
          }
          return
        }
      } catch (e) {
        console.log(`No products file for ${categoryId}, creating default`)
      }
      
      // Create default structure for new category - use kebab-case key with real images
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
      
      const defaultProducts = {
        [categoryId]: Array.from({ length: 9 }, (_, i) => ({
          id: i + 1,
          title: `Product ${i + 1}`,
          image: defaultImages[i] || '/images/showroom-1.jpg',
          description: '',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          price: ''
        }))
      }
      
      setProducts(defaultProducts)
      
      // Set default page name based on category ID
      const categoryNames: Record<string, string> = {
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
      
      setPageName(categoryNames[categoryId] || 'Products')
    }
    loadProducts()
  }, [categoryId])

  // Get current products based on selected category using kebab-case
  // Ensure products is an object and the category exists
  const currentProducts = (products && products[productCategory]) ? products[productCategory] : []

  // Update a specific product field
  const updateProduct = (productId: number, field: string, value: any) => {
    setProducts(prev => {
      const newProducts = { ...prev }
      const categoryProducts = [...(newProducts[productCategory] || [])]
      const productIndex = categoryProducts.findIndex(p => p.id === productId)
      
      if (productIndex !== -1) {
        categoryProducts[productIndex] = {
          ...categoryProducts[productIndex],
          [field]: value
        }
        newProducts[productCategory] = categoryProducts
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
    saveProductsPageItems,
    pageName,
    setPageName
  }
}