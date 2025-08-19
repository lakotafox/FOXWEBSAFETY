import { promises as fs } from 'fs'
import path from 'path'

export interface Product {
  id: string | number
  title: string
  image: string
  description?: string
  features?: string[]
  price?: string
  specs?: string
  category?: string
}

let productsCache: Product[] | null = null

async function loadAllProductsServer(): Promise<Product[]> {
  if (productsCache) return productsCache

  try {
    const products: Product[] = []
    
    // Load products from JSON files on the server
    const publicDir = path.join(process.cwd(), 'public')
    
    try {
      const mainProductsPath = path.join(publicDir, 'main-products.json')
      const mainData = JSON.parse(await fs.readFile(mainProductsPath, 'utf-8'))
      
      if (mainData.products?.new) {
        products.push(...mainData.products.new.map((p: any) => ({
          ...p,
          category: 'new'
        })))
      }
      if (mainData.products?.battleTested) {
        products.push(...mainData.products.battleTested.map((p: any) => ({
          ...p,
          category: 'battle-tested'
        })))
      }
      if (mainData.products?.seating) {
        products.push(...mainData.products.seating.map((p: any) => ({
          ...p,
          category: 'seating'
        })))
      }
    } catch (e) {
      console.log('main-products.json not found')
    }

    try {
      const contentPath = path.join(publicDir, 'content.json')
      const contentData = JSON.parse(await fs.readFile(contentPath, 'utf-8'))
      
      if (contentData.products?.new) {
        products.push(...contentData.products.new.map((p: any) => ({
          ...p,
          category: 'new'
        })))
      }
      if (contentData.products?.battleTested) {
        products.push(...contentData.products.battleTested.map((p: any) => ({
          ...p,
          category: 'battle-tested'
        })))
      }
      if (contentData.products?.seating) {
        products.push(...contentData.products.seating.map((p: any) => ({
          ...p,
          category: 'seating'
        })))
      }
    } catch (e) {
      console.log('content.json not found')
    }

    try {
      const productsPath = path.join(publicDir, 'products.json')
      const productsData = JSON.parse(await fs.readFile(productsPath, 'utf-8'))
      
      Object.keys(productsData.products || {}).forEach(category => {
        const categoryProducts = productsData.products[category]
        if (Array.isArray(categoryProducts)) {
          products.push(...categoryProducts.map((p: any) => ({
            ...p,
            category: category.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()
          })))
        }
      })
    } catch (e) {
      console.log('products.json not found')
    }

    const uniqueProducts = products.filter((product, index, self) =>
      index === self.findIndex((p) => p.id === product.id && p.title === product.title)
    )

    productsCache = uniqueProducts
    return uniqueProducts
  } catch (error) {
    console.error('Error loading products:', error)
    return []
  }
}

export async function searchProductsServer(query: string): Promise<Product[]> {
  const products = await loadAllProductsServer()
  const searchTerms = query.toLowerCase().split(' ')

  const categoryKeywords: Record<string, string[]> = {
    'desk': ['desk', 'executive', 'workstation', 'table', 'writing'],
    'chair': ['chair', 'seating', 'seat', 'stool', 'ergonomic'],
    'storage': ['storage', 'cabinet', 'filing', 'shelving', 'locker', 'credenza'],
    'conference': ['conference', 'meeting', 'boardroom', 'collaboration'],
    'standing': ['standing', 'height adjustable', 'sit-stand', 'adjustable'],
    'reception': ['reception', 'lobby', 'waiting', 'lounge'],
    'refurbished': ['refurbished', 'pre-owned', 'used', 'battle-tested', 'budget']
  }

  let matchingCategory: string | null = null
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => searchTerms.some(term => keyword.includes(term)))) {
      matchingCategory = category
      break
    }
  }

  const scoredProducts = products.map(product => {
    let score = 0
    const productText = `${product.title} ${product.description || ''} ${(product.features || []).join(' ')} ${product.specs || ''} ${product.category || ''}`.toLowerCase()

    searchTerms.forEach(term => {
      if (productText.includes(term)) {
        score += 10
      }
    })

    if (product.title?.toLowerCase().includes(query.toLowerCase())) {
      score += 20
    }

    if (matchingCategory) {
      const categoryMatch = categoryKeywords[matchingCategory].some(keyword => 
        productText.includes(keyword)
      )
      if (categoryMatch) {
        score += 15
      }
    }

    if (query.toLowerCase().includes('budget') || query.toLowerCase().includes('affordable')) {
      if (product.category === 'battle-tested' || productText.includes('refurbished') || productText.includes('pre-owned')) {
        score += 25
      }
    }

    if (query.toLowerCase().includes('new')) {
      if (product.category === 'new' || !productText.includes('refurbished')) {
        score += 15
      }
    }

    return { product, score }
  })

  const results = scoredProducts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(item => item.product)

  if (results.length === 0 && products.length > 0) {
    return products.slice(0, 3)
  }

  return results
}