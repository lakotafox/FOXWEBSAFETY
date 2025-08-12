export const defaultProducts = {
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
    },
    {
      id: 4,
      title: "Storage Cabinet",
      image: "/images/showroom-1.jpg",
      description: "",
      features: ["Locking drawers", "Adjustable shelves", "Anti-tip design"],
      price: ""
    },
    {
      id: 5,
      title: "Reception Desk",
      image: "/images/reception tan.jpg",
      description: "",
      features: ["ADA compliant", "Built-in storage", "Custom sizes"],
      price: ""
    },
    {
      id: 6,
      title: "Standing Desk",
      image: "/images/showfacinggarage.jpg",
      description: "",
      features: ["Electric lift", "Memory settings", "Anti-collision"],
      price: ""
    },
    {
      id: 7,
      title: "Lounge Seating",
      image: "/images/Showroomwglassboard.jpg",
      description: "",
      features: ["Stain resistant", "Modular design", "USB charging"],
      price: ""
    },
    {
      id: 8,
      title: "File Cabinet",
      image: "/images/small desk.jpg",
      description: "",
      features: ["Fire resistant", "Full extension", "Lock system"],
      price: ""
    },
    {
      id: 9,
      title: "Training Table",
      image: "/images/conference-room.jpg",
      description: "",
      features: ["Flip-top design", "Nesting storage", "Mobile casters"],
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
    },
    {
      id: 13,
      title: "Refurbished Storage Units",
      image: "/images/showroom-1.jpg",
      description: "",
      features: ["New locks installed", "Touch-up paint", "Various sizes"],
      price: ""
    },
    {
      id: 14,
      title: "Pre-Owned Workstations",
      image: "/images/tanconf.jpg",
      description: "",
      features: ["Modular design", "Easy reconfiguration", "Great value"],
      price: ""
    },
    {
      id: 15,
      title: "Refurbished Reception Desk",
      image: "/images/reception tan.jpg",
      description: "",
      features: ["Professional refinish", "Updated hardware", "60% off new"],
      price: ""
    },
    {
      id: 16,
      title: "Pre-Owned Lounge Set",
      image: "/images/Showroomwglassboard.jpg",
      description: "",
      features: ["Deep cleaned", "No visible wear", "Ready to use"],
      price: ""
    },
    {
      id: 17,
      title: "Refurbished Training Tables",
      image: "/images/conference-room.jpg",
      description: "",
      features: ["Flip-top mechanism", "New wheels", "Set of 6 available"],
      price: ""
    },
    {
      id: 18,
      title: "Pre-Owned Executive Suite",
      image: "/images/showfacinggarage.jpg",
      description: "",
      features: ["Desk, credenza, chair", "Matching finish", "Premium quality"],
      price: ""
    }
  ],
  seating: [
    {
      id: 19,
      title: "Ergonomic Office Chairs",
      image: "/images/reception-area.jpg",
      description: "",
      features: ["Lumbar support", "Adjustable everything", "5-year warranty"],
      price: ""
    },
    {
      id: 20,
      title: "Executive Leather Chairs",
      image: "/images/showroom-2.jpg",
      description: "",
      features: ["Genuine leather", "Memory foam", "Lifetime frame warranty"],
      price: ""
    },
    {
      id: 21,
      title: "Conference Room Chairs",
      image: "/images/tanconf.jpg",
      description: "",
      features: ["Stackable option", "Arms available", "Bulk pricing"],
      price: ""
    },
    {
      id: 22,
      title: "Reception Area Seating",
      image: "/images/reception tan.jpg",
      description: "",
      features: ["Anti-microbial fabric", "Modular design", "ADA compliant"],
      price: ""
    },
    {
      id: 23,
      title: "Task Chairs",
      image: "/images/small desk.jpg",
      description: "",
      features: ["Height adjustable", "Swivel base", "Multiple colors"],
      price: ""
    },
    {
      id: 24,
      title: "Lounge Chairs",
      image: "/images/Showroomwglassboard.jpg",
      description: "",
      features: ["Deep cushions", "Stain resistant", "Modern design"],
      price: ""
    },
    {
      id: 25,
      title: "Drafting Stools",
      image: "/images/showfacinggarage.jpg",
      description: "",
      features: ["Foot ring", "360° swivel", "Industrial rated"],
      price: ""
    },
    {
      id: 26,
      title: "Guest Chairs",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: ["No assembly required", "Stackable", "Easy clean"],
      price: ""
    },
    {
      id: 27,
      title: "Collaborative Seating",
      image: "/images/conference-room.jpg",
      description: "",
      features: ["Mobile base", "Tablet arm option", "Flexible design"],
      price: ""
    }
  ]
}

export function getProducts() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('foxbuilt-products')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved products:', e)
        return defaultProducts
      }
    }
  }
  return defaultProducts
}

export function saveProducts(products: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('foxbuilt-products', JSON.stringify(products))
  }
}

// Helper function to get products for products page
export async function getProductsPageItems() {
  // First try to fetch from the published products.json file
  try {
    const response = await fetch('/products.json', { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      if (data.products) {
        // Get crops from productsCrops or extract from products
        const productCrops: any = data.productsCrops || {}
        
        // Also check for embedded imageCrop in products
        Object.values(data.products).forEach((categoryProducts: any) => {
          categoryProducts.forEach((product: any) => {
            if (product.imageCrop && product.image) {
              productCrops[product.image] = product.imageCrop
            }
          })
        })
        
        return { products: data.products, crops: productCrops }
      }
    }
  } catch (e) {
    console.log('No published products file, using defaults')
  }
  
  // Fallback to localStorage for preview
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('foxbuilt-products-page')
    const savedCrops = localStorage.getItem('foxbuilt-products-page-crops')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const crops = savedCrops ? JSON.parse(savedCrops) : {}
        return {
          products: {
            new: parsed.new || [],
            battleTested: parsed.battleTested || [],
            seating: parsed.seating || []
          },
          crops
        }
      } catch (e) {
        console.error('Error parsing saved products:', e)
      }
    }
  }
  
  // Return default products if nothing saved
  return {
    products: defaultProducts,
    crops: {}
  }
}