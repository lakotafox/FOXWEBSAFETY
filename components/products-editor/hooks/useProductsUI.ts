'use client'

import { useState, useRef, useEffect } from 'react'

export function useProductsUI() {
  const [saveMessage, setSaveMessage] = useState("")
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showPublishLoadingOverlay, setShowPublishLoadingOverlay] = useState(false)
  const [publishMessage, setPublishMessage] = useState("")
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if coming from main page editor to show welcome message
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fromCarrie = sessionStorage.getItem('foxbuilt-authenticated')
      if (fromCarrie === 'true') {
        sessionStorage.removeItem('foxbuilt-authenticated')
        setShowWelcomeMessage(true)
      }
    }
  }, [])

  // Show save message with auto-clear
  const showSaveMessage = (message: string, duration: number = 3000) => {
    setSaveMessage(message)
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    messageTimeoutRef.current = setTimeout(() => {
      setSaveMessage("")
    }, duration)
  }

  return {
    saveMessage,
    setSaveMessage,
    showPublishConfirm,
    setShowPublishConfirm,
    showHelp,
    setShowHelp,
    showPublishLoadingOverlay,
    setShowPublishLoadingOverlay,
    publishMessage,
    setPublishMessage,
    showWelcomeMessage,
    setShowWelcomeMessage,
    editingId,
    setEditingId,
    isAuthenticated,
    setIsAuthenticated,
    showSaveMessage
  }
}