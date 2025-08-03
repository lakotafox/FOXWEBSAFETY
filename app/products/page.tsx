'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProductsPage() {
  const [productCategory, setProductCategory] = useState('new')
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  
  useEffect(() => {
    // Load crop settings from localStorage
    const savedCrops = localStorage.getItem('foxbuilt-products-page-crops')
    if (savedCrops) {
      try {
        setCropSettings(JSON.parse(savedCrops))
      } catch (e) {
        console.error('Error loading crop settings:', e)
      }
    }
  }, [])
  // Image URL helper function
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg"
    
    // Serve images locally from Netlify CDN for better performance
    // and to avoid GitHub rate limits for customers
    return imagePath
  }

  // Helper function to get products
  async function getProductsPageItems() {
    // First try to fetch from the published JSON file
    try {
      const response = await fetch('/products-page.json', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        if (data.products) {
          // Also load crop settings
          if (data.productsCrops) {
            return { products: data.products, crops: data.productsCrops }
          }
          return { products: data.products, crops: {} }
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
      products: {
        new: [
      {
        id: 1,
        title: "Executive Desk Series",
        image: "/images/desk grey L showroom.jpg",
        description: "Premium executive desks built to last",
        features: ["Solid wood construction", "Cable management", "5-year warranty"],
        price: "$2,499"
      },
      {
        id: 2,
        title: "Ergonomic Task Chair",
        image: "/images/reception-area.jpg",
        description: "All-day comfort for productive work",
        features: ["Lumbar support", "Adjustable arms", "Breathable mesh"],
        price: "$899"
      },
      {
        id: 3,
        title: "Conference Table",
        image: "/images/tanconf.jpg",
        description: "Impressive tables for important meetings",
        features: ["Seats 8-12", "Power integration", "Premium finishes"],
        price: "$3,999"
      },
      {
        id: 4,
        title: "Storage Cabinet",
        image: "/images/showroom-1.jpg",
        description: "Secure storage solutions",
        features: ["Locking drawers", "Adjustable shelves", "Anti-tip design"],
        price: "$799"
      },
      {
        id: 5,
        title: "Reception Desk",
        image: "/images/reception tan.jpg",
        description: "Make a great first impression",
        features: ["ADA compliant", "Built-in storage", "Custom sizes"],
        price: "$2,799"
      },
      {
        id: 6,
        title: "Standing Desk",
        image: "/images/showfacinggarage.jpg",
        description: "Height adjustable for health",
        features: ["Electric lift", "Memory settings", "Anti-collision"],
        price: "$1,299"
      },
      {
        id: 7,
        title: "Lounge Seating",
        image: "/images/Showroomwglassboard.jpg",
        description: "Comfortable waiting area furniture",
        features: ["Stain resistant", "Modular design", "USB charging"],
        price: "$1,599"
      },
      {
        id: 8,
        title: "File Cabinet",
        image: "/images/small desk.jpg",
        description: "Organize your important documents",
        features: ["Fire resistant", "Full extension", "Lock system"],
        price: "$499"
      },
      {
        id: 9,
        title: "Training Table",
        image: "/images/conference-room.jpg",
        description: "Flexible classroom solutions",
        features: ["Flip-top design", "Nesting storage", "Mobile casters"],
        price: "$699"
      }
    ],
    battleTested: [
      {
        id: 10,
        title: "Pre-Owned Executive Desk",
        image: "/images/showroom-2.jpg",
        description: "Quality pre-owned executive furniture",
        features: ["Inspected & certified", "Like-new condition", "50% off retail"],
        price: "$1,249"
      },
      {
        id: 11,
        title: "Refurbished Conference Set",
        image: "/images/desk grey L showroom.jpg",
        description: "Complete conference room solution",
        features: ["Table & 8 chairs", "Professionally cleaned", "1-year warranty"],
        price: "$2,999"
      },
      {
        id: 12,
        title: "Pre-Owned Task Chairs",
        image: "/images/reception-area.jpg",
        description: "High-quality used seating",
        features: ["Fully functional", "New casters", "Bulk discounts"],
        price: "$299"
      },
      {
        id: 13,
        title: "Refurbished Storage Units",
        image: "/images/showroom-1.jpg",
        description: "Pre-owned filing and storage",
        features: ["New locks installed", "Touch-up paint", "Various sizes"],
        price: "$399"
      },
      {
        id: 14,
        title: "Pre-Owned Workstations",
        image: "/images/tanconf.jpg",
        description: "Complete cubicle systems",
        features: ["Modular design", "Easy reconfiguration", "Great value"],
        price: "$899"
      },
      {
        id: 15,
        title: "Refurbished Reception Desk",
        image: "/images/reception tan.jpg",
        description: "Make an impression for less",
        features: ["Professional refinish", "Updated hardware", "60% off new"],
        price: "$1,799"
      },
      {
        id: 16,
        title: "Pre-Owned Lounge Set",
        image: "/images/Showroomwglassboard.jpg",
        description: "Comfortable waiting area furniture",
        features: ["Deep cleaned", "No visible wear", "Ready to use"],
        price: "$999"
      },
      {
        id: 17,
        title: "Refurbished Training Tables",
        image: "/images/conference-room.jpg",
        description: "Classroom and training solutions",
        features: ["Flip-top mechanism", "New wheels", "Set of 6 available"],
        price: "$449"
      },
      {
        id: 18,
        title: "Pre-Owned Executive Suite",
        image: "/images/showfacinggarage.jpg",
        description: "Complete executive office set",
        features: ["Desk, credenza, chair", "Matching finish", "Premium quality"],
        price: "$3,499"
      }
    ],
    seating: [
      {
        id: 19,
        title: "Ergonomic Office Chairs",
        image: "/images/reception-area.jpg",
        description: "All-day comfort seating",
        features: ["Lumbar support", "Adjustable everything", "5-year warranty"],
        price: "$699"
      },
      {
        id: 20,
        title: "Executive Leather Chairs",
        image: "/images/showroom-2.jpg",
        description: "Premium executive seating",
        features: ["Genuine leather", "Memory foam", "Lifetime frame warranty"],
        price: "$1,899"
      },
      {
        id: 21,
        title: "Conference Room Chairs",
        image: "/images/tanconf.jpg",
        description: "Professional meeting seating",
        features: ["Stackable option", "Arms available", "Bulk pricing"],
        price: "$399"
      },
      {
        id: 22,
        title: "Reception Area Seating",
        image: "/images/reception tan.jpg",
        description: "Welcoming lobby furniture",
        features: ["Anti-microbial fabric", "Modular design", "ADA compliant"],
        price: "$1,299"
      },
      {
        id: 23,
        title: "Task Chairs",
        image: "/images/small desk.jpg",
        description: "Versatile workplace seating",
        features: ["Height adjustable", "Swivel base", "Multiple colors"],
        price: "$449"
      },
      {
        id: 24,
        title: "Lounge Chairs",
        image: "/images/Showroomwglassboard.jpg",
        description: "Comfortable casual seating",
        features: ["Deep cushions", "Stain resistant", "Modern design"],
        price: "$799"
      },
      {
        id: 25,
        title: "Drafting Stools",
        image: "/images/showfacinggarage.jpg",
        description: "Height-adjustable work stools",
        features: ["Foot ring", "360° swivel", "Industrial rated"],
        price: "$349"
      },
      {
        id: 26,
        title: "Guest Chairs",
        image: "/images/desk grey L showroom.jpg",
        description: "Visitor and guest seating",
        features: ["No assembly required", "Stackable", "Easy clean"],
        price: "$299"
      },
      {
        id: 27,
        title: "Collaborative Seating",
        image: "/images/conference-room.jpg",
        description: "Modern team workspace chairs",
        features: ["Mobile base", "Tablet arm option", "Flexible design"],
        price: "$599"
      }
    ]
      },
      crops: {}
    }
  }

  // Load products data
  const [productsByCategory, setProductsByCategory] = useState<any>({
    new: [],
    battleTested: [],
    seating: []
  })
  
  useEffect(() => {
    // Load products when component mounts
    const loadProducts = async () => {
      const data = await getProductsPageItems()
      setProductsByCategory(data.products)
      setCropSettings(data.crops || {})
    }
    loadProducts()
  }, [])


  // Get current products based on selected category
  const currentProducts = productsByCategory[productCategory as keyof typeof productsByCategory] || []

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Header */}
      <div className="bg-slate-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black text-center text-white tracking-tight">
            OUR <span className="text-red-600">PRODUCTS</span>
          </h1>
        </div>
      </div>

      {/* Products Section */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          {/* Category Buttons */}
          <div className="flex justify-center mb-12">
            <div className="bg-slate-700 border-4 border-slate-600 p-2 flex flex-wrap justify-center">
              <Button
                className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                  productCategory === "new"
                    ? "bg-red-600 text-white border-2 border-red-600"
                    : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
                }`}
                onClick={() => setProductCategory("new")}
              >
                NEW
              </Button>
              <Button
                className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                  productCategory === "battleTested"
                    ? "bg-blue-600 text-white border-2 border-blue-600"
                    : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
                }`}
                onClick={() => setProductCategory("battleTested")}
              >
                PRE-OWNED
              </Button>
              <Button
                className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                  productCategory === "seating"
                    ? "bg-green-600 text-white border-2 border-green-600"
                    : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
                }`}
                onClick={() => setProductCategory("seating")}
              >
                SEATING
              </Button>
            </div>
          </div>

          {/* Column Headers */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-4">
            <div className="text-center">
              <span className={`inline-block px-4 py-2 font-black text-white ${
                productCategory === "new" ? "bg-red-600" : 
                productCategory === "battleTested" ? "bg-blue-600" : 
                "bg-green-600"
              }`}>
                {productCategory === "new" ? "NEW" : productCategory === "battleTested" ? "PRE-OWNED" : "COMFORT"}
              </span>
            </div>
            <div className="text-center hidden md:block">
              <span className={`inline-block px-4 py-2 font-black text-white ${
                productCategory === "new" ? "bg-red-600" : 
                productCategory === "battleTested" ? "bg-blue-600" : 
                "bg-green-600"
              }`}>
                {productCategory === "new" ? "NEW" : productCategory === "battleTested" ? "PRE-OWNED" : "COMFORT"}
              </span>
            </div>
            <div className="text-center hidden md:block">
              <span className={`inline-block px-4 py-2 font-black text-white ${
                productCategory === "new" ? "bg-red-600" : 
                productCategory === "battleTested" ? "bg-blue-600" : 
                "bg-green-600"
              }`}>
                {productCategory === "new" ? "NEW" : productCategory === "battleTested" ? "PRE-OWNED" : "COMFORT"}
              </span>
            </div>
          </div>

          {/* Products Grid - Show 9 products (3x3) */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {currentProducts.slice(0, 9).map((product) => (
              <Card
                key={product.id}
                className={`overflow-hidden hover:shadow-2xl transition-all border-4 border-slate-600 bg-zinc-100 ring-2 ${
                  productCategory === "new"
                    ? "ring-red-500"
                    : productCategory === "battleTested"
                      ? "ring-blue-500"
                      : "ring-green-500"
                }`}
              >
                <div className="relative h-56 overflow-hidden">
                  {(() => {
                    const crop = cropSettings[product.image] || { scale: 1, x: 50, y: 50 }
                    return (
                      <div 
                        className="absolute inset-0"
                        style={{
                          transform: `translate(${crop.x - 50}%, ${crop.y - 50}%) scale(${crop.scale})`
                        }}
                      >
                        <Image 
                          src={getImageUrl(product.image)} 
                          alt={product.title} 
                          width={500}
                          height={500}
                          className="w-full h-full object-contain"
                          unoptimized
                        />
                      </div>
                    )
                  })()}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-black mb-3 tracking-wide">{product.title}</h3>
                  <p className="text-slate-600 mb-4 font-semibold">{product.description}</p>
                  {product.features && (
                    <ul className="text-sm text-slate-500 mb-4 space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              productCategory === "new"
                                ? "bg-red-600"
                                : productCategory === "battleTested"
                                  ? "bg-blue-600"
                                  : "bg-green-600"
                            }`}
                          ></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-2xl font-black ${
                        productCategory === "new"
                          ? "text-red-600"
                          : productCategory === "battleTested"
                            ? "text-blue-600"
                            : "text-green-600"
                      }`}
                    >
                      {product.price}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}