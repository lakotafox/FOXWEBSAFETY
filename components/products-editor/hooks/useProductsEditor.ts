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
  const uploadState = useProductsUpload(uiState.showSaveMessage)
  const publishState = useProductsPublish()

  // Handle image upload
  const handleImageUpload = async (file: File, productId: number) => {
    try {
      const timestamp = Date.now()
      const fileName = `product-${productId}-${timestamp}.jpg`
      const githubPath = `/images/${fileName}`
      
      // Update the product with the new image path immediately
      dataState.updateProduct(productId, 'image', githubPath)
      
      // Initialize crop settings for the new image
      cropState.setCropSettings(prev => ({
        ...prev,
        [githubPath]: { scale: 1, x: 50, y: 50 }
      }))
      
      // Create a temporary preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          uploadState.setTempPreviews(prev => ({
            ...prev,
            [githubPath]: e.target.result as string
          }))
        }
      }
      reader.readAsDataURL(file)
      
      // Add to upload queue
      uploadState.setUploadQueue(queue => [...queue, { productId, file, fileName }])
    } catch (error) {
      console.error('Error handling image:', error)
      uiState.showSaveMessage("Error preparing image")
    }
  }

  // Handle publish with all necessary parameters
  const handlePublish = () => {
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