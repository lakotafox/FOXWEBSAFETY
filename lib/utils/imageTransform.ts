// Type for crop settings
interface CropSettings {
  scale: number
  x: number
  y: number
}

type CropSettingsMap = {
  [imageKey: string]: CropSettings
}

// Get crop settings with defaults
export function getCropSettings(imageKey: string, cropSettings: CropSettingsMap): CropSettings {
  return cropSettings[imageKey] || { scale: 1, x: 50, y: 50 }
}

// Generate CSS transform for image positioning
export function getImageTransform(imageKey: string, cropSettings: CropSettingsMap): string {
  const crop = getCropSettings(imageKey, cropSettings)
  return `translate(${crop.x - 50}%, ${crop.y - 50}%) scale(${crop.scale})`
}