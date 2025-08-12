'use client'

import { useState } from 'react'

export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPageSelection, setShowPageSelection] = useState(false)
  const [password, setPassword] = useState("")
  const [showPasswordScreen, setShowPasswordScreen] = useState(false)

  return {
    isAuthenticated,
    setIsAuthenticated,
    showPageSelection,
    setShowPageSelection,
    password,
    setPassword,
    showPasswordScreen,
    setShowPasswordScreen
  }
}