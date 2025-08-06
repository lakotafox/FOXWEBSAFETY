"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, FileText, Save, Edit2, X, Check, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getProducts, saveProducts, defaultProducts } from "@/lib/products-data"

// Import our extracted components
import BouncingEmoji from '@/components/carrie/ui/BouncingEmoji'
import PasswordScreen from '@/components/carrie/auth/PasswordScreen'
import PageSelector from '@/components/carrie/ui/PageSelector'
import InitialPrompt from '@/components/carrie/ui/InitialPrompt'
import LoadingOverlay from '@/components/carrie/ui/LoadingOverlay'
import AdminControls from '@/components/carrie/ui/AdminControls'
import HelpModal from '@/components/carrie/ui/HelpModal'
import PublishConfirmation from '@/components/carrie/ui/PublishConfirmation'
import MobilePreviewHelp from '@/components/carrie/ui/MobilePreviewHelp'
import GalleryEditor from '@/components/carrie/editors/GalleryEditor'
import { publishToGitHub } from '@/components/carrie/services/github-publish'
import { 
  processProductImageUpload, 
  processGalleryImageUpload, 
  handleImageUpload as handleImageUploadService, 
  handleGalleryImageUpload as handleGalleryImageUploadService 
} from '@/components/carrie/services/image-upload'
import { CONSTRUCTION_MESSAGES, DEFAULT_GALLERY_IMAGES, DEFAULT_MOBILE_GALLERY_IMAGES } from '@/components/carrie/constants/editor-constants'
import { useCropControls } from '@/components/carrie/hooks/useCropControls'
import HeroSection from '@/components/carrie/sections/HeroSection'
import GallerySection from '@/components/carrie/sections/GallerySection'
import FeaturedProducts from '@/components/carrie/sections/FeaturedProducts'
import AboutSection from '@/components/carrie/sections/AboutSection'
import ContactSection from '@/components/carrie/sections/ContactSection'
import Footer from '@/components/carrie/sections/Footer'


