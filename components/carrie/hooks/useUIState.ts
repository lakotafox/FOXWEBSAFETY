'use client'

import { useState, useRef } from 'react'

export const useUIState = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showAddress, setShowAddress] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [isEditMode, setIsEditMode] = useState(true)
  const [showGalleryEditor, setShowGalleryEditor] = useState(false)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [expandedSpecs, setExpandedSpecs] = useState<number | null>(null)
  const [showSpecsModal, setShowSpecsModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showHelp, setShowHelp] = useState(false)
  
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showMessage = (message: string, duration: number = 3000) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    
    setSaveMessage(message)
    
    messageTimeoutRef.current = setTimeout(() => {
      setSaveMessage("")
      messageTimeoutRef.current = null
    }, duration)
  }

  return {
    isScrolled,
    setIsScrolled,
    currentSlide,
    setCurrentSlide,
    showAddress,
    setShowAddress,
    saveMessage,
    showMessage,
    isEditMode,
    setIsEditMode,
    showGalleryEditor,
    setShowGalleryEditor,
    showPublishConfirm,
    setShowPublishConfirm,
    expandedSpecs,
    setExpandedSpecs,
    showSpecsModal,
    setShowSpecsModal,
    selectedProduct,
    setSelectedProduct,
    showHelp,
    setShowHelp
  }
}