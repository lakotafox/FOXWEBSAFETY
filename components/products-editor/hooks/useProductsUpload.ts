'use client'

import { useState, useEffect } from 'react'
import { updateGitHubFile } from '@/lib/github-api-client'

interface UploadQueueItem {
  productId: number
  file: File
  fileName: string
}

export function useProductsUpload(showSaveMessage: (msg: string, duration?: number) => void) {
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([])
  const [activeUploads, setActiveUploads] = useState(0)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const [tempPreviews, setTempPreviews] = useState<{[key: string]: string}>({})

  // Process image upload using API route
  const processImageUpload = async (productId: number, file: File, fileName: string) => {
    setActiveUploads(count => count + 1)
    showSaveMessage("📤 Uploading image...")
    
    const uploadTimeout = setTimeout(() => {
      console.error('Upload timeout after 30 seconds')
      showSaveMessage("❌ Upload timeout - please try again", 5000)
      setActiveUploads(count => count - 1)
    }, 30000)
    
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = async () => {
        const base64Data = reader.result as string
        const base64Content = base64Data.split(',')[1]
        
        // Upload using API route
        const result = await updateGitHubFile(
          `images/${fileName}`,
          base64Content,
          `Upload product image ${fileName}`
        )
        
        clearTimeout(uploadTimeout)
        
        if (result.success) {
          showSaveMessage("✅ Image uploaded!", 3000)
        } else {
          console.error('Upload failed:', result.error)
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
      setTempPreviews(prev => ({
        ...prev,
        [`/images/${fileName}`]: e.target?.result as string
      }))
    }
    reader.readAsDataURL(file)
    
    setUploadQueue(prev => [...prev, { productId, file, fileName }])
    
    return `/images/${fileName}`
  }

  const getImageUrl = (imagePath: string) => {
    // Check if we have a temporary preview for this image
    if (tempPreviews[imagePath]) {
      return tempPreviews[imagePath]
    }
    // The images should be served from the public folder
    return imagePath
  }

  return {
    uploadQueue,
    activeUploads,
    showLoadingOverlay,
    tempPreviews,
    addToUploadQueue,
    getImageUrl
  }
}