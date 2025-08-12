// Products page items - 9 different items per category (not shown on main page)
export const defaultProductsPageItems = {
  new: [
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
    },
    {
      id: 28,
      title: "Bookshelf Unit",
      image: "/images/tanconf.jpg",
      description: "",
      features: ["5 adjustable shelves", "Anti-sag design", "Wall anchor included"],
      price: ""
    },
    {
      id: 29,
      title: "Mobile Pedestal",
      image: "/images/reception-area.jpg",
      description: "",
      features: ["3 drawers", "Lock system", "Cushion top option"],
      price: ""
    },
    {
      id: 30,
      title: "Privacy Screen",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: ["Acoustic panels", "Modular system", "Tool-free assembly"],
      price: ""
    }
  ],
  battleTested: [
    {
      id: 13,
      title: "Used Herman Miller Aeron",
      image: "/images/showroom-1.jpg",
      description: "",
      features: ["Grade A condition", "Fully adjustable", "60% savings"],
      price: ""
    },
    {
      id: 14,
      title: "Pre-Owned Workstations",
      image: "/images/tanconf.jpg",
      description: "",
      features: ["6x6 cubicles", "Power/data ready", "Quantity discounts"],
      price: ""
    },
    {
      id: 15,
      title: "Refurbished Steelcase Desk",
      image: "/images/small desk.jpg",
      description: "",
      features: ["Height adjustable", "New laminate top", "90-day warranty"],
      price: ""
    },
    {
      id: 16,
      title: "Used Training Tables",
      image: "/images/Showroomwglassboard.jpg",
      description: "",
      features: ["Various sizes", "Folding design", "Bulk pricing"],
      price: ""
    },
    {
      id: 17,
      title: "Pre-Owned Filing Systems",
      image: "/images/reception tan.jpg",
      description: "",
      features: ["Lateral files", "Fireproof options", "Key included"],
      price: ""
    },
    {
      id: 18,
      title: "Refurbished Reception Furniture",
      image: "/images/conference-room.jpg",
      description: "",
      features: ["Complete set", "Modern look", "Installation available"],
      price: ""
    },
    {
      id: 31,
      title: "Used Conference Phones",
      image: "/images/showroom-2.jpg",
      description: "",
      features: ["Polycom units", "Tested & working", "Cables included"],
      price: ""
    },
    {
      id: 32,
      title: "Pre-Owned Whiteboards",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: ["Magnetic surface", "Wall mounted", "Various sizes"],
      price: ""
    },
    {
      id: 33,
      title: "Refurbished Storage Lockers",
      image: "/images/reception-area.jpg",
      description: "",
      features: ["Employee lockers", "New locks", "Powder coated"],
      price: ""
    }
  ],
  seating: [
    {
      id: 22,
      title: "Stacking Chairs",
      image: "/images/tanconf.jpg",
      description: "",
      features: ["Stack 10 high", "Ganging option", "10-year warranty"],
      price: ""
    },
    {
      id: 23,
      title: "Big & Tall Chair",
      image: "/images/reception tan.jpg",
      description: "",
      features: ["500lb capacity", "Extra wide seat", "Heavy-duty base"],
      price: ""
    },
    {
      id: 24,
      title: "24/7 Task Chair",
      image: "/images/small desk.jpg",
      description: "",
      features: ["Multi-shift use", "Heavy-duty fabric", "5-year warranty"],
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
    },
    {
      id: 34,
      title: "Bench Seating",
      image: "/images/Showroomwglassboard.jpg",
      description: "",
      features: ["3-person capacity", "Storage below", "Upholstered top"],
      price: ""
    },
    {
      id: 35,
      title: "Kneeling Chair",
      image: "/images/showroom-1.jpg",
      description: "",
      features: ["Ergonomic design", "Adjustable height", "Improves posture"],
      price: ""
    },
    {
      id: 36,
      title: "Ball Chair",
      image: "/images/reception-area.jpg",
      description: "",
      features: ["Active sitting", "Core strength", "Includes pump"],
      price: ""
    }
  ]
}

export function getProductsPageItems() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('foxbuilt-products-page')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved products page items:', e)
        return defaultProductsPageItems
      }
    }
  }
  return defaultProductsPageItems
}

export function saveProductsPageItems(products: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('foxbuilt-products-page', JSON.stringify(products))
  }
}

// Helper function to get products page items from published JSON
export async function getPublishedProductsPageItems() {
  try {
    const response = await fetch('/products.json', { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      if (data.products) {
        return { products: data.products, crops: data.productsCrops || {} }
      }
    }
  } catch (e) {
    console.log('No published products file, using defaults')
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('foxbuilt-products-page')
    const savedCrops = localStorage.getItem('foxbuilt-products-page-crops')
    if (saved) {
      try {
        const products = JSON.parse(saved)
        const crops = savedCrops ? JSON.parse(savedCrops) : {}
        return { products, crops }
      } catch (e) {
        console.error('Error parsing saved products:', e)
      }
    }
  }
  
  return { products: defaultProductsPageItems, crops: {} }
}