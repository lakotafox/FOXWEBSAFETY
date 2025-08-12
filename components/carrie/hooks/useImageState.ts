'use client'

import { useState } from 'react'

export const useImageState = () => {
  const [tempPreviews, setTempPreviews] = useState<{[key: string]: string}>({})
  const [cropSettings, setCropSettings] = useState<{[key: string]: {scale: number, x: number, y: number}}>({})
  const [editingCrop, setEditingCrop] = useState<string | null>(null)

  const getImageUrl = (imagePath: string, tempPreviewsMap: {[key: string]: string}) => {
    if (!imagePath) return "/placeholder.svg"
    
    if (tempPreviewsMap[imagePath]) {
      return tempPreviewsMap[imagePath]
    }
    
    if (imagePath.startsWith('/images/')) {
      const fileName = imagePath.replace('/images/', '')
      return `https://raw.githubusercontent.com/lakotafox/FOXSITE/main/public/images/${fileName}`
    }
    
    return imagePath
  }

  return {
    tempPreviews,
    setTempPreviews,
    cropSettings,
    setCropSettings,
    editingCrop,
    setEditingCrop,
    getImageUrl
  }
}