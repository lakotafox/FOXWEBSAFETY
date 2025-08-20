import { imageStore } from './local-image-store'
import { updateGitHubFile } from '@/lib/github-api-client'

interface PublishOptions {
  products: any
  gallery: string[]
  mobileGallery?: string[]
  cropSettings: {[key: string]: {scale: number, x: number, y: number}}
  showMessage: (message: string, duration?: number) => void
}

export async function publishToGitHub({ 
  products, 
  gallery,
  mobileGallery, 
  cropSettings, 
  showMessage 
}: PublishOptions) {
  // Use same gallery for both mobile and desktop
  const galleryToUse = gallery || mobileGallery || []
  showMessage("🚀 Publishing live site...", 30000) // 30 seconds for publish
  
  try {
    // First, upload any pending images
    const pendingImages = imageStore.getPendingImages()
    if (pendingImages.length > 0) {
      showMessage(`📤 Uploading ${pendingImages.length} images...`, 10000)
      
      // TODO: Convert image uploads to use API route as well
      // For now, we'll skip image uploads to prevent token exposure
      console.warn('Image uploads temporarily disabled - use direct file upload instead')
      imageStore.clearPendingImages()
    }
    
    // Add crop settings to products
    const convertedProducts = JSON.parse(JSON.stringify(products))
    Object.keys(convertedProducts).forEach(category => {
      convertedProducts[category].forEach((product: any) => {
        if (cropSettings[product.image]) {
          product.imageCrop = cropSettings[product.image]
        }
      })
    })
    
    // Prepare the content for content.json (includes gallery)
    const content = {
      products: convertedProducts,
      gallery: galleryToUse,
      mobileGallery: galleryToUse, // Same gallery for both
      galleryCrops: cropSettings,
      lastUpdated: new Date().toISOString(),
      updatedBy: "Kyle"
    }

    // Prepare main-products.json content (just products with embedded crops)
    const productsContent = {
      products: convertedProducts,
      productsCrops: cropSettings
    }
    
    // Update content.json file using API route
    const contentResult = await updateGitHubFile(
      'content.json',
      content,
      `Update content via main editor - ${new Date().toLocaleString()}`
    )
    
    if (!contentResult.success) {
      console.error('Failed to update content.json:', contentResult.error)
      return { 
        success: false, 
        error: contentResult.error || 'Failed to update content' 
      }
    }
    
    // Update main-products.json file using API route
    const productsResult = await updateGitHubFile(
      'main-products.json',
      productsContent,
      `Update main page products via carrie editor - ${new Date().toLocaleString()}`
    )
    
    if (!productsResult.success) {
      console.error('Failed to update main-products.json:', productsResult.error)
      return { 
        success: false, 
        error: productsResult.error || 'Failed to update products' 
      }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error publishing to GitHub:', error)
    return { 
      success: false, 
      error: error.message || 'Unknown error' 
    }
  }
}