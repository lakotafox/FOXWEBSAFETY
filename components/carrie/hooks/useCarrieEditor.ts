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

  // Helper function to get displayable image URL
  const getImageUrl = (imagePath: string, isGallery: boolean = false) => {
    const previewMap = isGallery ? galleryTempPreviews : tempPreviews
    return imageState.getImageUrl(imagePath, previewMap)
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

  // Save all changes (publish live)
  const saveAllChanges = async () => {
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
      
      // Show publish loading overlay for 1 minute
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
        
        // Hide overlay after 60 seconds
        setTimeout(() => {
          clearInterval(messageInterval)
          setShowPublishLoadingOverlay(false)
          setPublishMessage("")
          setShowPublishConfirm(true)
        }, 60000) // 1 minute
      }, 2000)
    } else {
      showMessage(`❌ Error publishing: ${result.error}`, 5000)
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