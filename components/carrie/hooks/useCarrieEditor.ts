"use client"

import { useEffect } from "react"
import { saveMainProducts } from "@/lib/main-products-data"
import { publishToGitHub } from '@/components/carrie/services/github-publish'
import { 
  processProductImageUpload, 
  processGalleryImageUpload, 
  handleImageUpload as handleImageUploadService, 
  handleGalleryImageUpload as handleGalleryImageUploadService 
} from '@/components/carrie/services/image-upload'
import { useCropControls } from '@/lib/hooks/useCropControls'
import { useAuthState } from './useAuthState'
import { useUIState } from './useUIState'
import { useGalleryState } from './useGalleryState'
import { useProductState } from './useProductState'
import { useImageState } from './useImageState'
import { useUploadState } from './useUploadState'

export const useCarrieEditor = () => {
  // Use focused hooks
  const authState = useAuthState()
  const uiState = useUIState()
  const galleryState = useGalleryState()
  const productState = useProductState()
  const imageState = useImageState()
  const uploadState = useUploadState()
  
  // Destructure for easier access
  const { 
    currentSlide, 
    setCurrentSlide, 
    showMessage, 
    saveMessage,
    setIsScrolled,
    setShowPublishConfirm 
  } = uiState
  const { 
    pendingGalleryImages,
    setPendingGalleryImages,
    pendingMobileGalleryImages,
    setPendingMobileGalleryImages,
    galleryImages,
    setGalleryImages,
    mobileGalleryImages,
    setMobileGalleryImages,
    galleryTempPreviews,
    setGalleryTempPreviews,
    galleryViewMode,
    isGalleryUserControlled,
    setIsGalleryUserControlled
  } = galleryState
  const { featuredProducts, setFeaturedProducts, editingId } = productState
  const { tempPreviews, setTempPreviews, cropSettings, setCropSettings, editingCrop, setEditingCrop } = imageState
  const { 
    uploadQueue,
    setUploadQueue,
    activeUploads,
    setActiveUploads,
    showLoadingOverlay,
    setShowLoadingOverlay,
    loadingStartTime,
    setLoadingStartTime,
    publishMessage,
    setPublishMessage,
    showPublishLoadingOverlay,
    setShowPublishLoadingOverlay,
    getRandomConstructionMessage
  } = uploadState

  // Helper function to get displayable image URL - matches products editor
  const getImageUrl = (imagePath: string, isGallery: boolean = false) => {
    if (!imagePath) return "/placeholder.svg"
    
    const previewMap = isGallery ? galleryTempPreviews : tempPreviews
    
    // Check if we have a temporary preview for this image
    if (previewMap[imagePath]) {
      return previewMap[imagePath]
    }
    
    // Check if it's a Cloudinary URL
    if (imagePath.includes('cloudinary.com') || imagePath.includes('res.cloudinary.com')) {
      return imagePath
    }
    
    // Check if it's a pending upload - show fox loading if no preview available
    if (imagePath.startsWith('cloudinary-pending-')) {
      return previewMap[imagePath] || '/fox-loading.gif'
    }
    
    // Regular image path
    return imagePath
  }

  // Gallery navigation functions
  const nextSlide = () => {
    setIsGalleryUserControlled(true)
    setCurrentSlide((prev) => (prev + 1) % pendingGalleryImages.length)
  }

  const prevSlide = () => {
    setIsGalleryUserControlled(true)
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

  // Save all changes (publish live) - matches products editor pattern
  const saveAllChanges = async () => {
    // Check if there are active uploads
    if (activeUploads > 0 || uploadQueue.length > 0) {
      showMessage("⏳ Waiting for uploads to complete before publishing...", 5000)
      
      // Wait for uploads to complete
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (activeUploads === 0 && uploadQueue.length === 0) {
            clearInterval(checkInterval)
            resolve(true)
          }
        }, 500)
      })
      
      showMessage("✅ Uploads complete, now publishing...", 3000)
    }
    
    const result = await publishToGitHub({
      products: featuredProducts,
      gallery: pendingGalleryImages,
      mobileGallery: pendingGalleryImages, // Same gallery for both
      cropSettings,
      showMessage
    })
    
    if (result.success) {
      // Also save to localStorage as backup
      saveMainProducts(featuredProducts)
      localStorage.setItem('foxbuilt-gallery', JSON.stringify(pendingGalleryImages))
      setGalleryImages(pendingGalleryImages)
      setPendingGalleryImages(pendingGalleryImages)
      
      showMessage("✅ Published successfully!")
      
      // Show publish loading overlay for 3 minutes
      setTimeout(() => {
        showMessage("")
        setShowPublishLoadingOverlay(true)
        
        // Start rotating messages
        let messageIndex = 0
        const messages = getRandomConstructionMessage()
        setPublishMessage(messages)
        
        const messageInterval = setInterval(() => {
          setPublishMessage(getRandomConstructionMessage())
        }, 4000) // Change message every 4 seconds
        
        // Hide overlay after 180 seconds
        setTimeout(() => {
          clearInterval(messageInterval)
          setShowPublishLoadingOverlay(false)
          setPublishMessage("")
          setShowPublishConfirm(true)
        }, 180000) // 3 minutes
      }, 2000)
    } else {
      // Keep animation playing forever on error
      setShowPublishLoadingOverlay(true)
      
      // Start with "That's okay because..." then rotate other messages
      setPublishMessage("That's okay because...")
      
      const errorMessages = [
        "No worry, mon just a little error jam.",
        "We be dancin' through the bug, brother.",
        "Fox still vibin', cause peoples still buyin'.",
        "Don't ya know da music fix what code can't bro.",
        "Island time, slow down enjoy the chime.",
        "Good vibes always override when system offline",
        "Brotheration mend this code with time"
      ]
      
      let messageIndex = 0
      
      // After 4 seconds, start rotating the other messages
      setTimeout(() => {
        const messageInterval = setInterval(() => {
          setPublishMessage(errorMessages[messageIndex])
          messageIndex = (messageIndex + 1) % errorMessages.length
        }, 8000) // Rotate every 8 seconds (twice as slow)
      }, 4000)
      
      // Don't hide overlay on error - let it loop forever
    }
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
    // Load products from main-products.json (where this editor publishes to)
    fetch('/main-products.json')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setFeaturedProducts(data.products)
          saveMainProducts(data.products)
          
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
        if (data.productsCrops) {
          setCropSettings(prev => ({...prev, ...data.productsCrops}))
        }
      })
      .catch(err => {
        console.log('Could not load main-products.json:', err)
      })
    
    // Always load gallery from content.json (where gallery data is actually stored)
    fetch('/content.json')
      .then(res => res.json())
      .then(data => {
        if (data.gallery && data.gallery.length > 0) {
          setGalleryImages(data.gallery)
          setPendingGalleryImages(data.gallery)
          localStorage.setItem('foxbuilt-gallery', JSON.stringify(data.gallery))
        } else if (data.mobileGallery && data.mobileGallery.length > 0) {
          // Fallback to mobileGallery if gallery is empty
          setGalleryImages(data.mobileGallery)
          setPendingGalleryImages(data.mobileGallery)
          localStorage.setItem('foxbuilt-gallery', JSON.stringify(data.mobileGallery))
        }
        
        // Load gallery crops if available
        if (data.galleryCrops) {
          setCropSettings(prev => ({...prev, ...data.galleryCrops}))
        }
      })
      .catch(err => {
        console.log('Could not load content.json, using localStorage:', err)
        // Fall back to localStorage if content.json fails
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
  
  // Process upload queue for Cloudinary
  useEffect(() => {
    if (uploadQueue.length > 0 && activeUploads === 0) {
      const [nextUpload, ...remainingQueue] = uploadQueue
      setUploadQueue(remainingQueue)
      
      if (!nextUpload.isGallery) {
        // Product image upload
        processProductImageUpload(nextUpload.category!, nextUpload.productId, nextUpload.file, nextUpload.fileName, {
          showMessage,
          setActiveUploads,
          setCropSettings,
          setTempPreviews,
          setGalleryTempPreviews,
          setUploadQueue,
          onUploadComplete: (category, productId, cloudinaryUrl) => {
            // Update the product with the actual Cloudinary URL
            updateProduct(category, productId, 'image', cloudinaryUrl)
            // Also update temp previews to keep the URL accessible
            setTempPreviews(prev => ({
              ...prev,
              [cloudinaryUrl]: cloudinaryUrl
            }))
          }
        })
      } else {
        // Gallery image upload
        processGalleryImageUpload(nextUpload.index!, nextUpload.file, nextUpload.fileName, {
          showMessage,
          setActiveUploads,
          setCropSettings,
          setTempPreviews,
          setGalleryTempPreviews,
          setUploadQueue,
          onUploadComplete: (index, cloudinaryUrl) => {
            // Update gallery with actual URL
            if (galleryViewMode === 'mobile') {
              const newImages = [...pendingMobileGalleryImages]
              newImages[index] = cloudinaryUrl
              setPendingMobileGalleryImages(newImages)
            } else {
              const newImages = [...pendingGalleryImages]
              newImages[index] = cloudinaryUrl
              setPendingGalleryImages(newImages)
            }
            // Update previews
            setGalleryTempPreviews(prev => ({
              ...prev,
              [cloudinaryUrl]: cloudinaryUrl
            }))
          }
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
  }, [activeUploads, uploadQueue.length, showLoadingOverlay, loadingStartTime, setShowLoadingOverlay, setLoadingStartTime])

  // Auto-slide gallery (only when not in edit mode and user hasn't manually navigated)
  useEffect(() => {
    if (!uiState.isEditMode && !isGalleryUserControlled) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % pendingGalleryImages.length)
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [pendingGalleryImages.length, uiState.isEditMode, isGalleryUserControlled, setCurrentSlide])

  return {
    // Spread all state from hooks
    ...authState,
    ...uiState,
    ...galleryState,
    ...productState,
    ...imageState,
    ...uploadState,
    
    // Override getImageUrl with our custom implementation
    getImageUrl,
    
    // Functions
    nextSlide,
    prevSlide,
    updateProduct,
    handleImageUpload,
    handleGalleryImageUpload,
    saveAllChanges
  }
}