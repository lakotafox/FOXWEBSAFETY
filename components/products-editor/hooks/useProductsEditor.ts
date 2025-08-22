'use client'

import { useProductsData } from './useProductsData'
import { useProductsUI } from './useProductsUI'
import { useProductsUpload } from './useProductsUpload'
import { useProductsCrop } from './useProductsCrop'
import { useProductsPublish } from './useProductsPublish'

export function useProductsEditor(category?: string) {
  // Use focused hooks
  const uiState = useProductsUI()
  const dataState = useProductsData(category)
  const cropState = useProductsCrop()
  const uploadState = useProductsUpload(
    uiState.showSaveMessage,
    (productId: number, cloudinaryUrl: string) => {
      // Update the product with the actual Cloudinary URL after upload
      dataState.updateProduct(productId, 'image', cloudinaryUrl)
    }
  )
  const publishState = useProductsPublish()

  // Handle image upload
  const handleImageUpload = async (file: File, productId: number) => {
    try {
      // Use the addToUploadQueue function which handles preview creation
      const githubPath = uploadState.addToUploadQueue(productId, file)
      
      // Update the product with the new image path immediately
      dataState.updateProduct(productId, 'image', githubPath)
      
      // Initialize crop settings for the new image
      cropState.setCropSettings(prev => ({
        ...prev,
        [githubPath]: { scale: 1, x: 50, y: 50 }
      }))
    } catch (error) {
      console.error('Error handling image:', error)
      uiState.showSaveMessage("Error preparing image")
    }
  }

  // Handle publish with all necessary parameters
  const handlePublish = async () => {
    // Check if there are active uploads
    if (uploadState.activeUploads > 0 || uploadState.uploadQueue.length > 0) {
      uiState.showSaveMessage("⏳ Waiting for uploads to complete before publishing...", 5000)
      
      // Wait for uploads to complete
      const waitForUploads = () => {
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (uploadState.activeUploads === 0 && uploadState.uploadQueue.length === 0) {
              clearInterval(checkInterval)
              resolve(true)
            }
          }, 500)
        })
      }
      
      await waitForUploads()
      uiState.showSaveMessage("✅ Uploads complete, now publishing...", 3000)
    }
    
    publishState.handlePublish({
      products: dataState.products,
      cropSettings: cropState.cropSettings,
      pageName: dataState.pageName,
      categoryId: category,
      saveProductsPageItems: dataState.saveProductsPageItems,
      saveCropSettings: cropState.saveCropSettings,
      showSaveMessage: uiState.showSaveMessage,
      setSaveMessage: uiState.setSaveMessage,
      setShowPublishLoadingOverlay: uiState.setShowPublishLoadingOverlay,
      setPublishMessage: uiState.setPublishMessage,
      setShowSuccessScreen: uiState.setShowSuccessScreen,
      setTempPreviews: uploadState.setTempPreviews
    })
  }

  return {
    // Spread all state from hooks
    ...uiState,
    ...dataState,
    ...cropState,
    ...uploadState,
    ...publishState,
    
    // Override/add custom functions
    handleImageUpload,
    handlePublish,
    
    // For backwards compatibility
    getImageUrl: uploadState.getImageUrl,
    showSaveMessage: uiState.showSaveMessage
  }
}