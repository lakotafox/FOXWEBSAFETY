"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Phone, Mail, MapPin, FileText, Save, Edit2, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getProducts, saveProducts, defaultProducts } from "@/lib/products-data"

export default function AdminEditor() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredCategory, setFeaturedCategory] = useState("new")
  const [showAddress, setShowAddress] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState(getProducts())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saveMessage, setSaveMessage] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [showGalleryEditor, setShowGalleryEditor] = useState(false)
  const [showPasswordScreen, setShowPasswordScreen] = useState(false)

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
  
  // Load saved gallery images on mount
  useEffect(() => {
    const savedGallery = localStorage.getItem('foxbuilt-gallery')
    if (savedGallery) {
      try {
        setGalleryImages(JSON.parse(savedGallery))
      } catch (e) {
        console.error('Error loading gallery images:', e)
      }
    }
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

  // Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "foxbuilt2025") {
      setIsAuthenticated(true)
    } else {
      alert("Incorrect password")
    }
  }

  // Update product
  const updateProduct = (category: string, productId: number, field: string, value: any) => {
    const newProducts = { ...featuredProducts }
    const productIndex = newProducts[category].findIndex(p => p.id === productId)
    if (productIndex !== -1) {
      newProducts[category][productIndex][field] = value
      setFeaturedProducts(newProducts)
    }
  }

  // Handle image upload
  const handleImageUpload = (category: string, productId: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      updateProduct(category, productId, 'image', e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle gallery image upload
  const handleGalleryImageUpload = (index: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newImages = [...galleryImages]
      newImages[index] = e.target?.result as string
      setGalleryImages(newImages)
    }
    reader.readAsDataURL(file)
  }

  // Save all changes
  const saveAllChanges = () => {
    saveProducts(featuredProducts)
    // Save gallery images
    if (typeof window !== 'undefined') {
      localStorage.setItem('foxbuilt-gallery', JSON.stringify(galleryImages))
    }
    setSaveMessage("✅ Changes saved successfully! The website has been updated.")
    
    // Trigger storage event for main page
    window.dispatchEvent(new Event('storage'))
    
    setTimeout(() => {
      setSaveMessage("")
    }, 3000)
  }

  // Revert to V1.0
  const revertToV1 = () => {
    if (confirm("Are you sure you want to revert to V1.0? This will reset all products and gallery images to their original state.")) {
      setFeaturedProducts(defaultProducts)
      saveProducts(defaultProducts)
      setGalleryImages(defaultGalleryImages)
      localStorage.setItem('foxbuilt-gallery', JSON.stringify(defaultGalleryImages))
      setSaveMessage("🔄 Reverted to V1.0! All products and gallery reset to original.")
      
      // Trigger storage event for main page
      window.dispatchEvent(new Event('storage'))
      
      setTimeout(() => {
        setSaveMessage("")
      }, 3000)
    }
  }

  // Login screen
  if (!isAuthenticated) {
    if (!showPasswordScreen) {
      // Initial prompt screen
      return (
        <div 
          className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden cursor-pointer"
          onClick={() => setShowPasswordScreen(true)}
          onKeyDown={() => setShowPasswordScreen(true)}
          tabIndex={0}
        >
          {/* Animated floating elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 text-6xl animate-bounce">🎃</div>
            <div className="absolute top-20 right-20 text-5xl animate-pulse">🇺🇸</div>
            <div className="absolute bottom-20 left-20 text-6xl animate-bounce" style={{ animationDelay: '1s' }}>🎃</div>
            <div className="absolute bottom-10 right-10 text-5xl animate-pulse" style={{ animationDelay: '0.5s' }}>🇺🇸</div>
            <div className="absolute top-1/2 left-10 text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>🔨</div>
            <div className="absolute top-1/2 right-10 text-4xl animate-pulse" style={{ animationDelay: '2s' }}>🛠️</div>
            
            {/* Floating text message */}
            <div className="absolute top-3/4 right-1/4 text-white/80 font-bold text-lg animate-pulse" style={{ animationDelay: '1s' }}>
              🇺🇸 May your business prosper 🇺🇸
            </div>
          </div>
          
          {/* Main prompt */}
          <div className="text-center z-10">
            <h1 className="text-3xl md:text-4xl font-black text-white animate-pulse">
              FIRE THE EDITOR, BOSS?
            </h1>
          </div>
        </div>
      )
    }

    // Password screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl animate-bounce">🎃</div>
          <div className="absolute top-20 right-20 text-5xl animate-pulse">🇺🇸</div>
          <div className="absolute bottom-20 left-20 text-6xl animate-bounce" style={{ animationDelay: '1s' }}>🎃</div>
          <div className="absolute bottom-10 right-10 text-5xl animate-pulse" style={{ animationDelay: '0.5s' }}>🇺🇸</div>
          <div className="absolute top-1/2 left-10 text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>🔨</div>
          <div className="absolute top-1/2 right-10 text-4xl animate-pulse" style={{ animationDelay: '2s' }}>🛠️</div>
        </div>
        
        <Card className="max-w-2xl w-full bg-white/95 backdrop-blur shadow-2xl border-4 border-red-600">
          <CardContent className="p-12">
            {/* ASCII Art */}
            <pre className="text-red-600 font-mono text-xs md:text-sm text-center mb-8 font-bold">
{`                                                     •
███████╗  ██████╗  ██╗  ██╗ ██████╗  ██╗   ██╗ ██╗ ██╗    ████████╗
██╔════╝ ██╔═══██╗ ╚██╗██╔╝ ██╔══██╗ ██║   ██║ ██║ ██║    ╚══██╔══╝
█████╗   ██║   ██║  ╚███╔╝  ██████╔╝ ██║   ██║ ██║ ██║       ██║   
██╔══╝   ██║   ██║  ██╔██╗  ██╔══██╗ ██║   ██║ ██║ ██║       ██║   
██║      ╚██████╔╝ ██╔╝ ██╗ ██████╔╝ ╚██████╔╝ ██║ ███████╗  ██║   
╚═╝       ╚═════╝  ╚═╝  ╚═╝ ╚═════╝   ╚═════╝  ╚═╝ ╚══════╝  ╚═╝`}
            </pre>
            
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black text-slate-900 mb-4">
                Hey Dad! 👋
              </h1>
              <p className="text-xl text-slate-700 font-bold mb-2">
                Nice to see ya! 🎃
              </p>
              <p className="text-lg text-slate-600">
                Ready to update the website?
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <input
                type="password"
                placeholder="Enter the secret password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border-2 border-slate-300 rounded-lg mb-6 text-lg font-semibold focus:border-red-500 focus:outline-none"
                autoFocus
              />
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-lg py-4 tracking-wider"
              >
                LET'S GO! 🚀
              </Button>
            </form>

            <div className="text-center mt-6 text-sm text-slate-500">
              <p>Remember: With great power comes great furniture updates!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Admin Controls Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-green-600 text-white p-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            <span className="font-bold">ADMIN EDIT MODE</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditMode(!isEditMode)}
              variant="outline"
              size="sm"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              {isEditMode ? "Preview Mode" : "Edit Mode"}
            </Button>
            <Button
              onClick={revertToV1}
              variant="outline"
              size="sm"
              className="bg-white text-red-600 hover:bg-gray-100"
            >
              Revert to V1.0
            </Button>
            <Button
              onClick={saveAllChanges}
              size="sm"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              <Save className="w-4 h-4 mr-1" />
              Save All Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Save message */}
      {saveMessage && (
        <div className="fixed top-12 left-0 right-0 z-[59] bg-green-500 text-white p-4 text-center font-bold">
          {saveMessage}
        </div>
      )}

      {/* Main site content with edit capability */}
      <div className={saveMessage ? "pt-24" : "pt-12"}>
        {/* Header - Same as main site */}
        <header
          className={`fixed top-12 left-0 right-0 z-50 bg-slate-900 border-b-4 border-red-600 shadow-xl transition-all duration-500 ${
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
                onClick={() => window.open('/catolog no page one.pdf', '_blank')}
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

        {/* Hero Section - Same as main site */}
        <section className="pt-40 bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 py-24 text-white relative overflow-hidden">
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

        {/* Gallery - Same as main site */}
        <section id="gallery" className="py-20 bg-zinc-100">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-black text-center text-slate-900 mb-16 tracking-tight">
              AMERICAN <span className="text-red-600">CRAFTSMANSHIP</span>
            </h2>
            <div className="relative max-w-6xl mx-auto">
              {isEditMode && (
                <div className="text-center mb-4">
                  <Button
                    onClick={() => setShowGalleryEditor(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Gallery Images
                  </Button>
                </div>
              )}
              <div className="relative h-96 md:h-[600px] overflow-hidden border-8 border-slate-700">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image src={image || "/placeholder.svg"} alt={`Project ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>

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

        {/* Featured Products Section - EDITABLE */}
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
                  className={`overflow-hidden hover:shadow-2xl transition-all border-4 border-slate-600 bg-zinc-100 ${
                    isEditMode ? "ring-2 ring-green-500" : ""
                  }`}
                >
                  <div className="relative h-56 group">
                    <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
                    {isEditMode && (
                      <label className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                        <div className="text-white text-center">
                          <Edit2 className="w-8 h-8 mx-auto mb-2" />
                          <span>Click to change image</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(featuredCategory, product.id, file)
                          }}
                        />
                      </label>
                    )}
                    <div
                      className={`absolute top-4 right-4 text-white px-3 py-1 font-black text-sm ${
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
                    {/* Title */}
                    {isEditMode && editingId === product.id ? (
                      <input
                        type="text"
                        value={product.title}
                        onChange={(e) => updateProduct(featuredCategory, product.id, 'title', e.target.value)}
                        className="text-xl font-black mb-3 tracking-wide w-full p-1 border rounded"
                        onBlur={() => setEditingId(null)}
                        autoFocus
                      />
                    ) : (
                      <h3 
                        className={`text-xl font-black mb-3 tracking-wide ${
                          isEditMode ? "cursor-pointer hover:bg-yellow-100 p-1 rounded" : ""
                        }`}
                        onClick={() => isEditMode && setEditingId(product.id)}
                      >
                        {product.title}
                      </h3>
                    )}

                    {/* Description */}
                    {isEditMode ? (
                      <textarea
                        value={product.description}
                        onChange={(e) => updateProduct(featuredCategory, product.id, 'description', e.target.value)}
                        className="text-slate-600 mb-4 font-semibold w-full p-1 border rounded resize-none"
                        rows={2}
                      />
                    ) : (
                      <p className="text-slate-600 mb-4 font-semibold">{product.description}</p>
                    )}

                    {/* Features */}
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
                            {isEditMode ? (
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => {
                                  const newFeatures = [...product.features]
                                  newFeatures[index] = e.target.value
                                  updateProduct(featuredCategory, product.id, 'features', newFeatures)
                                }}
                                className="flex-1 p-1 border rounded text-sm"
                              />
                            ) : (
                              feature
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Price */}
                    <div className="flex justify-between items-center">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) => updateProduct(featuredCategory, product.id, 'price', e.target.value)}
                          className={`text-2xl font-black p-1 border rounded ${
                            featuredCategory === "new"
                              ? "text-red-600"
                              : featuredCategory === "battleTested"
                                ? "text-blue-600"
                                : "text-green-600"
                          }`}
                          placeholder="e.g., $1,299"
                        />
                      ) : (
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
                      )}
                      <Button variant="outline" className="border-2 border-slate-700 font-bold">
                        SPECS
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Rest of the site content - About, Contact, Footer */}
        {/* These sections remain the same as the main site */}
      </div>

      {/* Gallery Editor Modal */}
      {showGalleryEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Gallery Images</h2>
              <Button
                onClick={() => setShowGalleryEditor(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((image, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium">
                    Image {index + 1}
                  </label>
                  <div className="relative aspect-video bg-gray-100 rounded border-2 border-dashed border-gray-300 overflow-hidden group">
                    {image && (
                      <Image 
                        src={image} 
                        alt={`Gallery ${index + 1}`} 
                        fill 
                        className="object-cover" 
                      />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                      <div className="text-white opacity-0 group-hover:opacity-100 text-center">
                        <Edit2 className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-sm">Click to change</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleGalleryImageUpload(index, file)
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <Button
                onClick={() => setShowGalleryEditor(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowGalleryEditor(false)
                  saveAllChanges()
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Save Gallery Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}