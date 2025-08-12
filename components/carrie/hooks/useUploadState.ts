'use client'

import { useState } from 'react'
import { CONSTRUCTION_MESSAGES } from '@/components/carrie/constants/editor-constants'

interface UploadQueueItem {
  type: 'product' | 'gallery'
  file: File
  category?: string
  productId?: number
  index?: number
  fileName?: string
}

export const useUploadState = () => {
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [activeUploads, setActiveUploads] = useState(0)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const [showPublishLoadingOverlay, setShowPublishLoadingOverlay] = useState(false)
  const [publishMessage, setPublishMessage] = useState("")

  const getRandomConstructionMessage = () => {
    return CONSTRUCTION_MESSAGES[Math.floor(Math.random() * CONSTRUCTION_MESSAGES.length)]
  }

  return {
    uploadQueue,
    setUploadQueue,
    isUploading,
    setIsUploading,
    activeUploads,
    setActiveUploads,
    showLoadingOverlay,
    setShowLoadingOverlay,
    loadingStartTime,
    setLoadingStartTime,
    showPublishLoadingOverlay,
    setShowPublishLoadingOverlay,
    publishMessage,
    setPublishMessage,
    getRandomConstructionMessage
  }
}