"use client"

import React from 'react'
import PasswordScreen from '@/components/carrie/auth/PasswordScreen'
import PageSelector from '@/components/carrie/ui/PageSelector'
import InitialPrompt from '@/components/carrie/ui/InitialPrompt'

interface AuthenticationWrapperProps {
  isAuthenticated: boolean
  showPageSelection: boolean
  showPasswordScreen: boolean
  password: string
  setIsAuthenticated: (value: boolean) => void
  setShowPageSelection: (value: boolean) => void
  setShowPasswordScreen: (value: boolean) => void
  setPassword: (value: string) => void
  children: React.ReactNode
}

export default function AuthenticationWrapper({
  isAuthenticated,
  showPageSelection,
  showPasswordScreen,
  password,
  setIsAuthenticated,
  setShowPageSelection,
  setShowPasswordScreen,
  setPassword,
  children
}: AuthenticationWrapperProps) {
  
  // If not authenticated, show authentication flow
  if (!isAuthenticated) {
    // Show page selection after successful password
    if (showPageSelection) {
      return (
        <PageSelector 
          onSelectMainPage={() => setIsAuthenticated(true)}
          onSelectProductsPage={() => {
            sessionStorage.setItem('foxbuilt-authenticated', 'true')
            window.location.href = '/products-editor'
          }}
          onBack={() => {
            setShowPageSelection(false)
            setPassword("")
          }}
        />
      )
    }
    
    if (!showPasswordScreen) {
      return <InitialPrompt onShowPassword={() => setShowPasswordScreen(true)} />
    }

    // Password screen
    return <PasswordScreen onAuthenticate={() => setShowPageSelection(true)} />
  }

  // If authenticated, render children (main editor content)
  return <>{children}</>
}