export default function AdminEditor() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPageSelection, setShowPageSelection] = useState(false)
  const [password, setPassword] = useState("")
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
  const [showSpecsModal, setShowSpecsModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showMobilePreviewHelp, setShowMobilePreviewHelp] = useState(false)
  const [galleryViewMode, setGalleryViewMode] = useState<'desktop' | 'mobile'>('desktop')
  
  // Temporary preview storage for blob URLs
  const [tempPreviews, setTempPreviews] = useState<{[key: string]: string}>({})
  const [galleryTempPreviews, setGalleryTempPreviews] = useState<{[key: string]: string}>({})
  
  // Simple crop state
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [editingCrop, setEditingCrop] = useState<string | null>(null)

  // Gallery images
  const [galleryImages, setGalleryImages] = useState(DEFAULT_GALLERY_IMAGES)
  const [pendingGalleryImages, setPendingGalleryImages] = useState(DEFAULT_GALLERY_IMAGES)
  const [mobileGalleryImages, setMobileGalleryImages] = useState(DEFAULT_MOBILE_GALLERY_IMAGES)
  const [pendingMobileGalleryImages, setPendingMobileGalleryImages] = useState(DEFAULT_MOBILE_GALLERY_IMAGES)
  
  // Upload queue management
  const [uploadQueue, setUploadQueue] = useState<Array<{type: 'product' | 'gallery', file: File, category?: string, productId?: number, index?: number, fileName?: string}>>([])
  const [isUploading, setIsUploading] = useState(false)
  const [activeUploads, setActiveUploads] = useState(0)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const [showPublishLoadingOverlay, setShowPublishLoadingOverlay] = useState(false)
  const [publishMessage, setPublishMessage] = useState("")
  const [showHelp, setShowHelp] = useState(false)
  
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
    "Applying finish coat..."
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
  useCropControls({
    editingCrop,
    cropSettings,
    setCropSettings,
    setEditingCrop
  })

  // Check if mobile and load saved data on mount
  useEffect(() => {
    // Check if mobile
    
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
    
    const savedMobileGallery = localStorage.getItem('foxbuilt-mobile-gallery')
    if (savedMobileGallery) {
      try {
        const images = JSON.parse(savedMobileGallery)
        setMobileGalleryImages(images)
        setPendingMobileGalleryImages(images)
      } catch (e) {
        console.error('Error loading mobile gallery images:', e)
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
        if (data.mobileGallery) {
          setMobileGalleryImages(data.mobileGallery)
          setPendingMobileGalleryImages(data.mobileGallery)
          localStorage.setItem('foxbuilt-mobile-gallery', JSON.stringify(data.mobileGallery))
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
        processProductImageUpload(nextUpload.category!, nextUpload.productId!, nextUpload.file, nextUpload.fileName!, {
          showMessage,
          setActiveUploads
        })
      } else {
        processGalleryImageUpload(nextUpload.index!, nextUpload.file, nextUpload.fileName!, {
          showMessage,
          setActiveUploads
        })
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

  // Auto-slide gallery (only when not in edit mode)
  useEffect(() => {
    if (!isEditMode) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % pendingGalleryImages.length)
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [pendingGalleryImages.length, isEditMode])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % pendingGalleryImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + pendingGalleryImages.length) % pendingGalleryImages.length)
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
    handleImageUploadService(category, productId, file, {
      updateProduct,
      setCropSettings,
      setTempPreviews,
      setUploadQueue,
      showMessage,
      setActiveUploads
    })
  }
  

  // Add gallery image to upload queue
  const handleGalleryImageUpload = (index: number, file: File, isMobile: boolean = false) => {
    const currentImages = isMobile ? pendingMobileGalleryImages : pendingGalleryImages
    const setImages = isMobile ? setPendingMobileGalleryImages : setPendingGalleryImages
    
    handleGalleryImageUploadService(index, file, currentImages, {
      setPendingGalleryImages: setImages,
      setCropSettings,
      setGalleryTempPreviews,
      setUploadQueue,
      showMessage,
      setActiveUploads
    })
  }



  // Save all changes (publish live)
  const saveAllChanges = async () => {
    const result = await publishToGitHub({
      products: featuredProducts,
      gallery: pendingGalleryImages,
      mobileGallery: pendingMobileGalleryImages,
      cropSettings,
      showMessage
    })
    
    if (result.success) {
      // Also save to localStorage as backup
      saveProducts(featuredProducts)
      localStorage.setItem('foxbuilt-gallery', JSON.stringify(pendingGalleryImages))
      localStorage.setItem('foxbuilt-mobile-gallery', JSON.stringify(pendingMobileGalleryImages))
      setGalleryImages(pendingGalleryImages)
      setPendingGalleryImages(pendingGalleryImages)
      setMobileGalleryImages(pendingMobileGalleryImages)
      setPendingMobileGalleryImages(pendingMobileGalleryImages)
      
      setSaveMessage("✅ Published successfully!")
      
      // Show publish loading overlay for 1 minute
      setTimeout(() => {
        setSaveMessage("")
        setShowPublishLoadingOverlay(true)
        
        // Start rotating messages
        let messageIndex = 0
        setPublishMessage(CONSTRUCTION_MESSAGES[0])
        
        const messageInterval = setInterval(() => {
          messageIndex = (messageIndex + 1) % CONSTRUCTION_MESSAGES.length
          setPublishMessage(CONSTRUCTION_MESSAGES[messageIndex])
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
      setSaveMessage(`❌ Error publishing: ${result.error}`)
      setTimeout(() => setSaveMessage(""), 5000)
    }
  }



  // Login screen
  if (!isAuthenticated) {
    // Show page selection after successful password
    if (showPageSelection) {
      return (
        <PageSelector 
          onSelectMainPage={() => setIsAuthenticated(true)}
          onSelectProductsPage={() => {
            sessionStorage.setItem('foxbuilt-authenticated', 'true')
            window.location.href = '/products-editor'
          }}
          onBack={() => {
            setShowPageSelection(false)
            setPassword("")
          }}
        />
      )
    }
    
    if (!showPasswordScreen) {
      return <InitialPrompt onShowPassword={() => setShowPasswordScreen(true)} />
    }

    // Password screen
    return <PasswordScreen onAuthenticate={() => setShowPageSelection(true)} />
  }


  return (
    <div className="min-h-screen bg-zinc-100">
      <LoadingOverlay show={showLoadingOverlay} type="default" />
      <LoadingOverlay show={showPublishLoadingOverlay} type="publish" publishMessage={publishMessage} />
      
      <AdminControls onPublish={saveAllChanges} onMobilePreview={() => setShowMobilePreviewHelp(true)} />
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

            {/* Centered FOXBUILT OFFICE FURNITURE text - Desktop only */}
            <h1 className="hidden md:block text-2xl font-black text-white tracking-tight absolute left-1/2 transform -translate-x-1/2">
              FOXBUILT <span className="text-red-600">OFFICE</span> <span className="text-blue-400">FURNITURE</span>
            </h1>

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

        <HeroSection isEditMode={isEditMode} />

        <GallerySection
          isEditMode={isEditMode}
          pendingGalleryImages={galleryViewMode === 'mobile' ? pendingMobileGalleryImages : pendingGalleryImages}
          currentSlide={currentSlide}
          cropSettings={cropSettings}
          editingCrop={editingCrop}
          onEditGallery={() => setShowGalleryEditor(true)}
          onSetCurrentSlide={setCurrentSlide}
          onSetEditingCrop={setEditingCrop}
          onNextSlide={nextSlide}
          onPrevSlide={prevSlide}
          getImageUrl={getImageUrl}
        />

        {/* Featured Products Section - EDITABLE */}
        <FeaturedProducts
          isEditMode={isEditMode}
          featuredCategory={featuredCategory}
          featuredProducts={featuredProducts}
          editingId={editingId}
          cropSettings={cropSettings}
          editingCrop={editingCrop}
          onCategorySelect={setFeaturedCategory}
          onEditingIdChange={setEditingId}
          onUpdateProduct={updateProduct}
          onImageUpload={handleImageUpload}
          onSetEditingCrop={setEditingCrop}
          getImageUrl={getImageUrl}
        />

        {/* About Us Section */}
        <AboutSection 
          showAddress={showAddress}
          onToggleAddress={() => setShowAddress(!showAddress)}
        />

        {/* Contact Section */}
        <ContactSection />

        <Footer />
      </div>

      <GalleryEditor
        show={showGalleryEditor}
        onClose={() => setShowGalleryEditor(false)}
        galleryImages={pendingGalleryImages}
        mobileGalleryImages={pendingMobileGalleryImages}
        onImageUpload={handleGalleryImageUpload}
        getImageUrl={getImageUrl}
        viewMode={galleryViewMode}
        onViewModeChange={setGalleryViewMode}
      />


      <PublishConfirmation 
        show={showPublishConfirm} 
        onConfirm={() => window.location.href = '/'}
        onCancel={() => setShowPublishConfirm(false)}
      />

      {/* Floating Help Button */}
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

      <HelpModal show={showHelp} onClose={() => setShowHelp(false)} />
      
      <MobilePreviewHelp 
        show={showMobilePreviewHelp}
        onClose={() => setShowMobilePreviewHelp(false)}
      />
    </div>
  )
}