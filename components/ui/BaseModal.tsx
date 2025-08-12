'use client'

import { useEffect } from 'react'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  zIndex?: number
  backdropClassName?: string
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

export default function BaseModal({
  isOpen,
  onClose,
  children,
  className = '',
  zIndex = 50,
  backdropClassName = '',
  closeOnBackdrop = true,
  closeOnEscape = true
}: BaseModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, closeOnEscape])
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 ${backdropClassName}`}
      style={{ zIndex }}
      onClick={closeOnBackdrop ? onClose : undefined}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}