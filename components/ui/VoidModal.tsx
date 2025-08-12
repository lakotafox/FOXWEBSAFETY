'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface VoidModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  zIndex?: number
  backdropClassName?: string
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showParticles?: boolean
}

export default function VoidModal({
  isOpen,
  onClose,
  children,
  className = '',
  zIndex = 50,
  backdropClassName = '',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showParticles = true
}: VoidModalProps) {
  const particlesRef = useRef<HTMLDivElement>(null)
  
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
  
  // Create floating particles
  useEffect(() => {
    if (!isOpen || !showParticles || !particlesRef.current) return
    
    const container = particlesRef.current
    const particles: HTMLDivElement[] = []
    
    // Create 12 particles scattered throughout void
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle-star'
      
      // Random initial position
      const startX = Math.random() * window.innerWidth
      const startY = Math.random() * window.innerHeight
      
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: white;
        border-radius: 50%;
        pointer-events: none;
        left: ${startX}px;
        top: ${startY}px;
        z-index: ${zIndex - 1};
        box-shadow: 0 0 8px rgba(255, 255, 255, 1), 0 0 15px rgba(255, 255, 255, 0.5);
      `
      
      container.appendChild(particle)
      particles.push(particle)
      
      // Animate the particle floating
      const duration = 15 + Math.random() * 10 // 15-25 seconds
      const xMove = (Math.random() - 0.5) * 200 // -100 to 100px horizontal movement
      const yMove = -100 - Math.random() * 100 // -100 to -200px upward movement
      
      gsap.timeline({ repeat: -1 })
        .to(particle, {
          x: xMove,
          y: yMove,
          opacity: 0.3 + Math.random() * 0.7,
          duration: duration,
          ease: "none"
        })
        .to(particle, {
          x: xMove * 2,
          y: yMove * 2,
          opacity: 0,
          duration: duration,
          ease: "none"
        })
        .set(particle, {
          x: 0,
          y: 0,
          opacity: 1,
          left: Math.random() * window.innerWidth,
          top: window.innerHeight + 20
        })
    }
    
    // Cleanup
    return () => {
      particles.forEach(particle => {
        gsap.killTweensOf(particle)
        particle.remove()
      })
    }
  }, [isOpen, showParticles, zIndex])
  
  if (!isOpen) return null
  
  return (
    <>
      {/* Particles container */}
      <div ref={particlesRef} />
      
      {/* Modal backdrop and content */}
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
    </>
  )
}