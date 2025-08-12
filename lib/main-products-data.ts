// Main page featured products - 3 items per category
export const defaultMainProducts = {
  new: [
    {
      id: 1,
      title: "Executive Desk Series",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: ["Solid wood construction", "Cable management", "5-year warranty"],
      price: ""
    },
    {
      id: 2,
      title: "Ergonomic Task Chair",
      image: "/images/reception-area.jpg",
      description: "",
      features: ["Lumbar support", "Adjustable arms", "Breathable mesh"],
      price: ""
    },
    {
      id: 3,
      title: "Conference Table",
      image: "/images/tanconf.jpg",
      description: "",
      features: ["Seats 8-12", "Power integration", "Premium finishes"],
      price: ""
    }
  ],
  battleTested: [
    {
      id: 10,
      title: "Pre-Owned Executive Desk",
      image: "/images/showroom-2.jpg",
      description: "",
      features: ["Inspected & certified", "Like-new condition", "50% off retail"],
      price: ""
    },
    {
      id: 11,
      title: "Refurbished Conference Set",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: ["Table & 8 chairs", "Professionally cleaned", "1-year warranty"],
      price: ""
    },
    {
      id: 12,
      title: "Pre-Owned Task Chairs",
      image: "/images/reception-area.jpg",
      description: "",
      features: ["Fully functional", "New casters", "Bulk discounts"],
      price: ""
    }
  ],
  seating: [
    {
      id: 19,
      title: "Executive Office Chair",
      image: "/images/showfacinggarage.jpg",
      description: "",
      features: ["Premium leather", "Memory foam", "Lifetime frame warranty"],
      price: ""
    },
    {
      id: 20,
      title: "Ergonomic Mesh Chair",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: ["3D armrests", "Synchro-tilt", "Weight-activated"],
      price: ""
    },
    {
      id: 21,
      title: "Conference Room Chairs",
      image: "/images/reception-area.jpg",
      description: "",
      features: ["Set of 6", "Matching design", "Commercial grade"],
      price: ""
    }
  ]
}

export function getMainProducts() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('foxbuilt-main-products')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved main products:', e)
        return defaultMainProducts
      }
    }
  }
  return defaultMainProducts
}

export function saveMainProducts(products: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('foxbuilt-main-products', JSON.stringify(products))
  }
}

// Helper function to get main page products from published JSON
export async function getPublishedMainProducts() {
  try {
    const response = await fetch('/main-products.json', { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      if (data.products) {
        return { products: data.products, crops: data.crops || {} }
      }
    }
  } catch (e) {
    console.log('No published main products file, using defaults')
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('foxbuilt-main-products')
    const savedCrops = localStorage.getItem('foxbuilt-main-crops')
    if (saved) {
      try {
        const products = JSON.parse(saved)
        const crops = savedCrops ? JSON.parse(savedCrops) : {}
        return { products, crops }
      } catch (e) {
        console.error('Error parsing saved main products:', e)
      }
    }
  }
  
  return { products: defaultMainProducts, crops: {} }
}