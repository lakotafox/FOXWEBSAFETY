// Cloudinary configuration
// These will be stored in localStorage for user configuration
export const getCloudinaryConfig = () => {
  // Only access localStorage on client side
  if (typeof window !== 'undefined') {
    const savedConfig = localStorage.getItem('cloudinary-config')
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig)
      } catch (e) {
        console.error('Error parsing cloudinary config:', e)
      }
    }
  }
  
  // Fallback to environment variables or defaults
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''
  }
}

export const saveCloudinaryConfig = (cloudName: string, uploadPreset: string) => {
  const config = { cloudName, uploadPreset }
  localStorage.setItem('cloudinary-config', JSON.stringify(config))
  return config
}