// Cloudinary configuration - hard-coded for FOXBUILT
export const getCloudinaryConfig = () => {
  // Hard-coded configuration for immediate use
  return {
    cloudName: 'dltlrgaay',
    uploadPreset: 'foxbuilt-uploads'
  }
}

export const saveCloudinaryConfig = (cloudName: string, uploadPreset: string) => {
  const config = { cloudName, uploadPreset }
  localStorage.setItem('cloudinary-config', JSON.stringify(config))
  return config
}