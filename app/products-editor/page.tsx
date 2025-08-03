'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Save, X, Check, Maximize2, Edit2 } from 'lucide-react'

// Default products for the products page (separate from featured products)
const defaultProductsPageItems = [
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
  },
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
  },
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

// Helper functions to get/save products page items
function getProductsPageItems() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('foxbuilt-products-page')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Organize into categories
        return {
          new: parsed.new || defaultProductsPageItems.slice(0, 9),
          battleTested: parsed.battleTested || defaultProductsPageItems.slice(9, 18),
          seating: parsed.seating || defaultProductsPageItems.slice(18, 27)
        }
      } catch (e) {
        console.error('Error parsing saved products page items:', e)
      }
    }
  }
  // Return organized default products
  return {
    new: defaultProductsPageItems.slice(0, 9),
    battleTested: defaultProductsPageItems.slice(9, 18),
    seating: defaultProductsPageItems.slice(18, 27)
  }
}

function saveProductsPageItems(products: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('foxbuilt-products-page', JSON.stringify(products))
  }
}

export default function ProductsEditorPage() {
  // Check if already authenticated from carrie page
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      const authenticated = sessionStorage.getItem('foxbuilt-authenticated')
      if (authenticated === 'true') {
        // Clear the flag so it's not reused
        sessionStorage.removeItem('foxbuilt-authenticated')
        // Show welcome message when coming from carrie page
        setTimeout(() => setShowWelcomeMessage(true), 500)
        return true
      }
    }
    return false
  })
  const [password, setPassword] = useState("")
  const [productCategory, setProductCategory] = useState('new')
  const [products, setProducts] = useState(getProductsPageItems())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saveMessage, setSaveMessage] = useState("")
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showPublishLoadingOverlay, setShowPublishLoadingOverlay] = useState(false)
  const [publishMessage, setPublishMessage] = useState("")
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Temporary preview storage for blob URLs
  const [tempPreviews, setTempPreviews] = useState<{[key: string]: string}>({})
  
  // Simple crop state
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [editingCrop, setEditingCrop] = useState<string | null>(null)

  // Construction messages for publish loading
  const constructionMessages = [
    "Counting kickplates...",
    "This truck is diesel right?",
    "Leveling...",
    "Measuring...",
    "Straightening spines...",
    "Leveling again...",
    "Adding cantilevers...",
    "Smacking topcaps...",
    "Switching bits...",
    "Cleaning tiles...",
    "Loading the truck...",
    "Unloading the truck...",
    "Checking measurements twice...",
    "Torquing bolts...",
    "Aligning panels...",
    "Setting locks...",
    "Testing drawers...",
    "Oiling hinges...",
    "Buffing surfaces...",
    "Final inspection..."
  ]

  // Check password
  const checkPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "foxbuilt2025") {
      setIsAuthenticated(true)
    } else if (password === "goof") {
      window.location.href = '/games'
    } else {
      // Wrong password - clear it
      setPassword("")
    }
  }

  useEffect(() => {
    // Load saved products and crop settings on mount
    const savedProducts = getProductsPageItems()
    setProducts(savedProducts)
    
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
    
    // Check if we have a temp preview for this path
    if (tempPreviews[imagePath]) {
      return tempPreviews[imagePath]
    }
    
    // For any /images/ path, always use GitHub raw URL
    if (imagePath.startsWith('/images/')) {
      return `https://raw.githubusercontent.com/lakotafox/FOXSITE/main/public${imagePath}`
    }
    
    // Default
    return imagePath
  }

  // Get current products based on selected category
  const currentProducts = products[productCategory as keyof typeof products] || []

  // Update a specific product field
  const updateProduct = (productId: number, field: string, value: any) => {
    setProducts(prev => {
      const newProducts = { ...prev }
      const categoryProducts = [...newProducts[productCategory as keyof typeof newProducts]]
      const productIndex = categoryProducts.findIndex(p => p.id === productId)
      
      if (productIndex !== -1) {
        categoryProducts[productIndex] = {
          ...categoryProducts[productIndex],
          [field]: value
        }
        newProducts[productCategory as keyof typeof newProducts] = categoryProducts
      }
      
      saveProductsPageItems(newProducts)
      return newProducts
    })
  }

  // Handle image upload
  const handleImageUpload = async (file: File, productId: number) => {
    try {
      // Create a temporary preview URL
      const previewUrl = URL.createObjectURL(file)
      const timestamp = Date.now()
      const fileName = `products-page-${productId}-${timestamp}.jpg`
      const githubPath = `/images/${fileName}`
      
      // Store the preview URL temporarily
      setTempPreviews(prev => ({
        ...prev,
        [githubPath]: previewUrl
      }))
      
      // Update the product with the new image path
      updateProduct(productId, 'image', githubPath)
      
      // Store the file for later upload when publishing
      const pendingUploads = JSON.parse(localStorage.getItem('foxbuilt-products-page-pending-uploads') || '{}')
      pendingUploads[githubPath] = file
      localStorage.setItem('foxbuilt-products-page-pending-uploads', JSON.stringify(pendingUploads))
      
      showSaveMessage("Image ready to publish! Click 'Publish' to save permanently.")
    } catch (error) {
      console.error('Error handling image:', error)
      showSaveMessage("Error preparing image")
    }
  }

  // Crop handling functions
  const handleCropChange = (imagePath: string, axis: 'scale' | 'x' | 'y', delta: number) => {
    setCropSettings(prev => {
      const current = prev[imagePath] || { scale: 1, x: 50, y: 50 }
      const newSettings = { ...prev }
      
      if (axis === 'scale') {
        newSettings[imagePath] = { 
          ...current, 
          scale: Math.max(0.1, Math.min(5, current.scale + delta)) 
        }
      } else {
        newSettings[imagePath] = { 
          ...current, 
          [axis]: Math.max(0, Math.min(100, current[axis] + delta)) 
        }
      }
      
      // Save to localStorage
      localStorage.setItem('foxbuilt-products-page-crops', JSON.stringify(newSettings))
      return newSettings
    })
  }

  const handleScroll = (e: React.WheelEvent, imagePath: string) => {
    if (editingCrop === imagePath) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      handleCropChange(imagePath, 'scale', delta)
    }
  }

  // Global keyboard event handler for arrow keys
  useEffect(() => {
    if (!editingCrop) return
    
    // Prevent body scroll when editing
    document.body.style.overflow = 'hidden'
    
    // Track currently pressed keys
    const pressedKeys = new Set<string>()
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editingCrop) return
      
      // Add key to pressed set
      pressedKeys.add(e.key)
      
      // Count how many arrow keys are pressed
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      const pressedArrows = arrowKeys.filter(key => pressedKeys.has(key))
      
      // Only process movement if exactly one arrow key is pressed
      if (pressedArrows.length !== 1) return
      
      const moveAmount = 2 // percentage to move per key press
      const currentCrop = cropSettings[editingCrop] || { scale: 1, x: 50, y: 50 }
      
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setCropSettings(prev => ({
            ...prev,
            [editingCrop]: { ...currentCrop, y: Math.max(0, currentCrop.y - moveAmount) }
          }))
          break
        case 'ArrowDown':
          e.preventDefault()
          setCropSettings(prev => ({
            ...prev,
            [editingCrop]: { ...currentCrop, y: Math.min(100, currentCrop.y + moveAmount) }
          }))
          break
        case 'ArrowLeft':
          e.preventDefault()
          setCropSettings(prev => ({
            ...prev,
            [editingCrop]: { ...currentCrop, x: Math.max(0, currentCrop.x - moveAmount) }
          }))
          break
        case 'ArrowRight':
          e.preventDefault()
          setCropSettings(prev => ({
            ...prev,
            [editingCrop]: { ...currentCrop, x: Math.min(100, currentCrop.x + moveAmount) }
          }))
          break
        case 'Escape':
          setEditingCrop(null)
          break
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Remove key from pressed set
      pressedKeys.delete(e.key)
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    
    return () => {
      // Restore body scroll
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [editingCrop, cropSettings])

  // Show save message
  const showSaveMessage = (message: string, duration: number = 3000) => {
    setSaveMessage(message)
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    messageTimeoutRef.current = setTimeout(() => {
      setSaveMessage("")
    }, duration)
  }

  // Handle publish
  const handlePublish = async () => {
    try {
      showSaveMessage("🚀 Publishing to live site...", 30000)
      
      // GitHub API configuration
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
      const OWNER = 'lakotafox'
      const REPO = 'FOXSITE'
      const PATH = 'public/products-page.json'
      
      // First, get the current file to get its SHA (if it exists)
      let sha = ''
      try {
        const currentFileResponse = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
          {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        )
        
        if (currentFileResponse.ok) {
          const currentFile = await currentFileResponse.json()
          sha = currentFile.sha
        }
      } catch (e) {
        // File might not exist yet, that's ok
      }
      
      // Prepare the content with crop settings
      const convertedProducts = JSON.parse(JSON.stringify(products))
      Object.keys(convertedProducts).forEach(category => {
        convertedProducts[category].forEach((product: any) => {
          if (cropSettings[product.image]) {
            product.imageCrop = cropSettings[product.image]
          }
        })
      })
      
      const content = {
        products: convertedProducts,
        productsCrops: cropSettings,
        lastUpdated: new Date().toISOString(),
        updatedBy: "Kyle"
      }
      
      // Encode content to base64
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))))
      
      // Update/create the file on GitHub
      const updateResponse = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Update products page via admin panel - ${new Date().toLocaleString()}`,
            content: contentBase64,
            sha: sha,
            branch: 'main'
          })
        }
      )
      
      if (updateResponse.ok) {
        // Also save to localStorage as backup
        saveProductsPageItems(convertedProducts)
        localStorage.setItem('foxbuilt-products-page-crops', JSON.stringify(cropSettings))
        
        showSaveMessage("✅ Published successfully!")
        
        // Show publish loading overlay for 1 minute
        setTimeout(() => {
          setSaveMessage("")
          setShowPublishLoadingOverlay(true)
          
          // Start rotating messages
          let messageIndex = 0
          setPublishMessage(constructionMessages[0])
          
          const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % constructionMessages.length
            setPublishMessage(constructionMessages[messageIndex])
          }, 4000) // Change message every 4 seconds
          
          // Hide overlay after 60 seconds
          setTimeout(() => {
            clearInterval(messageInterval)
            setShowPublishLoadingOverlay(false)
            setPublishMessage("")
          }, 60000) // 1 minute
        }, 2000)
        
        // Clear pending uploads
        localStorage.removeItem('foxbuilt-products-page-pending-uploads')
        setTempPreviews({})
      } else {
        const error = await updateResponse.json()
        console.error('GitHub update error:', error)
        if (updateResponse.status === 401) {
          showSaveMessage("❌ GitHub token expired - Tell Khabe: 'GitHub 401 error'", 5000)
          alert("ERROR: GitHub token expired (401)\n\nTell Khabe: 'GitHub 401 error - need new token'\n\nHe'll fix it free!")
        } else {
          showSaveMessage("❌ Failed to publish. Try again or contact support.")
        }
      }
    } catch (error) {
      console.error('Error publishing:', error)
      showSaveMessage("❌ Error publishing changes")
    }
  }

  // If not authenticated, show password screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border-8 border-red-600 p-12 max-w-md w-full">
          <h1 className="text-4xl font-black text-white mb-8 text-center tracking-tight">
            FOXBUILT
            <br />
            <span className="text-red-500">PRODUCTS EDITOR</span>
          </h1>
          <form onSubmit={checkPassword} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER PASSWORD"
                className="w-full px-6 py-4 bg-slate-700 border-4 border-slate-600 text-white placeholder-zinc-400 font-bold text-xl focus:outline-none focus:border-red-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xl py-4 tracking-widest border-4 border-red-600 hover:border-red-700 transition-all"
            >
              ENTER
            </button>
          </form>
          <p className="text-zinc-400 text-center mt-8 font-bold">
            AUTHORIZED ACCESS ONLY
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-800 relative">
      {/* Publish Loading Overlay */}
      {showPublishLoadingOverlay && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center pointer-events-auto" style={{ pointerEvents: 'all' }}>
          {/* Fox loading video */}
          <video 
            className="w-64 h-64 mb-8"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/foxloading.webm" type="video/webm" />
          </video>
          
          {/* Construction message */}
          <div className="text-white text-xl font-bold animate-pulse mb-8">
            {publishMessage}
          </div>
          
          {/* Game prompt */}
          <div className="text-white text-lg">
            Want to play a game while you wait?
            <button
              onClick={() => window.open('/games', '_blank')}
              className="ml-3 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded transition-all"
            >
              YES
            </button>
          </div>
        </div>
      )}
      
      {/* Admin header bar - matches carrie page */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black p-2 border-b-4 border-yellow-600">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            <span className="font-bold text-sm sm:text-base">PRODUCTS EDITOR</span>
          </div>
          <Button
            onClick={handlePublish}
            size="lg"
            className="bg-green-600 text-white hover:bg-green-700 font-bold px-8 py-3 text-lg"
          >
            🚀 Publish Changes
          </Button>
        </div>
      </div>
      
      {/* Save message */}
      {saveMessage && (
        <div className="fixed top-0 left-0 right-0 z-[59] bg-green-500 text-white p-4 text-center font-bold">
          {saveMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 py-8 pt-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black text-center text-white tracking-tight">
            PRODUCTS <span className="text-red-600">EDITOR</span>
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
                <div className="relative h-64 group overflow-hidden bg-gray-100">
                  {(() => {
                    const crop = cropSettings[product.image] || { scale: 1, x: 50, y: 50 }
                    return (
                      <div 
                        className="absolute inset-0"
                        style={{
                          transform: `translate(${crop.x - 50}%, ${crop.y - 50}%) scale(${crop.scale})`
                        }}
                        onWheel={(e) => handleScroll(e, product.image)}
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
                  
                  {/* Edit Controls */}
                  {
                    <>
                      {/* Image Upload - appears on hover at bottom like carrie page */}
                      <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <label className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded cursor-pointer flex items-center gap-2 font-bold shadow-lg">
                          <Edit2 className="w-4 h-4" />
                          Change Image
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(file, product.id)
                            }}
                          />
                        </label>
                      </div>

                      {/* Crop Controls */}
                      <div className="absolute top-2 right-2 z-10">
                        <button
                          onClick={() => setEditingCrop(editingCrop === product.image ? null : product.image)}
                          className="hover:scale-110 transition-transform"
                        >
                          {editingCrop === product.image ? (
                            <Image src="/unlocked.jpeg" alt="Save" width={48} height={48} />
                          ) : (
                            <Image src="/locked.jpeg" alt="Resize" width={48} height={48} />
                          )}
                        </button>
                      </div>

                      {editingCrop === product.image && (
                        <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs p-2 rounded">
                          Use arrow keys to move, scroll to zoom
                        </div>
                      )}
                    </>
                  }
                </div>
                
                <CardContent className="p-6">
                  {/* Title */}
                  {editingId === product.id ? (
                    <input
                      type="text"
                      value={product.title}
                      onChange={(e) => updateProduct(product.id, 'title', e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyPress={(e) => e.key === 'Enter' && setEditingId(null)}
                      className="text-xl font-black mb-3 tracking-wide w-full p-2 border-2 border-red-600"
                      autoFocus
                    />
                  ) : (
                    <h3 
                      className="text-xl font-black mb-3 tracking-wide cursor-pointer hover:text-red-600"
                      onClick={() => setEditingId(product.id)}
                    >
                      {product.title}
                    </h3>
                  )}
                  
                  {/* Description */}
                  {editingId === -product.id ? (
                    <textarea
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                      onBlur={() => setEditingId(null)}
                      className="text-slate-600 mb-4 font-semibold w-full p-2 border-2 border-red-600"
                      rows={2}
                    />
                  ) : (
                    <p 
                      className="text-slate-600 mb-4 font-semibold cursor-pointer hover:text-red-600"
                      onClick={() => setEditingId(-product.id)}
                    >
                      {product.description}
                    </p>
                  )}
                  
                  {/* Features */}
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
                          {editingId === product.id * 1000 + index ? (
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [...product.features]
                                newFeatures[index] = e.target.value
                                updateProduct(product.id, 'features', newFeatures)
                              }}
                              onBlur={() => setEditingId(null)}
                              onKeyPress={(e) => e.key === 'Enter' && setEditingId(null)}
                              className="flex-1 p-1 border-b-2 border-red-600"
                              autoFocus
                            />
                          ) : (
                            <span 
                              className="cursor-pointer hover:text-red-600"
                              onClick={() => setEditingId(product.id * 1000 + index)}
                            >
                              {feature}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {/* Price */}
                  <div className="flex justify-between items-center">
                    {editingId === product.id * 10000 ? (
                      <input
                        type="text"
                        value={product.price}
                        onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                        onBlur={() => setEditingId(null)}
                        onKeyPress={(e) => e.key === 'Enter' && setEditingId(null)}
                        className={`text-2xl font-black p-2 border-2 ${
                          productCategory === "new"
                            ? "border-red-600 text-red-600"
                            : productCategory === "battleTested"
                              ? "border-blue-600 text-blue-600"
                              : "border-green-600 text-green-600"
                        }`}
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`text-2xl font-black ${
                          productCategory === "new"
                            ? "text-red-600"
                            : productCategory === "battleTested"
                              ? "text-blue-600"
                              : "text-green-600"
                        } cursor-pointer hover:underline`}
                        onClick={() => setEditingId(product.id * 10000)}
                      >
                        {product.price}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Welcome Message Modal */}
      {showWelcomeMessage && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardContent className="p-8">
              <h2 className="text-3xl font-black mb-6 text-center">HEY DAD!</h2>
              <div className="space-y-4 text-lg">
                <p>
                  Please test this "product editing page". You can see the live page at{' '}
                  <a 
                    href="https://foxbuiltstore.com/products" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-bold"
                  >
                    https://foxbuiltstore.com/products
                  </a>
                </p>
                <p>
                  For now that page should be secret.. but this editor should update the page https://foxbuiltstore.com/products
                </p>
                <p>
                  Test it out lmk... and when its all ready to go we can add a button on the main page that goes to the finished product page.
                </p>
              </div>
              <div className="mt-8 text-center">
                <Button
                  onClick={() => setShowWelcomeMessage(false)}
                  className="bg-green-600 hover:bg-green-700 text-white font-black px-8 py-3"
                >
                  GOT IT!
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed top-8 left-8 w-16 h-16 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center"
        style={{ position: 'fixed' }}
      >
        <Image
          src="/questionmark.png"
          alt="Help"
          width={64}
          height={64}
          className="drop-shadow-lg hover:drop-shadow-xl transition-all"
        />
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-slate-900">HEY POPS 👋</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
                <h3 className="font-bold text-xl mb-3 text-blue-900 text-center">Here is a quick guide</h3>
                <p className="text-blue-800 text-lg text-center">
                  :Hover mouse over image to see edit options.
                </p>
                <p className="text-blue-800 text-lg mt-2 text-center">
                  :Use lock 🔒 to resize and position images.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-2xl mb-4 text-slate-900 text-center">EDIT Image Controls</h3>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg text-center">
                    :when lock is <span className="text-green-600 font-bold">GREEN</span> 🟢 use ⬆️⬇️⬅️➡️ to move the image
                  </p>
                  <p className="text-lg text-center">
                    :when lock is <span className="text-green-600 font-bold">GREEN</span> 🟢 use Scroll Wheel to Zoom in/out
                  </p>
                  <p className="text-lg text-center">
                    :when you are done resizing your image lock it! (Click lock <span className="text-red-600 font-bold">RED</span> 🔴)
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-2xl mb-4 text-slate-900 text-center">💾 Publishing Changes</h3>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg text-center">
                    <span className="text-2xl">1️⃣:</span> Make all your changes to products and images
                  </p>
                  <p className="text-lg text-center">
                    <span className="text-2xl">2️⃣:</span> Click the <strong>"Publish"</strong> button at the top
                  </p>
                  <p className="text-lg text-center">
                    <span className="text-2xl">3️⃣:</span> Wait <strong>60 seconds</strong> for changes to build and go live
                  </p>
                  <p className="text-lg text-center">
                    <span className="text-2xl">4️⃣:</span> Your updates will be available!
                  </p>
                </div>
              </div>

              <div className="text-center pt-6">
                <Button
                  onClick={() => setShowHelp(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-bold"
                >
                  Got it! 👍
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}