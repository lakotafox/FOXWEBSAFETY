'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, MapPin, Mail } from 'lucide-react'
import FullImageModal from '@/components/ui/FullImageModal'

export default function ProductsPage() {
  const [productCategory, setProductCategory] = useState('new')
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [showAddress, setShowAddress] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
  const [fullImageSrc, setFullImageSrc] = useState('')
  const [fullImageAlt, setFullImageAlt] = useState('')
  const [showFloatingCategories, setShowFloatingCategories] = useState(false)
  const categoryButtonsRef = useRef<HTMLDivElement>(null)
  
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

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      
      // Check if category buttons are out of view
      if (categoryButtonsRef.current) {
        const rect = categoryButtonsRef.current.getBoundingClientRect()
        setShowFloatingCategories(rect.bottom < 0)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
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
      products: {
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

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // EmailJS configuration (same as main page)
      const EMAILJS_SERVICE_ID = "service_axmx4b8"
      const EMAILJS_TEMPLATE_ID = "template_r90th68"
      const EMAILJS_PUBLIC_KEY = "_C1u7k95AKuGRXqea"

      // Load EmailJS script dynamically
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
      document.head.appendChild(script)
      
      script.onload = async () => {
        try {
          // @ts-ignore
          window.emailjs.init(EMAILJS_PUBLIC_KEY)
          
          // Send email
          // @ts-ignore
          const response = await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone,
            message: formData.message
          })
          
          console.log('Email sent successfully:', response)
          alert("Thanks! Your quote request has been sent. We'll get back to you soon!")
          
          // Reset form
          setFormData({
            name: "",
            email: "",
            phone: "",
            message: ""
          })
        } catch (emailError) {
          console.error('EmailJS error:', emailError)
          alert("Error sending email. Please try again or call us at (801) 899-9406")
        }
      }
      
      script.onerror = () => {
        alert("Error loading email service. Please try again or call us at (801) 899-9406")
      }
      
    } catch (error) {
      console.error('Form submission error:', error)
      alert("Error submitting form. Please try again or call us at (801) 899-9406")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Floating Action Buttons - Desktop Only */}
      <div className="hidden md:flex fixed top-32 left-8 flex-col gap-3 z-50">
        <button
          onClick={() => window.location.href = 'tel:+18018999406'}
          className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
          aria-label="Call us"
        >
          <Phone className="w-8 h-8" />
        </button>
        <button
          onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=420+W+Industrial+Dr+Building+LL+Pleasant+Grove+UT+84062', '_blank')}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
          aria-label="View on map"
        >
          <MapPin className="w-8 h-8" />
        </button>
        <button
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
          aria-label="Send email"
        >
          <Mail className="w-8 h-8" />
        </button>
      </div>

      {/* Floating Category Buttons - Desktop Only */}
      {showFloatingCategories && (
        <div className="hidden md:flex fixed top-1/2 right-2 -translate-y-1/2 flex-col gap-4 z-50">
          <Button
            className={`font-black text-sm px-3 py-3 tracking-wide transition-all shadow-lg ${
              productCategory === "new"
                ? "bg-red-600 text-white border-2 border-red-600"
                : "bg-slate-700 text-zinc-300 hover:text-white border-2 border-slate-600 hover:bg-slate-600"
            }`}
            onClick={() => setProductCategory("new")}
          >
            NEW
          </Button>
          <Button
            className={`font-black text-sm px-3 py-3 tracking-wide transition-all shadow-lg ${
              productCategory === "battleTested"
                ? "bg-blue-600 text-white border-2 border-blue-600"
                : "bg-slate-700 text-zinc-300 hover:text-white border-2 border-slate-600 hover:bg-slate-600"
            }`}
            onClick={() => setProductCategory("battleTested")}
          >
            PRE OWN
          </Button>
          <Button
            className={`font-black text-sm px-3 py-3 tracking-wide transition-all shadow-lg ${
              productCategory === "seating"
                ? "bg-green-600 text-white border-2 border-green-600"
                : "bg-slate-700 text-zinc-300 hover:text-white border-2 border-slate-600 hover:bg-slate-600"
            }`}
            onClick={() => setProductCategory("seating")}
          >
            SEAT
          </Button>
        </div>
      )}


      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b-4 border-red-600 shadow-xl transition-all duration-500 ${
          isScrolled ? "py-0.25" : "py-1.5"
        } md:py-0.25`}
      >
        <div className="container mx-auto px-4">
          {/* Desktop Header - No dynamic sizing */}
          <div className="hidden md:flex items-center justify-between">
            {/* Logo on left */}
            <div>
              <Image
                src="/images/foxbuilt-logo.png"
                alt="FoxBuilt Logo"
                width={120}
                height={45}
                className="h-auto"
              />
            </div>
            
            {/* Centered PRODUCTS text */}
            <h1 className="text-2xl font-black text-white tracking-tight absolute left-1/2 transform -translate-x-1/2">
              <span className="text-red-600">PRODUCTS</span>
            </h1>
            
            {/* Home button - Desktop */}
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-2"
            >
              HOME
            </Button>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            {/* Logo */}
            <button 
              onClick={() => window.location.href = '/'}
              className={`transition-all duration-500 ${isScrolled ? "scale-75" : "scale-100"}`}
            >
              <Image
                src="/images/foxbuilt-logo.png"
                alt="FoxBuilt Logo"
                width={isScrolled ? 80 : 120}
                height={isScrolled ? 30 : 45}
                className="h-auto"
              />
            </button>

            {/* Center Title */}
            <h1 className={`font-black text-white tracking-tight ${isScrolled ? "text-xl" : "text-2xl"}`}>
              <span className="text-red-600">PRODUCTS</span>
            </h1>

            {/* Mobile Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = 'tel:+18018999406'}
                className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center"
                aria-label="Call us"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=420+W+Industrial+Dr+Building+LL+Pleasant+Grove+UT+84062', '_blank')}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center"
                aria-label="View on map"
              >
                <MapPin className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center"
                aria-label="Send email"
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      {/* Products Section */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          {/* Category Buttons */}
          <div ref={categoryButtonsRef} className="flex justify-center mb-12">
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


          {/* Products Grid - Show all products */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {currentProducts.map((product) => (
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
                <div 
                  className="relative h-56 overflow-hidden bg-black cursor-pointer"
                  onClick={() => {
                    setFullImageSrc(getImageUrl(product.image))
                    setFullImageAlt(product.title)
                    setShowFullImage(true)
                  }}
                >
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
                <CardContent className="pt-2 px-6 pb-3">
                  <h3 className="text-xl font-black mb-1 tracking-wide">{product.title}</h3>
                  {product.description && (
                    <p className="text-slate-600 mb-1 font-semibold">{product.description}</p>
                  )}
                  {product.features && (
                    <ul className="text-sm text-slate-500 space-y-0.5">
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
                  {product.price && (
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
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Visit Our Showroom CTA */}
      <section className="py-20 bg-zinc-100">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-red-600 to-blue-600 text-white border-8 border-slate-700 p-10 text-center">
              <h3 className="text-3xl font-black mb-6 tracking-wide">WANT TO SEE IT IN PERSON?</h3>
              <p className="text-xl mb-8 font-bold">
                We are located in Pleasant Grove right off of the freeway. Drinks are cold, snacks are
                free, and the furniture is built to last.
              </p>
              <Button
                className="bg-white text-slate-900 hover:bg-zinc-200 font-black text-lg px-8 py-4 border-4 border-slate-900"
                onClick={() => setShowAddress(!showAddress)}
              >
                {showAddress ? "HIDE ADDRESS" : "VISIT SHOWROOM"}
              </Button>

              {showAddress && (
                <div className="mt-8 bg-white/10 border-4 border-white p-6 text-center">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-4">
                      <MapPin className="w-6 h-6 text-white" />
                      <a 
                        href="https://www.google.com/maps/search/?api=1&query=420+W+Industrial+Dr+Building+LL+Pleasant+Grove+UT+84062"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-zinc-200 transition-colors"
                      >
                        <p className="text-xl font-bold">420 W Industrial Dr Building LL</p>
                        <p className="text-xl font-bold">Pleasant Grove, UT 84062</p>
                      </a>
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <Phone className="w-6 h-6 text-white" />
                      <a href="tel:+18018999406" className="text-xl font-bold hover:text-zinc-200 transition-colors">
                        (801) 899-9406
                      </a>
                    </div>
                    <div className="text-lg font-bold text-zinc-200">
                      <p>Monday–Friday: 10:00am–5:00pm</p>
                      <p>Saturday–Sunday: By Appointment</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-black text-center text-white mb-16 tracking-tight">
            CONTACT US
          </h2>

          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            <div>
              <h3 className="text-3xl font-black mb-8 tracking-wide">CONTACT INFO</h3>
              <div className="space-y-6">
                <a href="tel:+18018999406" className="flex items-center space-x-4 hover:opacity-80 transition-opacity -mx-4 px-4 py-3 rounded-lg">
                  <div className="w-12 h-12 bg-red-600 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">
                    (801) 899-9406
                  </span>
                </a>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-600 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=420+W+Industrial+Dr+Building+LL+Pleasant+Grove+UT+84062"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-400 transition-colors"
                  >
                    <p className="text-xl font-bold">420 W Industrial Dr Building LL</p>
                    <p className="text-xl font-bold">Pleasant Grove, UT 84062</p>
                  </a>
                </div>
              </div>

              <div className="mt-12">
                <h4 className="text-2xl font-black mb-6 tracking-wide">STORE HOURS</h4>
                <div className="space-y-3 text-zinc-300">
                  <p className="text-lg font-bold">Monday–Friday: 10:00am–5:00pm</p>
                  <p className="text-lg font-bold">Saturday–Sunday: By Appointment</p>
                </div>
              </div>
            </div>

            <div>
              <form className="space-y-6" onSubmit={handleFormSubmit}>
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="NAME"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-6 py-4 bg-slate-800 border-4 border-slate-700 text-white placeholder-zinc-400 font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="EMAIL *"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-6 py-4 bg-slate-800 border-4 border-slate-700 text-white placeholder-zinc-400 font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="PHONE"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-6 py-4 bg-slate-800 border-4 border-slate-700 text-white placeholder-zinc-400 font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    placeholder="TELL US WHAT YOU NEED"
                    rows={4}
                    value={formData.message}
                    onChange={handleFormChange}
                    className="w-full px-6 py-4 bg-slate-800 border-4 border-slate-700 text-white placeholder-zinc-400 font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 py-4 font-black text-lg tracking-widest border-4 border-red-600 disabled:opacity-50"
                >
                  {isSubmitting ? "SENDING..." : "SEND A MESSAGE"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 border-t-4 border-red-600 text-zinc-400 py-6">
        <div className="container mx-auto px-4">
          <p className="text-sm font-bold">&copy; 2025, FOXBUILT. ESTABLISHED 1999. BUILT IN AMERICA.</p>
          <p className="text-xs text-zinc-500 mt-1">THIS SITE IS A PRODUCT OF LAKOTA.CODE.CO. USER ACCEPTS IT IS WHAT IT IS.</p>
          <p className="text-xs text-yellow-500 mt-1">Want a free website? Email lakota.code@gmail.com</p>
        </div>
      </footer>
      
      {/* Full Image Modal */}
      <FullImageModal 
        isOpen={showFullImage}
        onClose={() => setShowFullImage(false)}
        imageSrc={fullImageSrc}
        imageAlt={fullImageAlt}
      />
    </div>
  )
}