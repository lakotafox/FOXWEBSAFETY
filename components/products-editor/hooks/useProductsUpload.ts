'use client'

import { useState, useEffect } from 'react'
import { getCloudinaryConfig } from '@/lib/cloudinary-config'

interface UploadQueueItem {
  productId: number
  file: File
  fileName: string
}

export function useProductsUpload(showSaveMessage: (msg: string, duration?: number) => void, onUploadComplete?: (productId: number, cloudinaryUrl: string) => void) {
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([])
  const [activeUploads, setActiveUploads] = useState(0)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const [tempPreviews, setTempPreviews] = useState<{[key: string]: string}>({})

  // Process image upload directly to Cloudinary
  const processImageUpload = async (productId: number, file: File, fileName: string) => {
    setActiveUploads(count => count + 1)
    showSaveMessage("📤 Uploading image to Cloudinary...")
    
    const uploadTimeout = setTimeout(() => {
      console.error('Upload timeout after 60 seconds')
      showSaveMessage("❌ Upload timeout - please try again", 5000)
      setActiveUploads(count => count - 1)
    }, 60000) // Increased to 60 seconds for large files
    
    try {
      // Get Cloudinary config
      const config = getCloudinaryConfig()
      
      if (!config.cloudName || !config.uploadPreset) {
        showSaveMessage("❌ Please configure Cloudinary settings first", 5000)
        clearTimeout(uploadTimeout)
        setActiveUploads(count => count - 1)
        return null
      }
      
      // Create FormData for direct upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', config.uploadPreset)
      
      console.log('Uploading directly to Cloudinary:', config.cloudName)
      console.log('File size:', file.size, 'bytes')
      
      // Upload directly to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )
      
      clearTimeout(uploadTimeout)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Upload successful:', result.secure_url)
        showSaveMessage("✅ Image uploaded to Cloudinary!", 3000)
        
        // Update temp previews with the Cloudinary URL
        setTempPreviews(prev => ({
          ...prev,
          [`cloudinary-pending-${fileName}`]: result.secure_url
        }))
        
        // Call the callback to update the product with the Cloudinary URL
        if (onUploadComplete) {
          onUploadComplete(productId, result.secure_url)
        }
        
        // Return the Cloudinary URL for saving
        return result.secure_url
      } else {
        const errorText = await response.text()
        console.error('Cloudinary upload failed:', errorText)
        showSaveMessage("❌ Upload failed", 5000)
      }
    } catch (error) {
      console.error('Upload error:', error)
      showSaveMessage("❌ Error uploading image", 3000)
      clearTimeout(uploadTimeout)
    } finally {
      // ALWAYS decrement activeUploads, no matter what happens
      setActiveUploads(count => count - 1)
    }
    
    return null
  }

  // Process upload queue
  useEffect(() => {
    if (uploadQueue.length > 0 && activeUploads === 0) {
      const [nextUpload, ...remainingQueue] = uploadQueue
      setUploadQueue(remainingQueue)
      processImageUpload(nextUpload.productId, nextUpload.file, nextUpload.fileName)
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

  // Add image to upload queue
  const addToUploadQueue = (productId: number, file: File) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `product-${productId}-${timestamp}.${fileExt}`
    
    // Create temporary preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      const tempUrl = e.target?.result as string
      setTempPreviews(prev => ({
        ...prev,
        [`cloudinary-pending-${fileName}`]: tempUrl
      }))
    }
    reader.readAsDataURL(file)
    
    setUploadQueue(prev => [...prev, { productId, file, fileName }])
    
    // Return a temporary identifier that will be replaced with Cloudinary URL
    return `cloudinary-pending-${fileName}`
  }

  const getImageUrl = (imagePath: string) => {
    // Check if we have a temporary preview for this image
    if (tempPreviews[imagePath]) {
      return tempPreviews[imagePath]
    }
    // Check if it's a Cloudinary URL
    if (imagePath && (imagePath.includes('cloudinary.com') || imagePath.includes('res.cloudinary.com'))) {
      return imagePath
    }
    // Check if it's a pending upload
    if (imagePath && imagePath.startsWith('cloudinary-pending-')) {
      return tempPreviews[imagePath] || '/placeholder.svg'
    }
    // The images should be served from the public folder
    return imagePath
  }

  return {
    uploadQueue,
    activeUploads,
    showLoadingOverlay,
    tempPreviews,
    setTempPreviews,
    addToUploadQueue,
    getImageUrl
  }
}