"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Phone, Mail, MapPin, FileText, Save, Edit2, X, Check, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getProducts, saveProducts, defaultProducts } from "@/lib/products-data"

// DVD Bouncing emoji component
const BouncingEmoji = ({ emoji, delay = 0 }: { emoji: string; delay?: number }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [velocity, setVelocity] = useState({ x: 0.3, y: 0.3 })
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize with random values after mount to avoid hydration issues
    setPosition({ x: Math.random() * 80, y: Math.random() * 80 })
    setVelocity({ 
      x: (Math.random() - 0.5) * 0.5, 
      y: (Math.random() - 0.5) * 0.5 
    })
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    const interval = setInterval(() => {
      setPosition(prev => {
        let newX = prev.x + velocity.x
        let newY = prev.y + velocity.y
        let newVelX = velocity.x
        let newVelY = velocity.y

        // Bounce off edges
        if (newX <= 0 || newX >= 90) {
          newVelX = -velocity.x
          newX = newX <= 0 ? 0 : 90
        }
        if (newY <= 0 || newY >= 90) {
          newVelY = -velocity.y
          newY = newY <= 0 ? 0 : 90
        }

        setVelocity({ x: newVelX, y: newVelY })
        return { x: newX, y: newY }
      })
    }, 50)

    return () => clearInterval(interval)
  }, [velocity, isInitialized])

  return (
    <div 
      className="absolute text-6xl transition-all duration-50"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        animationDelay: `${delay}s`
      }}
    >
      {emoji}
    </div>
  )
}

