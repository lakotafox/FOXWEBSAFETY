import { GITHUB_CONFIG } from '../constants/editor-constants'
import { imageStore } from './local-image-store'

interface UploadCallbacks {
  showMessage: (message: string, duration?: number) => void
  setActiveUploads: (fn: (count: number) => number) => void
  updateProduct?: (category: string, productId: number, field: string, value: any) => void
  setPendingGalleryImages?: (images: string[]) => void
  setCropSettings: (fn: (prev: any) => any) => void
  setTempPreviews?: (fn: (prev: any) => any) => void
  setGalleryTempPreviews?: (fn: (prev: any) => any) => void
}

// Process product image upload
export const processProductImageUpload = async (
  category: string, 
  productId: number, 
  file: File, 
  fileName: string,
  callbacks: UploadCallbacks
) => {
  const { showMessage, setActiveUploads } = callbacks
  
  setActiveUploads(count => count + 1)
  
  // Set a timeout to prevent infinite loading
  const uploadTimeout = setTimeout(() => {
    console.error('Product upload timeout after 30 seconds')
    showMessage("❌ Upload timeout - please try again", 5000)
    setActiveUploads(count => count - 1)
  }, 30000) // 30 second timeout
  
  try {
    // Use the pre-generated filename
    const PATH = `public/images/${fileName}`
    
    // Convert file to base64
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = async () => {
      const base64Data = reader.result as string
      // Remove the data:image/jpeg;base64, prefix
      const base64Content = base64Data.split(',')[1]
      
      // Store image locally instead of uploading immediately
      imageStore.addPendingImage(fileName, base64Content)
      
      // Mark as successful without uploading
      showMessage("✅ Image ready to publish", 2000)
      clearTimeout(uploadTimeout)
      setActiveUploads(count => count - 1)
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

// Process gallery image upload
export const processGalleryImageUpload = async (
  index: number, 
  file: File, 
  fileName: string,
  callbacks: UploadCallbacks
) => {
  const { showMessage, setActiveUploads } = callbacks
  
  setActiveUploads(count => count + 1)
  
  // Set a timeout to prevent infinite loading
  const uploadTimeout = setTimeout(() => {
    showMessage("❌ Upload timeout - please try again", 5000)
    setActiveUploads(count => count - 1)
  }, 30000) // 30 second timeout
  
  try {
    // Use the pre-generated filename
    const PATH = `public/images/${fileName}`
    
    // Convert file to base64
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string
        const base64Content = base64Data.split(',')[1]
        
        // Store image locally instead of uploading immediately
        imageStore.addPendingImage(fileName, base64Content)
        
        // Mark as successful without uploading
        showMessage("✅ Gallery image ready to publish", 2000)
        clearTimeout(uploadTimeout)
        setActiveUploads(count => count - 1)
      } catch (uploadError) {
        console.error('Error storing image:', uploadError)
        showMessage("❌ Error storing image", 3000)
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

// Add image to upload queue
export const handleImageUpload = (
  category: string, 
  productId: number, 
  file: File,
  callbacks: UploadCallbacks & { 
    setUploadQueue: (fn: (queue: any[]) => any[]) => void 
  }
) => {
  const { updateProduct, setCropSettings, setTempPreviews, setUploadQueue } = callbacks
  
  // Generate the filename immediately
  const timestamp = Date.now()
  const fileName = `product-${productId}-${timestamp}.jpg`
  const githubPath = `/images/${fileName}`
  
  // Update to use GitHub path immediately
  if (updateProduct) {
    updateProduct(category, productId, 'image', githubPath)
  }
  
  // Reset crop settings for the new image (full image, no crop)
  setCropSettings(prev => ({
    ...prev,
    [githubPath]: { scale: 1, x: 50, y: 50 }
  }))
  
  // Create a temporary preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result && setTempPreviews) {
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

// Add gallery image to upload queue
export const handleGalleryImageUpload = (
  index: number, 
  file: File,
  pendingGalleryImages: string[],
  callbacks: UploadCallbacks & { 
    setUploadQueue: (fn: (queue: any[]) => any[]) => void 
  }
) => {
  const { setPendingGalleryImages, setCropSettings, setGalleryTempPreviews, setUploadQueue } = callbacks
  
  // Generate the filename immediately
  const timestamp = Date.now()
  const fileName = `gallery-${index}-${timestamp}.jpg`
  const githubPath = `/images/${fileName}`
  
  // Update to use GitHub path immediately
  if (setPendingGalleryImages) {
    const newImages = [...pendingGalleryImages]
    newImages[index] = githubPath
    setPendingGalleryImages(newImages)
  }
  
  // Reset crop settings for the new image (full image, no crop)
  setCropSettings(prev => ({
    ...prev,
    [githubPath]: { scale: 1, x: 50, y: 50 }
  }))
  
  // Create a temporary preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result && setGalleryTempPreviews) {
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