'use client'

import { useState } from 'react'
import { DEFAULT_GALLERY_IMAGES } from '@/components/carrie/constants/editor-constants'

export const useGalleryState = () => {
  const [galleryImages, setGalleryImages] = useState(DEFAULT_GALLERY_IMAGES)
  const [pendingGalleryImages, setPendingGalleryImages] = useState(DEFAULT_GALLERY_IMAGES)
  const [isGalleryUserControlled, setIsGalleryUserControlled] = useState(false)
  const [galleryTempPreviews, setGalleryTempPreviews] = useState<{[key: string]: string}>({})

  // For backward compatibility, map mobile functions to regular gallery
  return {
    galleryImages,
    setGalleryImages,
    pendingGalleryImages,
    setPendingGalleryImages,
    // Map mobile to same as desktop for backward compatibility
    mobileGalleryImages: galleryImages,
    setMobileGalleryImages: setGalleryImages,
    pendingMobileGalleryImages: pendingGalleryImages,
    setPendingMobileGalleryImages: setPendingGalleryImages,
    galleryViewMode: 'desktop' as const,
    setGalleryViewMode: () => {}, // No-op since we only have one gallery now
    isGalleryUserControlled,
    setIsGalleryUserControlled,
    galleryTempPreviews,
    setGalleryTempPreviews
  }
}