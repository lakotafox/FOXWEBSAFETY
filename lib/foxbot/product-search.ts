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

async function loadAllProducts(): Promise<Product[]> {
  // Always fetch fresh data - don't use cache
  // This ensures FOXBOT gets updated products after publish
  
  try {
    const products: Product[] = []
    
    const mainResponse = await fetch('/main-products.json', { cache: 'no-store' })
    if (mainResponse.ok) {
      const mainData = await mainResponse.json()
      
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
    }

    const contentResponse = await fetch('/content.json', { cache: 'no-store' })
    if (contentResponse.ok) {
      const contentData = await contentResponse.json()
      
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
    }

    const productsResponse = await fetch('/products.json', { cache: 'no-store' })
    if (productsResponse.ok) {
      const productsData = await productsResponse.json()
      
      Object.keys(productsData.products || {}).forEach(category => {
        const categoryProducts = productsData.products[category]
        if (Array.isArray(categoryProducts)) {
          products.push(...categoryProducts.map((p: any) => ({
            ...p,
            category: category.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()
          })))
        }
      })
    }

    const uniqueProducts = products.filter((product, index, self) =>
      index === self.findIndex((p) => p.id === product.id && p.title === product.title)
    )

    // Don't cache - always return fresh data
    return uniqueProducts
  } catch (error) {
    console.error('Error loading products:', error)
    return []
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await loadAllProducts()
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