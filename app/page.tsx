"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Phone, Mail, MapPin, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getProducts, defaultProducts } from "@/lib/products-data"

export default function FoxBuiltWebsite() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredCategory, setFeaturedCategory] = useState("new")
  const [showAddress, setShowAddress] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState(defaultProducts)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [galleryCrops, setGalleryCrops] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  
  // Helper function to get displayable image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg"
    
    // For any /images/ path, always use GitHub raw URL
    if (imagePath.startsWith('/images/')) {
      return `https://raw.githubusercontent.com/lakotafox/FOXSITE/main/public${imagePath}`
    }
    
    // Default
    return imagePath
  }

  // Gallery images
  const defaultGalleryImages = [
    "/images/showroom-1.jpg",
    "/images/showroom-2.jpg",
    "/images/Showroomwglassboard.jpg",
    "/images/showfacinggarage.jpg",
    "/images/tanconf.jpg",
    "/images/reception tan.jpg",
  ]
  const [galleryImages, setGalleryImages] = useState(defaultGalleryImages)

  // Load products from content.json
  useEffect(() => {
    // First try to load from content.json
    fetch('/content.json')
      .then(response => response.json())
      .then(data => {
        if (data.products) {
          setFeaturedProducts(data.products)
          
          // Extract crop settings from products
          const crops: {[key: string]: {scale: number, x: number, y: number}} = {}
          Object.keys(data.products).forEach(category => {
            data.products[category].forEach((product: any) => {
              if (product.imageCrop && product.image) {
                crops[product.image] = product.imageCrop
              }
            })
          })
          setCropSettings(crops)
        }
        if (data.gallery) {
          setGalleryImages(data.gallery)
        }
        if (data.galleryCrops) {
          setGalleryCrops(data.galleryCrops)
        }
      })
      .catch(error => {
        console.error('Error loading content.json, falling back to defaults:', error)
        // Fallback to localStorage/defaults if content.json fails
        setFeaturedProducts(getProducts())
        
        const savedGallery = localStorage.getItem('foxbuilt-gallery')
        if (savedGallery) {
          try {
            setGalleryImages(JSON.parse(savedGallery))
          } catch (e) {
            console.error('Error loading gallery images:', e)
          }
        }
      })
  }, [])

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Auto-slide gallery
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [galleryImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // EmailJS configuration
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
    <div className="min-h-screen bg-zinc-100">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b-4 border-red-600 shadow-xl transition-all duration-500 ${
          isScrolled ? "py-0.25" : "py-1.5"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className={`transition-all duration-500 ${isScrolled ? "scale-50" : "scale-100"}`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="/images/foxbuilt-logo.png"
                  alt="FoxBuilt Logo"
                  width={isScrolled ? 80 : 160}
                  height={isScrolled ? 30 : 60}
                  className="h-auto transition-all duration-500"
                />
              </div>
            </div>
          </div>

          {/* Phone Number - Always Visible */}
          <div
            className={`hidden md:flex items-center space-x-2 transition-all duration-500 ${isScrolled ? "scale-75" : "scale-100"}`}
          >
            <Phone className={`text-red-500 ${isScrolled ? "w-4 h-4" : "w-5 h-5"}`} />
            <span className={`text-white font-black tracking-wide ${isScrolled ? "text-sm" : "text-lg"}`}>
              (801) 899-9406
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide border-2 border-blue-600 hover:border-blue-700 transition-all duration-500 ${
                isScrolled ? "px-2 py-1 text-xs" : "px-4 py-2 text-sm"
              }`}
              onClick={() => {
                window.open('/catolog no page one.pdf', '_blank')
              }}
            >
              <FileText className={`${isScrolled ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"}`} />
              CATALOG
            </Button>

            <Button
              className={`bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide border-2 border-red-600 hover:border-red-700 transition-all duration-500 ${
                isScrolled ? "px-3 py-1 text-sm" : "px-6 py-2"
              }`}
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              GET QUOTE
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 py-24 text-white relative overflow-hidden">
        {/* American background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-blue-600/20"></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-white to-blue-600"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight">
            AMERICAN MADE
            <br />
            <span className="text-red-500">WORKSPACE</span>
            <br />
            <span className="text-blue-400">SOLUTIONS</span>
          </h1>
          <div className="mb-8">
            <span className="inline-block bg-red-600 text-white px-6 py-3 text-sm font-black uppercase tracking-widest border-4 border-white">
              🇺🇸 27 YEARS STRONG 🇺🇸
            </span>
          </div>
          <p className="text-xl text-zinc-300 mb-10 max-w-3xl mx-auto font-bold leading-relaxed">
            BUILT TOUGH. BUILT RIGHT. BUILT TO LAST.
            <br />
            From executive offices to heavy-duty workstations - we outfit America's workforce.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white font-black text-lg px-10 py-4 border-4 border-white tracking-widest"
              onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
            >
              VISIT SHOWROOM
            </Button>
            <Button
              size="lg"
              className="bg-black hover:bg-zinc-800 text-white font-black text-lg px-10 py-4 border-4 border-white tracking-widest"
            >
              (801) 899-9406
            </Button>
          </div>
        </div>
      </section>

      {/* Auto-sliding Gallery */}
      <section id="gallery" className="py-20 bg-zinc-100">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-black text-center text-slate-900 mb-16 tracking-tight">
            AMERICAN <span className="text-red-600">CRAFTSMANSHIP</span>
          </h2>
          <div className="relative max-w-6xl mx-auto">
            <div className="relative h-96 md:h-[500px] overflow-hidden border-8 border-slate-700">
              {galleryImages.map((image, index) => {
                const crop = galleryCrops[image] || { scale: 1, x: 50, y: 50 }
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div 
                      className="absolute inset-0"
                      style={{
                        transform: `translate(${crop.x - 50}%, ${crop.y - 50}%) scale(${crop.scale})`
                      }}
                    >
                      <Image 
                        src={getImageUrl(image)} 
                        alt={`Project ${index + 1}`} 
                        width={1000}
                        height={600}
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Navigation buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 p-4 border-4 border-white shadow-xl transition-all"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 p-4 border-4 border-white shadow-xl transition-all"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>

            {/* Slide indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-4 h-4 border-2 border-white transition-all ${
                    index === currentSlide ? "bg-red-600" : "bg-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-black text-center text-white mb-16 tracking-tight">
            FEATURED <span className="text-blue-400">PRODUCTS</span>
          </h2>

          {/* Category Buttons */}
          <div className="flex justify-center mb-12">
            <div className="bg-slate-700 border-4 border-slate-600 p-2 flex flex-wrap justify-center">
              <Button
                className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                  featuredCategory === "new"
                    ? "bg-red-600 text-white border-2 border-red-600"
                    : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
                }`}
                onClick={() => setFeaturedCategory("new")}
              >
                NEW
              </Button>
              <Button
                className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                  featuredCategory === "battleTested"
                    ? "bg-blue-600 text-white border-2 border-blue-600"
                    : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
                }`}
                onClick={() => setFeaturedCategory("battleTested")}
              >
                BATTLE TESTED
              </Button>
              <Button
                className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                  featuredCategory === "seating"
                    ? "bg-green-600 text-white border-2 border-green-600"
                    : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
                }`}
                onClick={() => setFeaturedCategory("seating")}
              >
                SEATING
              </Button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredProducts[featuredCategory].map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-2xl transition-all border-4 border-slate-600 bg-zinc-100"
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
                  <div
                    className={`absolute top-4 right-4 text-white px-3 py-1 font-black text-sm z-10 ${
                      featuredCategory === "new"
                        ? "bg-red-600"
                        : featuredCategory === "battleTested"
                          ? "bg-blue-600"
                          : "bg-green-600"
                    }`}
                  >
                    {featuredCategory === "new" ? "NEW" : featuredCategory === "battleTested" ? "PROVEN" : "COMFORT"}
                  </div>
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
                              featuredCategory === "new"
                                ? "bg-red-600"
                                : featuredCategory === "battleTested"
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
                        featuredCategory === "new"
                          ? "text-red-600"
                          : featuredCategory === "battleTested"
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

      {/* About Us Section */}
      <section id="about" className="py-20 bg-zinc-100">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-black text-center text-slate-900 mb-16 tracking-tight">
            AMERICAN <span className="text-red-600">GRIT</span>
          </h2>

          <div className="max-w-5xl mx-auto">
            {/* Kyle Fox Story */}
            <div className="bg-slate-800 text-white border-8 border-slate-700 p-10 mb-16">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative w-56 h-56 border-8 border-red-600 flex-shrink-0">
                  <Image src="/images/kyle-fox-profile.webp" alt="Kyle Fox - Founder" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-6 tracking-wide">KYLE FOX - FOUNDER</h3>
                  <blockquote className="text-xl text-zinc-300 italic mb-6 font-bold">
                    "You need a desk? I actually know a great guy, He deserves your business" That's our marketing.
                  </blockquote>
                  <p className="text-zinc-300 leading-relaxed text-lg font-semibold">
                    Started with nothing but a van, a dream, and American determination. Built this company from the
                    ground up with sweat, steel, and satisfaction guaranteed. We don't just sell furniture - we build
                    the foundation of American business, one workspace at a time.
                  </p>
                </div>
              </div>
            </div>

            {/* Visit Our Showroom CTA */}
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
                      <div>
                        <p className="text-xl font-bold">420 W Commerce Dr Building LL</p>
                        <p className="text-xl font-bold">Pleasant Grove, UT 84062</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <Phone className="w-6 h-6 text-white" />
                      <span className="text-xl font-bold">(801) 899-9406</span>
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
          <h2 className="text-5xl font-black text-center mb-16 tracking-tight">
            GET IN <span className="text-red-500">TOUCH</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            <div>
              <h3 className="text-3xl font-black mb-8 tracking-wide">CONTACT INFO</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-600 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">(801) 899-9406</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">Foxbuilt@gmail.com</span>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-600 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">420 W Commerce Dr Building LL</p>
                    <p className="text-xl font-bold">Pleasant Grove, UT 84062</p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h4 className="text-2xl font-black mb-6 tracking-wide">HOURS OF OPERATION</h4>
                <div className="space-y-3 text-zinc-300">
                  <p className="text-lg font-bold">Monday–Friday: 10:00am–5:00pm</p>
                  <p className="text-lg font-bold">Saturday–Sunday: By Appointment</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-black mb-8 tracking-wide">REQUEST QUOTE</h3>
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
                  {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 border-t-4 border-red-600 text-zinc-400 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="font-bold">&copy; 2025, FOXBUILT. ESTABLISHED 1999. BUILT IN AMERICA.</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">420 W Commerce Dr Building LL, Pleasant Grove, UT 84062</p>
              <p className="text-sm font-bold">+1-(801)-899-9406</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