export default function AdminEditor() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredCategory, setFeaturedCategory] = useState("new")
  const [showAddress, setShowAddress] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState(getProducts())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saveMessage, setSaveMessage] = useState("")
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isEditMode, setIsEditMode] = useState(true)
  const [showGalleryEditor, setShowGalleryEditor] = useState(false)
  const [showPasswordScreen, setShowPasswordScreen] = useState(false)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [expandedSpecs, setExpandedSpecs] = useState<number | null>(null)
  
  // Temporary preview storage for blob URLs
  const [tempPreviews, setTempPreviews] = useState<{[key: string]: string}>({})
  const [galleryTempPreviews, setGalleryTempPreviews] = useState<{[key: string]: string}>({})
  
  // Simple crop state
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [editingCrop, setEditingCrop] = useState<string | null>(null)

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
  const [pendingGalleryImages, setPendingGalleryImages] = useState(defaultGalleryImages)
  
  // Upload queue management
  const [uploadQueue, setUploadQueue] = useState<Array<{type: 'product' | 'gallery', file: File, category?: string, productId?: number, index?: number, fileName?: string}>>([])
  const [isUploading, setIsUploading] = useState(false)
  const [activeUploads, setActiveUploads] = useState(0)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const [showPublishLoadingOverlay, setShowPublishLoadingOverlay] = useState(false)
  const [publishMessage, setPublishMessage] = useState("")
  
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
    "Torquing bolts to spec...",
    "Applying finish coat...",
    "Quality control inspection..."
  ]
  
  // Helper function to get displayable image URL
  const getImageUrl = (imagePath: string, isGallery: boolean = false) => {
    if (!imagePath) return "/placeholder.svg"
    
    // Check if we have a temporary preview for this path
    if (isGallery && galleryTempPreviews[imagePath]) {
      return galleryTempPreviews[imagePath]
    }
    if (!isGallery && tempPreviews[imagePath]) {
      return tempPreviews[imagePath]
    }
    
    // For /images/ paths, convert to GitHub raw URL for preview
    if (imagePath.startsWith('/images/')) {
      const fileName = imagePath.replace('/images/', '')
      return `https://raw.githubusercontent.com/lakotafox/FOXSITE/main/public/images/${fileName}`
    }
    
    // Default
    return imagePath
  }

  // Helper function to set save message with auto-clear
  const showMessage = (message: string, duration: number = 3000) => {
    // Clear any existing timeout
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    
    // Set the new message
    setSaveMessage(message)
    
    // Set a new timeout
    messageTimeoutRef.current = setTimeout(() => {
      setSaveMessage("")
      messageTimeoutRef.current = null
    }, duration)
  }

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up all blob URLs when component unmounts
      Object.values(tempPreviews).forEach(url => {
        if (url.startsWith('data:') || url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
      Object.values(galleryTempPreviews).forEach(url => {
        if (url.startsWith('data:') || url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [tempPreviews, galleryTempPreviews])
  
  // Handle arrow keys for image movement and lock scroll when editing
  useEffect(() => {
    if (!editingCrop) return
    
    // Lock body scroll
    document.body.style.overflow = 'hidden'
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editingCrop) return
      
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
    
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      // Restore body scroll
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editingCrop, cropSettings])

  // Check if mobile and load saved data on mount
  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      setIsMobile(isMobileDevice)
    }
    checkMobile()
    
    // Load from localStorage only - no automatic draft loading
    const savedGallery = localStorage.getItem('foxbuilt-gallery')
    if (savedGallery) {
      try {
        const images = JSON.parse(savedGallery)
        setGalleryImages(images)
        setPendingGalleryImages(images)
      } catch (e) {
        console.error('Error loading gallery images:', e)
      }
    }
    
    // Load URL map from localStorage
    
    // Also try to load from published content.json for fresh editor sessions
    fetch('/content.json')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setFeaturedProducts(data.products)
          saveProducts(data.products)
          
          // Load crop settings from products
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
          setPendingGalleryImages(data.gallery)
          localStorage.setItem('foxbuilt-gallery', JSON.stringify(data.gallery))
        }
        
        // Load gallery crops if available
        if (data.galleryCrops) {
          setCropSettings(prev => ({...prev, ...data.galleryCrops}))
        }
      })
      .catch(err => console.log('Could not load content.json:', err))
  }, [])

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  // Process upload queue
  useEffect(() => {
    if (uploadQueue.length > 0 && activeUploads < 1) { // Only 1 upload at a time
      const nextUpload = uploadQueue[0]
      setUploadQueue(queue => queue.slice(1))
      
      if (nextUpload.type === 'product') {
        processProductImageUpload(nextUpload.category!, nextUpload.productId!, nextUpload.file, nextUpload.fileName!)
      } else {
        processGalleryImageUpload(nextUpload.index!, nextUpload.file, nextUpload.fileName!)
      }
    }
  }, [uploadQueue, activeUploads])
  
  // Manage loading overlay with 4-second minimum
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

  // Auto-slide gallery
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [pendingGalleryImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % pendingGalleryImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + pendingGalleryImages.length) % pendingGalleryImages.length)
  }

  // Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "foxbuilt2025") {
      setIsAuthenticated(true)
    } else if (password === "goof") {
      window.location.href = '/games'
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

  // Add image to upload queue
  const handleImageUpload = (category: string, productId: number, file: File) => {
    // Generate the filename immediately
    const timestamp = Date.now()
    const fileName = `product-${productId}-${timestamp}.jpg`
    const githubPath = `/images/${fileName}`
    
    // Update to use GitHub path immediately
    updateProduct(category, productId, 'image', githubPath)
    
    // Reset crop settings for the new image (full image, no crop)
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
    
    // Add to queue with the filename
    setUploadQueue(queue => [...queue, { type: 'product', file, category, productId, fileName }])
  }
  
  // Process product image upload
  const processProductImageUpload = async (category: string, productId: number, file: File, fileName: string) => {
    setActiveUploads(count => count + 1)
    
    // Set a timeout to prevent infinite loading
    const uploadTimeout = setTimeout(() => {
      console.error('Product upload timeout after 30 seconds')
      showMessage("❌ Upload timeout - please try again", 5000)
      setActiveUploads(count => count - 1)
    }, 30000) // 30 second timeout
    
    try {
      // GitHub API configuration
      // GitHub token from environment variable
      // Set this in Netlify: Site settings → Environment variables
      // Name: NEXT_PUBLIC_GITHUB_TOKEN
      // Value: your GitHub token (get from https://github.com/settings/tokens/new)
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
      const OWNER = 'lakotafox'
      const REPO = 'FOXSITE'
      
      // Use the pre-generated filename
      const PATH = `public/images/${fileName}`
      
      // Convert file to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = async () => {
        const base64Data = reader.result as string
        // Remove the data:image/jpeg;base64, prefix
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
              message: `Add product image: ${fileName}`,
              content: base64Content,
              branch: 'main'
            })
          }
        )
        
        if (response.ok) {
          // Upload successful - image will show after build
          clearTimeout(uploadTimeout)
        setActiveUploads(count => count - 1)
        } else {
          const error = await response.json()
          console.error('GitHub upload error:', error)
          if (response.status === 401) {
            showMessage("❌ GitHub token expired - Tell Khabe: 'GitHub 401 error'", 5000)
            alert("ERROR: GitHub token expired (401)\n\nTell Khabe: 'GitHub 401 error - need new token'\n\nHe'll fix it free!")
          } else {
            showMessage(`❌ Error: ${error.message || response.status}`, 5000)
          }
          clearTimeout(uploadTimeout)
        setActiveUploads(count => count - 1)
        }
      }
      
      reader.onerror = () => {
        showMessage("❌ Error reading image file", 3000)
        clearTimeout(uploadTimeout)
        setActiveUploads(count => count - 1)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      showMessage("❌ Error uploading image", 3000)
      setActiveUploads(count => count - 1)
    }
  }

  // Add gallery image to upload queue
  const handleGalleryImageUpload = (index: number, file: File) => {
    // Generate the filename immediately
    const timestamp = Date.now()
    const fileName = `gallery-${index}-${timestamp}.jpg`
    const githubPath = `/images/${fileName}`
    
    // Update to use GitHub path immediately
    const newImages = [...pendingGalleryImages]
    newImages[index] = githubPath
    setPendingGalleryImages(newImages)
    
    // Reset crop settings for the new image (full image, no crop)
    setCropSettings(prev => ({
      ...prev,
      [githubPath]: { scale: 1, x: 50, y: 50 }
    }))
    
    // Create a temporary preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setGalleryTempPreviews(prev => ({
          ...prev,
          [githubPath]: e.target.result as string
        }))
      }
    }
    reader.readAsDataURL(file)
    
    // Add to queue with the filename
    setUploadQueue(queue => [...queue, { type: 'gallery', file, index, fileName }])
  }
  
  // Process gallery image upload
  const processGalleryImageUpload = async (index: number, file: File, fileName: string) => {
    setActiveUploads(count => count + 1)
    
    // Set a timeout to prevent infinite loading
    const uploadTimeout = setTimeout(() => {
      showMessage("❌ Upload timeout - please try again", 5000)
      setActiveUploads(count => count - 1)
    }, 30000) // 30 second timeout
    
    
    try {
      // GitHub token from environment variable
      // Set this in Netlify: Site settings → Environment variables
      // Name: NEXT_PUBLIC_GITHUB_TOKEN
      // Value: your GitHub token (get from https://github.com/settings/tokens/new)
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
      const OWNER = 'lakotafox'
      const REPO = 'FOXSITE'
      
      // Use the pre-generated filename
      const PATH = `public/images/${fileName}`
      
      // Convert file to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = async () => {
        try {
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
              message: `Add gallery image: ${fileName}`,
              content: base64Content,
              branch: 'main'
            })
          }
        )
        
        
        if (!response.ok) {
          const error = await response.json()
          if (response.status === 401) {
            showMessage("❌ GitHub token expired - Tell Khabe: 'GitHub 401 error'", 5000)
            alert("ERROR: GitHub token expired (401)\n\nTell Khabe: 'GitHub 401 error - need new token'\n\nHe'll fix it free!")
          } else if (response.status === 404) {
            showMessage(`❌ GitHub repo not found or no access - check token permissions`, 5000)
          } else {
            showMessage(`❌ Error: ${error.message || response.status}`, 5000)
          }
          clearTimeout(uploadTimeout)
        setActiveUploads(count => count - 1)
          return
        }
        
        // Upload successful - image will show after build
        
        
        clearTimeout(uploadTimeout)
        setActiveUploads(count => count - 1)
        } catch (uploadError) {
          console.error('Error during upload:', uploadError)
          showMessage("❌ Upload error - check console", 5000)
          clearTimeout(uploadTimeout)
          setActiveUploads(count => count - 1)
        }
      }
      
      reader.onerror = () => {
        console.error('FileReader error')
        showMessage("❌ Error reading gallery image", 3000)
        clearTimeout(uploadTimeout)
        setActiveUploads(count => count - 1)
      }
    } catch (error) {
      console.error('Gallery upload error:', error)
      showMessage("❌ Error uploading image", 3000)
      setActiveUploads(count => count - 1)
    }
  }


  // Revert to V1.0
  const revertToV1 = () => {
    if (confirm("Are you sure you want to revert to V1.0? This will reset all products and gallery images to their original state.")) {
      setFeaturedProducts(defaultProducts)
      saveProducts(defaultProducts)
      setGalleryImages(defaultGalleryImages)
      setPendingGalleryImages(defaultGalleryImages)
      localStorage.setItem('foxbuilt-gallery', JSON.stringify(defaultGalleryImages))
      
      // Images will reload after build
      
      showMessage("🔄 Reverted to V1.0! All products and gallery reset to original.", 5000)
      
      // Trigger storage event for main page
      window.dispatchEvent(new Event('storage'))
    }
  }

  // Save all changes (publish live)
  const saveAllChanges = async () => {
    showMessage("🚀 Publishing live site...", 30000) // 30 seconds for publish
    
    try {
      // GitHub API configuration
      // GitHub token from environment variable
      // Set this in Netlify: Site settings → Environment variables
      // Name: NEXT_PUBLIC_GITHUB_TOKEN
      // Value: your GitHub token (get from https://github.com/settings/tokens/new)
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
      const OWNER = 'lakotafox'
      const REPO = 'FOXSITE'
      const PATH = 'public/content.json'
      
      // First, get the current file to get its SHA
      const currentFileResponse = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )
      
      let sha = ''
      if (currentFileResponse.ok) {
        const currentFile = await currentFileResponse.json()
        sha = currentFile.sha
      }
      
      // No conversion needed - images already use GitHub paths
      // But we need to add crop settings to products
      const convertedProducts = JSON.parse(JSON.stringify(featuredProducts))
      Object.keys(convertedProducts).forEach(category => {
        convertedProducts[category].forEach((product: any) => {
          if (cropSettings[product.image]) {
            product.imageCrop = cropSettings[product.image]
          }
        })
      })
      const convertedGallery = pendingGalleryImages
      
      
      // Prepare the content
      const content = {
        products: convertedProducts,
        gallery: convertedGallery,
        galleryCrops: cropSettings, // Save all crop settings
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
            message: `Update products and gallery via admin panel - ${new Date().toLocaleString()}`,
            content: contentBase64,
            sha: sha, // Required for updates
            branch: 'main'
          })
        }
      )
      
      if (updateResponse.ok) {
        // Also save to localStorage as backup
        saveProducts(convertedProducts)
        localStorage.setItem('foxbuilt-gallery', JSON.stringify(convertedGallery))
        setGalleryImages(convertedGallery)
        setPendingGalleryImages(convertedGallery)
        
        setSaveMessage("✅ Published successfully!")
        
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
            setShowPublishConfirm(true)
          }, 60000) // 1 minute
        }, 2000)
      } else {
        const error = await updateResponse.json()
        console.error('GitHub API error:', error)
        setSaveMessage(`❌ Error publishing: ${error.message || updateResponse.status}`)
        setTimeout(() => setSaveMessage(""), 5000)
      }
    } catch (error) {
      console.error('Error publishing to GitHub:', error)
      setSaveMessage(`❌ Error publishing: ${error.message || error}`)
      setTimeout(() => setSaveMessage(""), 5000)
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
          {/* DVD Bouncing emojis */}
          <div className="absolute inset-0 overflow-hidden">
            <BouncingEmoji emoji="🎃" delay={0} />
            <BouncingEmoji emoji="🇺🇸" delay={0.5} />
            <BouncingEmoji emoji="🎃" delay={1} />
            <BouncingEmoji emoji="🇺🇸" delay={1.5} />
            <BouncingEmoji emoji="🔨" delay={2} />
            <BouncingEmoji emoji="🛠️" delay={2.5} />
            
            {/* Floating text message */}
            <div className="absolute top-3/4 right-1/4 text-white/80 font-bold text-lg animate-pulse" style={{ animationDelay: '1s' }}>
              🇺🇸 May Your Business Prosper! 🇺🇸
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
        {/* DVD Bouncing emojis (faded) */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <BouncingEmoji emoji="🎃" delay={0} />
          <BouncingEmoji emoji="🇺🇸" delay={0.5} />
          <BouncingEmoji emoji="🎃" delay={1} />
          <BouncingEmoji emoji="🇺🇸" delay={1.5} />
          <BouncingEmoji emoji="🔨" delay={2} />
          <BouncingEmoji emoji="🛠️" delay={2.5} />
        </div>
        
        <Card className="max-w-2xl w-full bg-white/95 backdrop-blur shadow-2xl border-4 border-red-600">
          <CardContent className="p-12">
            {/* ASCII Art - FOX on mobile, FOXBUILT on desktop */}
            <pre className="text-red-600 font-mono text-xs text-center mb-8 font-bold block md:hidden">
{`███████╗  ██████╗  ██╗  ██╗
██╔════╝ ██╔═══██╗ ╚██╗██╔╝
█████╗   ██║   ██║  ╚███╔╝ 
██╔══╝   ██║   ██║  ██╔██╗ 
██║      ╚██████╔╝ ██╔╝ ██╗
╚═╝       ╚═════╝  ╚═╝  ╚═╝`}
            </pre>
            
            <pre className="text-red-600 font-mono text-sm text-center mb-8 font-bold hidden md:block">
{`███████╗  ██████╗  ██╗  ██╗ ██████╗  ██╗   ██╗ ██╗ ██╗   ████████╗
██╔════╝ ██╔═══██╗ ╚██╗██╔╝ ██╔══██╗ ██║   ██║ ██║ ██║   ╚══██╔══╝
█████╗   ██║   ██║  ╚███╔╝  ██████╔╝ ██║   ██║ ██║ ██║      ██║   
██╔══╝   ██║   ██║  ██╔██╗  ██╔══██╗ ██║   ██║ ██║ ██║      ██║   
██║      ╚██████╔╝ ██╔╝ ██╗ ██████╔╝ ╚██████╔╝ ██║ ███████╗ ██║   
╚═╝       ╚═════╝  ╚═╝  ╚═╝ ╚═════╝   ╚═════╝  ╚═╝ ╚══════╝ ╚═╝`}
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

  // Show mobile warning
  if (isAuthenticated && isMobile) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <h1 className="text-3xl font-black text-red-600 mb-4">
            ⚠️ MOBILE NOT SUPPORTED
          </h1>
          <p className="text-lg mb-6">
            Editor on mobile is not ready yet!
          </p>
          <p className="text-gray-600 mb-8">
            Please use a desktop or laptop computer to edit the website.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            Return to Main Site
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Loading Overlay */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center pointer-events-auto" style={{ pointerEvents: 'all' }}>
          {/* Fox loading video only */}
          <video 
            className="w-64 h-64"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/foxloading.webm" type="video/webm" />
          </video>
        </div>
      )}
      
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
          <div className="text-white text-xl font-bold animate-pulse">
            {publishMessage}
          </div>
        </div>
      )}
      
      {/* Admin Controls Bar */}
      <div className="bg-green-600 text-white p-2">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              <span className="font-bold text-sm sm:text-base">ADMIN EDIT MODE</span>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                onClick={revertToV1}
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700 font-bold"
              >
                🔄 Revert to V1.0
              </Button>
              <Button
                onClick={saveAllChanges}
                size="lg"
                className="bg-green-600 text-white hover:bg-green-700 font-bold px-8 py-3 text-lg"
              >
                🚀 Publish Changes
              </Button>
          </div>
        </div>
      </div>

      {/* Save message */}
      {saveMessage && (
        <div className="fixed top-0 left-0 right-0 z-[59] bg-green-500 text-white p-4 text-center font-bold">
          {saveMessage}
        </div>
      )}

      {/* Main site content with edit capability */}
      <div>
        {/* Header - Hidden in admin mode */}
        {!isEditMode && (
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
        )}

        {/* Hero Section - Same as main site */}
        <section className={`bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 py-24 text-white relative overflow-hidden ${isEditMode ? "pt-24" : "pt-40"}`}>
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
              <div className="relative h-96 md:h-[500px] overflow-hidden border-8 border-slate-700 group bg-gray-100">
                {pendingGalleryImages.map((image, index) => {
                  const crop = cropSettings[image] || { scale: 1, x: 50, y: 50 }
                  const isEditing = editingCrop === image
                  const isActive = index === currentSlide
                  
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <div 
                        className="absolute inset-0"
                        style={{
                          transform: `translate(${crop.x - 50}%, ${crop.y - 50}%) scale(${crop.scale})`,
                          transition: isEditing ? 'none' : 'transform 0.3s'
                        }}
                      >
                        <Image 
                          src={getImageUrl(image, true)} 
                          alt={`Project ${index + 1}`} 
                          fill 
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      
                      {isEditMode && isActive && !isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity opacity-0 group-hover:opacity-100 flex items-center justify-center z-10">
                          <button
                            onClick={() => setEditingCrop(image)}
                            className="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded flex items-center gap-2 font-bold shadow-lg"
                          >
                            <Maximize2 className="w-5 h-5" />
                            Resize Image
                          </button>
                        </div>
                      )}
                      
                      {isEditing && isActive && (
                        <div 
                          className="absolute inset-0 z-20"
                          onClick={(e) => {
                            if (e.target === e.currentTarget) {
                              setEditingCrop(null)
                            }
                          }}
                          onWheel={(e) => {
                            e.preventDefault()
                            const delta = e.deltaY > 0 ? 0.9 : 1.1
                            const newScale = Math.max(0.5, Math.min(3, crop.scale * delta))
                            
                            setCropSettings(prev => ({
                              ...prev,
                              [image]: { ...crop, scale: newScale }
                            }))
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-center pointer-events-none">
                              <p className="font-bold text-xl mb-2 drop-shadow-lg">Use arrow keys to move</p>
                              <p className="text-lg drop-shadow-lg">Scroll to zoom in/out</p>
                              <p className="text-sm mt-2 drop-shadow-lg">Click anywhere to save</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
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
                {pendingGalleryImages.map((_, index) => (
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
                  <div className="relative h-64 group overflow-hidden bg-gray-100">
                    {(() => {
                      const crop = cropSettings[product.image] || { scale: 1, x: 50, y: 50 }
                      const isEditing = editingCrop === product.image
                      
                      return (
                        <>
                          <div 
                            className="absolute inset-0"
                            style={{
                              transform: `translate(${crop.x - 50}%, ${crop.y - 50}%) scale(${crop.scale})`,
                              transition: isEditing ? 'none' : 'transform 0.3s'
                            }}
                          >
                            <Image 
                              src={getImageUrl(product.image, false)} 
                              alt={product.title} 
                              fill 
                              className="object-cover"
                              unoptimized
                              key={product.image}
                            />
                          </div>
                          
                          {isEditMode && !isEditing && (
                            <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <div className="flex gap-2">
                                <label className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded cursor-pointer flex items-center gap-2 font-bold shadow-lg">
                                  <Edit2 className="w-4 h-4" />
                                  Change
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
                                <button
                                  onClick={() => setEditingCrop(product.image)}
                                  className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded flex items-center gap-2 font-bold shadow-lg"
                                >
                                  <Maximize2 className="w-4 h-4" />
                                  Resize
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {isEditing && (
                            <div 
                              className="absolute inset-0"
                              onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                  setEditingCrop(null)
                                }
                              }}
                              onWheel={(e) => {
                                e.preventDefault()
                                const delta = e.deltaY > 0 ? 0.9 : 1.1
                                const newScale = Math.max(0.5, Math.min(3, crop.scale * delta))
                                
                                setCropSettings(prev => ({
                                  ...prev,
                                  [product.image]: { ...crop, scale: newScale }
                                }))
                              }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-white text-center pointer-events-none">
                                  <p className="font-bold text-lg mb-2 drop-shadow-lg">Use arrow keys to move</p>
                                  <p className="text-sm drop-shadow-lg">Scroll to zoom in/out</p>
                                  <p className="text-xs mt-2 drop-shadow-lg">Click anywhere to save</p>
                                </div>
                              </div>
                            </div>
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
                        </>
                      )
                    })()}
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
                      {isEditMode && (
                        <Button 
                          variant="outline" 
                          className="border-2 border-slate-700 font-bold"
                          onClick={() => {
                            setExpandedSpecs(expandedSpecs === product.id ? null : product.id)
                          }}
                        >
                          SPECS
                        </Button>
                      )}
                    </div>
                    
                    {/* Inline specs editor for edit mode */}
                    {isEditMode && expandedSpecs === product.id && (
                      <div className="mt-4 bg-slate-100 p-4 rounded-lg">
                        <h3 className="font-bold text-lg mb-3 text-slate-800">Specifications:</h3>
                        <textarea
                          value={product.specs || ""}
                          onChange={(e) => updateProduct(featuredCategory, product.id, 'specs', e.target.value)}
                          className="w-full h-32 p-3 border-2 border-gray-300 rounded font-mono text-sm"
                          placeholder="Dimensions: 60&quot;W x 30&quot;D x 29&quot;H
Weight: 120 lbs
Material: Laminate surface with metal frame
Colors: Available in multiple finishes"
                        />
                      </div>
                    )}
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
                        <span className="text-xl font-bold">{textContent.phoneNumber}</span>
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
                    <div>
                      <p className="text-sm text-zinc-400 font-semibold">CALL US</p>
                      <p className="text-xl font-black">(801) 899-9406</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400 font-semibold">EMAIL US</p>
                      <p className="text-xl font-black">info@foxbuilt.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400 font-semibold">VISIT US</p>
                      <p className="text-lg font-black">420 W Commerce Dr Building LL</p>
                      <p className="text-lg font-black">Pleasant Grove, UT 84062</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black mb-8 tracking-wide">SEND A MESSAGE</h3>
                <form className="space-y-6">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 text-white placeholder-zinc-400 font-bold"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 text-white placeholder-zinc-400 font-bold"
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 text-white placeholder-zinc-400 font-bold"
                  />
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-lg py-4 border-4 border-red-500">
                    SEND MESSAGE
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black py-10 text-center text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-4xl">🇺🇸</span>
              <span className="font-black text-xl tracking-widest">PROUDLY AMERICAN</span>
              <span className="text-4xl">🇺🇸</span>
            </div>
            <p className="text-zinc-400 font-semibold">© 2024 FoxBuilt. All rights reserved.</p>
            <p className="text-zinc-500 text-sm mt-2">Built strong. Built right. Built to last.</p>
          </div>
        </footer>
      </div>

      {/* Gallery Editor Modal */}
      {showGalleryEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Gallery Images</h2>
              <Button
                onClick={() => setShowGalleryEditor(false)}
                variant="ghost"
                size="sm"
                className="text-black hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {pendingGalleryImages.map((image, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium">
                    Image {index + 1}
                  </label>
                  <div className="relative aspect-video bg-gray-100 rounded border-2 border-dashed border-gray-300 overflow-hidden group">
                    {image && (
                      <Image 
                        src={getImageUrl(image, true)} 
                        alt={`Gallery ${index + 1}`} 
                        fill 
                        className="object-cover"
                        unoptimized
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
                onClick={() => {
                  // Reset pending gallery images to current saved state
                  setPendingGalleryImages(galleryImages)
                  setShowGalleryEditor(false)
                }}
                variant="outline"
                className="border-2 border-gray-600 text-gray-700 hover:bg-gray-100 font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowGalleryEditor(false)
                  // Gallery changes are now staged in pendingGalleryImages
                  // They will be published when user clicks Publish button
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h2 className="text-2xl font-black text-center mb-4 text-slate-900">
              Going back to main site?
            </h2>
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                Yes
              </Button>
              <Button
                onClick={() => setShowPublishConfirm(false)}
                variant="outline"
                className="px-8 border-gray-600 text-gray-800 hover:bg-gray-100 font-bold"
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}


    </div>
    </div>
  )
}