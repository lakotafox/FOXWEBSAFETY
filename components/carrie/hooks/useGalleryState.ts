'use client'

import { useState } from 'react'
import { DEFAULT_GALLERY_IMAGES, DEFAULT_MOBILE_GALLERY_IMAGES } from '@/components/carrie/constants/editor-constants'

export const useGalleryState = () => {
  const [galleryImages, setGalleryImages] = useState(DEFAULT_GALLERY_IMAGES)
  const [pendingGalleryImages, setPendingGalleryImages] = useState(DEFAULT_GALLERY_IMAGES)
  const [mobileGalleryImages, setMobileGalleryImages] = useState(DEFAULT_MOBILE_GALLERY_IMAGES)
  const [pendingMobileGalleryImages, setPendingMobileGalleryImages] = useState(DEFAULT_MOBILE_GALLERY_IMAGES)
  const [galleryViewMode, setGalleryViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [isGalleryUserControlled, setIsGalleryUserControlled] = useState(false)
  const [galleryTempPreviews, setGalleryTempPreviews] = useState<{[key: string]: string}>({})

  return {
    galleryImages,
    setGalleryImages,
    pendingGalleryImages,
    setPendingGalleryImages,
    mobileGalleryImages,
    setMobileGalleryImages,
    pendingMobileGalleryImages,
    setPendingMobileGalleryImages,
    galleryViewMode,
    setGalleryViewMode,
    isGalleryUserControlled,
    setIsGalleryUserControlled,
    galleryTempPreviews,
    setGalleryTempPreviews
  }
}