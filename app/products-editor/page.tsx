'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { defaultProductsPageItems, CONSTRUCTION_MESSAGES } from '@/components/products-editor/constants/default-products'
import LoadingOverlay from '@/components/products-editor/ui/LoadingOverlay'
import WelcomeMessage from '@/components/products-editor/ui/WelcomeMessage'
import MobilePreviewHelp from '@/components/products-editor/ui/MobilePreviewHelp'
import HelpModal from '@/components/products-editor/ui/HelpModal'
import YellowHeader from '@/components/products-editor/ui/YellowHeader'
import SaveMessage from '@/components/products-editor/ui/SaveMessage'
import CategoryButtons from '@/components/products-editor/ui/CategoryButtons'
import ProductCard from '@/components/products-editor/ui/ProductCard'
import Footer from '@/components/sections/Footer'
import { Phone, MapPin } from 'lucide-react'

// Helper functions to get/save products page items
async function getProductsPageItems() {
  // First try to fetch from the published products.json file
  try {
    const response = await fetch('/products.json', { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      if (data.products) {
        return data.products
      }
    }
  } catch (e) {
    console.log('No published products file, checking localStorage')
  }
  
  // Fallback to localStorage
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
  // Always authenticated - security is handled at main page editor
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  
  // Check if coming from main page editor to show welcome message
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fromCarrie = sessionStorage.getItem('foxbuilt-authenticated')
      if (fromCarrie === 'true') {
        sessionStorage.removeItem('foxbuilt-authenticated')
        setShowWelcomeMessage(true)
      }
    }
  }, [])
  const [productCategory, setProductCategory] = useState('new')
  const [products, setProducts] = useState({
    new: defaultProductsPageItems.slice(0, 9),
    battleTested: defaultProductsPageItems.slice(9, 18),
    seating: defaultProductsPageItems.slice(18, 27)
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saveMessage, setSaveMessage] = useState("")
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showMobilePreviewHelp, setShowMobilePreviewHelp] = useState(false)
  const [showPublishLoadingOverlay, setShowPublishLoadingOverlay] = useState(false)
  const [publishMessage, setPublishMessage] = useState("")
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // For Contact section
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Temporary preview storage for blob URLs
  const [tempPreviews, setTempPreviews] = useState<{[key: string]: string}>({})
  
  // Simple crop state
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  
  // Image upload management
  const [activeUploads, setActiveUploads] = useState(0)
  const [uploadQueue, setUploadQueue] = useState<{productId: number, file: File, fileName: string}[]>([])
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const [editingCrop, setEditingCrop] = useState<string | null>(null)

  // Construction messages for publish loading
  const constructionMessages = CONSTRUCTION_MESSAGES

  useEffect(() => {
    // Load saved products and crop settings on mount
    const loadProducts = async () => {
      const savedProducts = await getProductsPageItems()
      setProducts(savedProducts)
      
      // Also check products.json for crop settings
      try {
        const response = await fetch('/products.json', { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          if (data.productsCrops) {
            setCropSettings(data.productsCrops)
          }
        }
      } catch (e) {
        console.log('Could not load crop settings from products.json')
      }
    }
    
    loadProducts()
    
    // Load crop settings from localStorage as fallback
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
      const timestamp = Date.now()
      const fileName = `product-${productId}-${timestamp}.jpg`
      const githubPath = `/images/${fileName}`
      
      // Update the product with the new image path immediately
      updateProduct(productId, 'image', githubPath)
      
      // Initialize crop settings for the new image
      setCropSettings(prev => ({
        ...prev,
        [githubPath]: { scale: 1, x: 50, y: 50 }
      }))
      
      // Create a temporary preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setTempPreviews(prev => ({
            ...prev,
            [githubPath]: e.target.result as string
          }))
        }
      }
      reader.readAsDataURL(file)
      
      // Add to upload queue
      setUploadQueue(queue => [...queue, { productId, file, fileName }])
    } catch (error) {
      console.error('Error handling image:', error)
      showSaveMessage("Error preparing image")
    }
  }

  // Process image upload to GitHub
  const processImageUpload = async (productId: number, file: File, fileName: string) => {
    setActiveUploads(count => count + 1)
    showSaveMessage("📤 Uploading image...")
    
    const uploadTimeout = setTimeout(() => {
      console.error('Upload timeout after 30 seconds')
      showSaveMessage("❌ Upload timeout - please try again", 5000)
      setActiveUploads(count => count - 1)
    }, 30000)
    
    try {
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
      const OWNER = 'lakotafox'
      const REPO = 'FOXSITE'
      const PATH = `public/images/${fileName}`
      
      // Convert file to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = async () => {
        const base64Data = reader.result as string
        const base64Content = base64Data.split(',')[1]
        
        // Upload to GitHub
        const response = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `Upload product image ${fileName}`,
              content: base64Content,
              branch: 'main'
            })
          }
        )
        
        clearTimeout(uploadTimeout)
        
        if (response.ok) {
          showSaveMessage("✅ Image uploaded!", 3000)
          // Keep the temp preview until deployment - image won't be available from GitHub yet
          // The temp preview will persist until page reload or editor restart
        } else {
          const errorData = await response.json()
          console.error('Upload failed:', errorData)
          showSaveMessage("❌ Upload failed", 5000)
        }
        
        setActiveUploads(count => count - 1)
      }
      
      reader.onerror = () => {
        console.error('FileReader error')
        showSaveMessage("❌ Error reading image", 3000)
        clearTimeout(uploadTimeout)
        setActiveUploads(count => count - 1)
      }
    } catch (error) {
      console.error('Upload error:', error)
      showSaveMessage("❌ Error uploading image", 3000)
      clearTimeout(uploadTimeout)
      setActiveUploads(count => count - 1)
    }
  }
  
  // Process upload queue
  useEffect(() => {
    if (uploadQueue.length > 0 && activeUploads === 0) {
      const [nextUpload, ...remainingQueue] = uploadQueue
      setUploadQueue(remainingQueue)
      processImageUpload(nextUpload.productId, nextUpload.file, nextUpload.fileName)
    }
  }, [uploadQueue, activeUploads])

  // Manage loading overlay with 4-second minimum (same as main page editor)
  useEffect(() => {
    const shouldShowOverlay = activeUploads > 0 || uploadQueue.length > 0
    
    if (shouldShowOverlay && !showLoadingOverlay) {
      // Start showing overlay
      setShowLoadingOverlay(true)
      setLoadingStartTime(Date.now())
    } else if (!shouldShowOverlay && showLoadingOverlay && loadingStartTime) {
      // Check if 4 seconds have passed
      const elapsed = Date.now() - loadingStartTime
      const remaining = 4000 - elapsed
      
      if (remaining > 0) {
        // Wait for remaining time
        setTimeout(() => {
          setShowLoadingOverlay(false)
          setLoadingStartTime(null)
        }, remaining)
      } else {
        // 4 seconds have passed, hide immediately
        setShowLoadingOverlay(false)
        setLoadingStartTime(null)
      }
    }
  }, [activeUploads, uploadQueue.length, showLoadingOverlay, loadingStartTime])

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
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setCropSettings(prev => {
        const current = prev[imagePath] || { scale: 1, x: 50, y: 50 }
        const newScale = Math.max(0.17, Math.min(9, current.scale * delta))
        const newSettings = {
          ...prev,
          [imagePath]: { ...current, scale: newScale }
        }
        // Save to localStorage
        localStorage.setItem('foxbuilt-products-page-crops', JSON.stringify(newSettings))
        return newSettings
      })
    }
  }

  // Global keyboard and wheel event handler for arrow keys and zoom
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
    
    const handleWheel = (e: WheelEvent) => {
      if (!editingCrop) return
      e.preventDefault()
      
      const currentCrop = cropSettings[editingCrop] || { scale: 1, x: 50, y: 50 }
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.17, Math.min(9, currentCrop.scale * delta))
      
      setCropSettings(prev => {
        const newSettings = {
          ...prev,
          [editingCrop]: { ...currentCrop, scale: newScale }
        }
        // Save to localStorage
        localStorage.setItem('foxbuilt-products-page-crops', JSON.stringify(newSettings))
        return newSettings
      })
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      // Restore body scroll
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('wheel', handleWheel)
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

  const handlePublish = async () => {
    try {
      showSaveMessage("🚀 Publishing to live site...", 30000)
      
      // GitHub API configuration
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
      const OWNER = 'lakotafox'
      const REPO = 'FOXSITE'
      const PATH = 'public/products.json' // Separate products.json file
      
      // First, get the current products.json file to get SHA
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
        console.error('Error fetching current products.json:', e)
      }
      
      // Prepare the products with crop settings
      const convertedProducts = JSON.parse(JSON.stringify(products))
      Object.keys(convertedProducts).forEach(category => {
        convertedProducts[category].forEach((product: any) => {
          if (cropSettings[product.image]) {
            product.imageCrop = cropSettings[product.image]
          }
        })
      })
      
      // Create content for products.json
      const content = {
        products: convertedProducts,
        productsCrops: cropSettings,
        lastUpdated: new Date().toISOString(),
        updatedBy: "Kyle"
      }
      
      // Encode content to base64
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))))
      
      // Update the file on GitHub
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
            message: `Update products via products editor - ${new Date().toLocaleString()}`,
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
        
        // Clear any remaining temp previews
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


  return (
    <div className="min-h-screen bg-slate-800 relative">
      {/* Loading Overlays */}
      <LoadingOverlay 
        show={showLoadingOverlay} 
        type="upload" 
      />
      <LoadingOverlay 
        show={showPublishLoadingOverlay} 
        type="publish" 
        publishMessage={publishMessage}
        onPlayGame={() => window.open('/games', '_blank')}
      />
      
      {/* Yellow Header */}
      <YellowHeader 
        onMobilePreview={() => setShowMobilePreviewHelp(true)}
        onPublish={handlePublish}
      />
      
      {/* Save message */}
      <SaveMessage show={!!saveMessage} message={saveMessage} />

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
              <CategoryButtons 
                productCategory={productCategory as 'new' | 'battleTested' | 'seating'}
                onCategoryChange={setProductCategory}
              />
            </div>
          </div>


          {/* Products Grid - Show 9 products (3x3) */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {currentProducts.slice(0, 9).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                productCategory={productCategory}
                editingId={editingId}
                editingCrop={editingCrop}
                cropSettings={cropSettings}
                setEditingId={setEditingId}
                setEditingCrop={setEditingCrop}
                updateProduct={updateProduct}
                handleImageUpload={handleImageUpload}
                getImageUrl={getImageUrl}
              />
            ))}
          </div>
        </div>
      </section>


      {/* Welcome Message Modal */}
      <WelcomeMessage 
        show={showWelcomeMessage}
        onClose={() => setShowWelcomeMessage(false)}
      />

      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed top-8 left-8 w-16 h-16 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center"
        style={{ position: 'fixed' }}
      >
        <Image
          src="/icons/questionmark.png"
          alt="Help"
          width={64}
          height={64}
          className="drop-shadow-lg hover:drop-shadow-xl transition-all"
        />
      </button>

      {/* Help Modal */}
      <HelpModal 
        show={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Mobile Preview Help Modal */}
      <MobilePreviewHelp 
        show={showMobilePreviewHelp}
        onClose={() => setShowMobilePreviewHelp(false)}
      />


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
      <Footer />
    </div>
  )
}