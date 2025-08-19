'use client'

import { useState, useEffect } from 'react'

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

  // Manage loading overlay with 4-second minimum
  useEffect(() => {
    const shouldShowOverlay = activeUploads > 0 || uploadQueue.length > 0
    
    if (shouldShowOverlay && !showLoadingOverlay) {
      setShowLoadingOverlay(true)
      setLoadingStartTime(Date.now())
    } else if (!shouldShowOverlay && showLoadingOverlay && loadingStartTime) {
      const elapsed = Date.now() - loadingStartTime
      const remaining = 4000 - elapsed
      
      if (remaining > 0) {
        setTimeout(() => {
          setShowLoadingOverlay(false)
          setLoadingStartTime(null)
        }, remaining)
      } else {
        setShowLoadingOverlay(false)
        setLoadingStartTime(null)
      }
    }
  }, [activeUploads, uploadQueue.length, showLoadingOverlay, loadingStartTime])

  // Image URL helper function
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg"
    
    // Check for temp previews first
    if (tempPreviews[imagePath]) {
      return tempPreviews[imagePath]
    }
    
    // For local development and production, just use the path as-is
    // The images should be served from the public folder
    if (imagePath.startsWith('/images/')) {
      return imagePath
    }
    
    // Handle full URLs
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    
    // Default to treating it as a path from root
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  }

  return {
    uploadQueue,
    setUploadQueue,
    activeUploads,
    setActiveUploads,
    showLoadingOverlay,
    setShowLoadingOverlay,
    loadingStartTime,
    setLoadingStartTime,
    tempPreviews,
    setTempPreviews,
    processImageUpload,
    getImageUrl
  }
}