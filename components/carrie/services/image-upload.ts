import { getCloudinaryConfig } from '@/lib/cloudinary-config'

interface UploadCallbacks {
  showMessage: (message: string, duration?: number) => void
  setActiveUploads: (fn: (count: number) => number) => void
  updateProduct?: (category: string, productId: number, field: string, value: any) => void
  setPendingGalleryImages?: (images: string[]) => void
  setCropSettings: (fn: (prev: any) => any) => void
  setTempPreviews?: (fn: (prev: any) => any) => void
  setGalleryTempPreviews?: (fn: (prev: any) => any) => void
  setUploadQueue: (fn: (queue: any[]) => any[]) => void
}

interface UploadQueueItem {
  category?: string
  productId: number
  file: File
  fileName: string
  isGallery?: boolean
  index?: number
}

// Process product image upload to Cloudinary
export const processProductImageUpload = async (
  category: string, 
  productId: number, 
  file: File, 
  fileName: string,
  callbacks: UploadCallbacks & {
    onUploadComplete?: (category: string, productId: number, cloudinaryUrl: string) => void
  }
) => {
  const { showMessage, setActiveUploads, onUploadComplete } = callbacks
  
  setActiveUploads(count => count + 1)
  showMessage("📤 Uploading image to Cloudinary...")
  
  const uploadTimeout = setTimeout(() => {
    console.error('Upload timeout after 60 seconds')
    showMessage("❌ Upload timeout - please try again", 5000)
    setActiveUploads(count => count - 1)
  }, 60000)
  
  try {
    // Get Cloudinary config
    const config = getCloudinaryConfig()
    
    if (!config.cloudName || !config.uploadPreset) {
      showMessage("❌ Please configure Cloudinary settings first", 5000)
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
      showMessage("✅ Image uploaded to Cloudinary!", 3000)
      
      // Call the callback to update the product with the Cloudinary URL
      if (onUploadComplete) {
        onUploadComplete(category, productId, result.secure_url)
      }
      
      // Return the Cloudinary URL
      return result.secure_url
    } else {
      const errorText = await response.text()
      console.error('Cloudinary upload failed:', errorText)
      showMessage("❌ Upload failed", 5000)
    }
  } catch (error) {
    console.error('Upload error:', error)
    showMessage("❌ Error uploading image", 3000)
    clearTimeout(uploadTimeout)
  } finally {
    setActiveUploads(count => count - 1)
  }
  
  return null
}

// Process gallery image upload to Cloudinary
export const processGalleryImageUpload = async (
  index: number, 
  file: File, 
  fileName: string,
  callbacks: UploadCallbacks & {
    onUploadComplete?: (index: number, cloudinaryUrl: string) => void
  }
) => {
  const { showMessage, setActiveUploads, onUploadComplete } = callbacks
  
  setActiveUploads(count => count + 1)
  showMessage("📤 Uploading gallery image to Cloudinary...")
  
  const uploadTimeout = setTimeout(() => {
    showMessage("❌ Upload timeout - please try again", 5000)
    setActiveUploads(count => count - 1)
  }, 60000)
  
  try {
    const config = getCloudinaryConfig()
    
    if (!config.cloudName || !config.uploadPreset) {
      showMessage("❌ Please configure Cloudinary settings first", 5000)
      clearTimeout(uploadTimeout)
      setActiveUploads(count => count - 1)
      return null
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', config.uploadPreset)
    
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
      console.log('Gallery upload successful:', result.secure_url)
      showMessage("✅ Gallery image uploaded!", 3000)
      
      if (onUploadComplete) {
        onUploadComplete(index, result.secure_url)
      }
      
      return result.secure_url
    } else {
      console.error('Gallery upload failed')
      showMessage("❌ Upload failed", 5000)
    }
  } catch (error) {
    console.error('Gallery upload error:', error)
    showMessage("❌ Error uploading image", 3000)
    clearTimeout(uploadTimeout)
  } finally {
    setActiveUploads(count => count - 1)
  }
  
  return null
}

// Handle image upload - matches products editor pattern
export const handleImageUpload = (
  category: string, 
  productId: number, 
  file: File,
  callbacks: UploadCallbacks
) => {
  const { updateProduct, setCropSettings, setTempPreviews, setUploadQueue } = callbacks
  
  // Generate unique filename with timestamp
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `product-${productId}-${timestamp}.${fileExt}`
  
  // Use cloudinary-pending format like products editor
  const pendingPath = `cloudinary-pending-${fileName}`
  
  // Update product with pending path immediately
  if (updateProduct) {
    updateProduct(category, productId, 'image', pendingPath)
  }
  
  // Initialize crop settings for the new image
  setCropSettings(prev => ({
    ...prev,
    [pendingPath]: { scale: 1, x: 50, y: 50 }
  }))
  
  // Create temporary preview immediately
  if (setTempPreviews) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const tempUrl = e.target?.result as string
      setTempPreviews(prev => ({
        ...prev,
        [pendingPath]: tempUrl
      }))
    }
    reader.readAsDataURL(file)
  }
  
  // Add to upload queue
  setUploadQueue(prev => [...prev, { 
    category,
    productId, 
    file, 
    fileName,
    isGallery: false
  }])
  
  return pendingPath
}

// Handle gallery image upload
export const handleGalleryImageUpload = (
  index: number, 
  file: File, 
  currentImages: string[],
  callbacks: UploadCallbacks & {
    setPendingGalleryImages: (images: string[]) => void
  }
) => {
  const { setPendingGalleryImages, setCropSettings, setGalleryTempPreviews, setUploadQueue } = callbacks
  
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `gallery-${index}-${timestamp}.${fileExt}`
  
  const pendingPath = `cloudinary-pending-${fileName}`
  
  // Update gallery images with pending path
  const newImages = [...currentImages]
  newImages[index] = pendingPath
  setPendingGalleryImages(newImages)
  
  // Initialize crop settings
  setCropSettings(prev => ({
    ...prev,
    [pendingPath]: { scale: 1, x: 50, y: 50 }
  }))
  
  // Create temporary preview
  if (setGalleryTempPreviews) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const tempUrl = e.target?.result as string
      setGalleryTempPreviews(prev => ({
        ...prev,
        [pendingPath]: tempUrl
      }))
    }
    reader.readAsDataURL(file)
  }
  
  // Add to upload queue
  setUploadQueue(prev => [...prev, { 
    productId: index,
    file, 
    fileName,
    isGallery: true,
    index
  }])
  
  return pendingPath
}