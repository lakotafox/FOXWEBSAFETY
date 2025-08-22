'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { Search, Info, X } from 'lucide-react'
import FullImageModal from '@/components/ui/FullImageModal'

interface FlyingPostersProps {
  items: string[]
  height?: string
  initialIndex?: number
  onFullImageToggle?: (isOpen: boolean) => void
  onInfoClick?: (index: number) => void
  productIds?: string[]
  products?: any[]
  category?: string
}

export default function FlyingPosters({ 
  items, 
  height = '600px',
  initialIndex = 0,
  onFullImageToggle,
  onInfoClick,
  productIds,
  products,
  category
}: FlyingPostersProps) {
  const [currentPosition, setCurrentPosition] = useState(initialIndex) // Start at the clicked image
  const [mobileFocalIndex, setMobileFocalIndex] = useState(initialIndex) // Track focal image for mobile - start at initialIndex
  const [isDragging, setIsDragging] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
  const [fullImageSrc, setFullImageSrc] = useState('')
  const [clickedIndex, setClickedIndex] = useState<number | null>(null) // Track which image was clicked
  const [showHelpText, setShowHelpText] = useState(false) // Don't show help text, show buttons immediately
  const [showPortraitMessage, setShowPortraitMessage] = useState(false) // Show portrait lock message
  const [hasSeenPortraitMessage, setHasSeenPortraitMessage] = useState(false) // Track if user has seen message
  const portraitTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Track portrait message timeout
  const [showSwipeText, setShowSwipeText] = useState(true) // Show swipe text initially
  const [imageOrientations, setImageOrientations] = useState<('horizontal' | 'vertical' | 'unknown')[]>([]) // Track image orientations
  const [isMobileDevice, setIsMobileDevice] = useState(() => {
    // Initialize with actual mobile state if window is available
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    return false
  }) // Track if mobile
  const containerRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const startPositionRef = useRef<number>(0)
  const velocityRef = useRef<number>(0)
  const lastXRef = useRef<number>(0)
  const animationRef = useRef<number | null>(null)

  // No auto-rotation - removed per user request
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Detect image orientations
  useEffect(() => {
    const orientations: ('horizontal' | 'vertical' | 'unknown')[] = []
    let loadedCount = 0
    
    items.forEach((src, index) => {
      const img = new window.Image()
      img.onload = () => {
        orientations[index] = img.width > img.height ? 'horizontal' : 'vertical'
        loadedCount++
        if (loadedCount === items.length) {
          setImageOrientations([...orientations])
        }
      }
      img.onerror = () => {
        orientations[index] = 'unknown'
        loadedCount++
        if (loadedCount === items.length) {
          setImageOrientations([...orientations])
        }
      }
      img.src = src
    })
  }, [items])
  
  // No longer need to fade help text since we're not showing it
  // Buttons show immediately
  
  // Hide swipe text after 5 seconds
  useEffect(() => {
    if (!showSwipeText) return
    
    const timer = setTimeout(() => {
      setShowSwipeText(false)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [showSwipeText])

  // Touch/Mouse handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Only allow drag on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    if (!isMobile && !('touches' in e)) {
      return // Disable mouse drag on desktop
    }
    
    // Prevent default to stop page scroll
    if ('touches' in e) {
      e.preventDefault()
    }
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    startXRef.current = clientX
    lastXRef.current = clientX
    startPositionRef.current = currentPosition
    velocityRef.current = 0
    setIsDragging(true)
    setUserInteracted(true)
    setShowHelpText(false) // Hide help text on interaction
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault() // Prevent scrolling while dragging
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const deltaX = clientX - startXRef.current
    
    // Calculate velocity for momentum
    velocityRef.current = clientX - lastXRef.current
    lastXRef.current = clientX
    
    // Convert pixel movement to position change
    // Adjust sensitivity based on screen size
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const sensitivity = isMobile ? 200 : 600 // Much higher sensitivity for desktop (slower movement)
    
    const positionDelta = -deltaX / sensitivity
    const newPosition = startPositionRef.current + positionDelta
    setCurrentPosition(newPosition)
    
    // Update mobile focal index based on distance threshold
    if (isMobile) {
      // Find the nearest image index
      const normalizedPosition = ((newPosition % items.length) + items.length) % items.length
      const nearestIndex = Math.round(normalizedPosition) % items.length
      
      // Calculate distance from current focal to nearest
      const currentFocal = mobileFocalIndex % items.length
      let diff = nearestIndex - currentFocal
      
      // Handle wrapping
      if (diff > items.length / 2) diff -= items.length
      if (diff < -items.length / 2) diff += items.length
      
      // Only switch if we've moved past halfway point (0.5 threshold)
      const distanceFromFocal = Math.abs(normalizedPosition - mobileFocalIndex)
      if (distanceFromFocal > 0.5 && Math.abs(diff) >= 1) {
        setMobileFocalIndex(nearestIndex)
      }
    }
  }

  const handleDragEnd = (e?: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    
    // Prevent default to stop any momentum scrolling
    if (e && ('touches' in e || 'changedTouches' in e)) {
      e.preventDefault()
    }
    
    setIsDragging(false)
    
    // For mobile: don't snap, just stay where released
    // For desktop: snap to nearest with smooth animation
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    if (!isMobile) {
      const targetPosition = Math.round(currentPosition)
      // Animate snap slowly on desktop
      gsap.to({ val: currentPosition }, {
        val: targetPosition,
        duration: 0.5, // Half second snap animation
        ease: "power2.inOut",
        onUpdate: function() {
          setCurrentPosition(this.targets()[0].val)
        }
      })
    }
    // Mobile: position stays exactly where user left it
  }

  const getTransform = (index: number) => {
    // Calculate position relative to current position
    // This creates a continuous carousel effect
    const rawDiff = index - currentPosition
    let diff = rawDiff
    
    // Handle wrapping for infinite carousel with smooth transitions
    while (diff > items.length / 2) diff -= items.length
    while (diff < -items.length / 2) diff += items.length
    
    // Check if mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    
    // Smooth position-based transforms with arc effect
    const spacing = isMobile ? 50 : 350  // Tighter spacing on mobile for smaller images
    const baseX = diff * spacing
    const z = Math.abs(diff) < 0.5 ? 100 : -Math.abs(diff) * 150
    const rotateY = diff * -15
    const scale = 1 // No scaling/zooming
    // Full opacity for all images
    const opacity = 1
    
    // Create arc effect - stronger arc on mobile for half circle
    const arcHeight = Math.abs(diff) * (isMobile ? 150 : 120) // Much higher arc on mobile
    const baseY = -arcHeight // Negative to move up
    
    // Determine sizes based on proximity to center - smooth interpolation on mobile
    const proximity = Math.max(0, 1 - Math.abs(diff))
    
    let width, height
    if (isMobile) {
      // Mobile: Smooth progressive shrinking based on distance from focal
      const proximity = Math.max(0, 1 - Math.abs(diff))
      
      // Even more extreme size difference for mobile
      const minWidth = 10   // vw - extremely small for far images
      const maxWidth = 85   // vw - large for focal image
      const minHeight = 6   // vh - extremely small for far images
      const maxHeight = 45  // vh - large for focal
      
      // Use exponential curve for more dramatic size changes
      const sizeMultiplier = Math.pow(proximity, 2) // Squared for more dramatic falloff
      
      // Smooth interpolation with progressive shrinking
      const widthValue = minWidth + (maxWidth - minWidth) * sizeMultiplier
      const heightValue = minHeight + (maxHeight - minHeight) * sizeMultiplier
      
      width = `${widthValue}vw`
      height = `${heightValue}vh`
    } else {
      // Desktop: Full height focus, limited width (portrait-optimized)
      const mainWidth = '600px'  // Limited width
      const mainHeight = '90vh'  // Nearly full height for focal image
      const sideWidth = '450px'
      const sideHeight = '70vh'
      
      width = Math.abs(diff) < 0.5 ? mainWidth : sideWidth
      height = Math.abs(diff) < 0.5 ? mainHeight : sideHeight
    }
    let marginLeft, marginTop
    if (isMobile) {
      // Mobile: Smooth margin interpolation
      const widthValue = parseFloat(width)
      const heightValue = parseFloat(height)
      marginLeft = `-${widthValue / 2}vw`
      marginTop = `-${heightValue / 2}vh`
    } else {
      // Desktop: Keep discrete margins (adjusted for new sizes)
      marginLeft = Math.abs(diff) < 0.5 ? '-300px' : '-225px'
      marginTop = Math.abs(diff) < 0.5 ? '-45vh' : '-35vh'
    }
    
    // No special handling for wrapping - all items use same timing
    const transitionDuration = '0s'  // No CSS transition, we're using JS animation
    const transitionTimingFunction = 'none'
    
    return {
      transform: `translateX(${baseX}px) translateY(${baseY}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex: Math.round(100 - Math.abs(diff) * 10),
      transition: isDragging ? 'none' : 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1), height 1.2s cubic-bezier(0.4, 0, 0.2, 1), margin-left 1.2s cubic-bezier(0.4, 0, 0.2, 1), margin-top 1.2s cubic-bezier(0.4, 0, 0.2, 1)',  // Smooth size transitions
      width,
      height,
      marginLeft,
      marginTop
    }
  }

  const handleCardClick = (index: number) => {
    if (isDragging) return
    
    // Hide help text on interaction
    setShowHelpText(false)
    
    // Check if this is the focal image (center)
    let diff = index - currentPosition
    while (diff > items.length / 2) diff -= items.length
    while (diff < -items.length / 2) diff += items.length
    
    // If this is the focal image - do nothing (no click to enlarge)
    if (Math.abs(diff) < 0.1) {
      return
    }
    
    // Not focal - navigate to it via shortest path
    // Calculate the difference
    let rawDiff = index - currentPosition
    
    // Normalize to find shortest path
    while (rawDiff > items.length / 2) rawDiff -= items.length
    while (rawDiff < -items.length / 2) rawDiff += items.length
    
    // Target position is current + shortest path
    const targetPosition = currentPosition + rawDiff
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    // Immediately update the focal image
    if (!isMobileDevice) {
      // Desktop: mark as clicked to update lighting
      setClickedIndex(index)
    } else {
      // Mobile: update focal index immediately
      setMobileFocalIndex(index)
    }
    
    const startPosition = currentPosition
    const startTime = Date.now()
    // Calculate duration based on distance for constant perceived speed
    const distance = Math.abs(targetPosition - startPosition)
    const isDeviceMobile = typeof window !== 'undefined' && window.innerWidth < 768
    // Fixed duration per item for consistent speed
    const durationPerItem = isDeviceMobile ? 200 : 800 // 800ms per item on desktop
    const duration = distance * durationPerItem
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Use linear easing for consistent speed (no acceleration/deceleration)
      const eased = progress
      
      const newPosition = startPosition + (targetPosition - startPosition) * eased
      setCurrentPosition(newPosition)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete, clear clicked index
        setClickedIndex(null)
      }
    }
    animate()
  }

  return (
    <>
    <div 
      ref={containerRef}
      className="relative w-full select-none touch-none"
      style={{ 
        height, 
        perspective: '1200px', 
        cursor: 'default',
        overflow: 'visible', // Allow images to extend beyond container
        display: showFullImage ? 'none' : 'block', // Hide carousel when showing full image
        touchAction: 'none', // Prevent all touch scrolling
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <div className="absolute inset-0 flex items-center justify-center" style={{ overflow: 'visible' }}>
        <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d', overflow: 'visible' }}>
          {items.map((item, index) => {
            const style = getTransform(index)
            
            // Calculate if this is the focused image
            let diff = index - currentPosition
            while (diff > items.length / 2) diff -= items.length
            while (diff < -items.length / 2) diff += items.length
            const isFocused = Math.abs(diff) < 0.1  // Tighter threshold for focal detection
            
            // Determine if image should be lit based on platform
            let shouldBeLit = false
            if (isMobileDevice) {
              // On mobile, use the focal index with distance threshold
              shouldBeLit = index === mobileFocalIndex
            } else {
              // On desktop, if an image is clicked, it should be lit immediately
              shouldBeLit = clickedIndex !== null ? index === clickedIndex : isFocused
            }
            
            return (
              <div
                key={index}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: style.transform,
                  opacity: style.opacity,
                  zIndex: style.zIndex,
                  transition: style.transition,
                  width: style.width,
                  height: style.height,
                  marginLeft: style.marginLeft,
                  marginTop: style.marginTop,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => handleCardClick(index)}
              >
                <Image
                  src={item}
                  alt={`Gallery item ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 450px"
                  unoptimized
                  priority={Math.abs(style.zIndex - 100) < 10}
                  onError={(e) => {
                    console.error('Image failed to load:', item)
                  }}
                  style={{
                    opacity: (!isMobileDevice && !shouldBeLit) ? 0.3 : 1,
                    filter: (!isMobileDevice && !shouldBeLit) ? 'brightness(0.4)' : 'none'
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Help text and controls */}
      <div className="fixed md:bottom-8 bottom-4 left-0 right-0 text-center z-50 pointer-events-none">
        {!showHelpText && (
          <>
            {/* Desktop buttons - same as mobile */}
            <div className="hidden md:flex flex-col items-center justify-center gap-2 pointer-events-auto">
              <button
                onClick={() => {
                  // Find the current focal image and open it
                  const focalIndex = Math.round(currentPosition) % items.length
                  const normalizedIndex = focalIndex < 0 ? focalIndex + items.length : focalIndex
                  setFullImageSrc(items[normalizedIndex])
                  setShowFullImage(true)
                  onFullImageToggle?.(true)
                }}
                className="inline-flex items-center justify-center text-white text-base bg-black/50 hover:bg-black/70 px-4 py-3 rounded-full transition-all gap-2"
                aria-label="Zoom focal image"
                title="Zoom focal image"
              >
                <Search className="w-5 h-5" />
                <span className="text-sm">Zoom</span>
              </button>
              {onInfoClick && (
                <button
                  onClick={() => {
                    // Get current focal image index
                    const focalIndex = Math.round(currentPosition) % items.length
                    const normalizedIndex = focalIndex < 0 ? focalIndex + items.length : focalIndex
                    
                    // Call the info click handler if provided
                    onInfoClick(normalizedIndex)
                  }}
                  className="inline-flex items-center justify-center text-white text-base bg-black/50 hover:bg-black/70 px-4 py-3 rounded-full transition-all gap-2"
                  aria-label="Show information"
                  title="Show information"
                >
                  <Info className="w-5 h-5" />
                  <span className="text-sm">Info</span>
                </button>
              )}
            </div>
            {/* Mobile buttons */}
            <div className="md:hidden flex flex-row items-center justify-between w-full px-4 pointer-events-auto" 
                 onTouchStart={(e) => e.stopPropagation()}
                 onTouchMove={(e) => e.stopPropagation()}
                 onTouchEnd={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const focalIndex = Math.round(currentPosition) % items.length
                  const normalizedIndex = focalIndex < 0 ? focalIndex + items.length : focalIndex
                  const isHorizontal = imageOrientations[normalizedIndex] === 'horizontal'
                  
                  // Show portrait message on first enlarge click for horizontal images on mobile
                  if (!hasSeenPortraitMessage && isMobileDevice && isHorizontal) {
                    setShowPortraitMessage(true)
                    setHasSeenPortraitMessage(true)
                    portraitTimeoutRef.current = setTimeout(() => {
                      setShowPortraitMessage(false)
                      // Auto zoom after message clears
                      setFullImageSrc(items[normalizedIndex])
                      setShowFullImage(true)
                      onFullImageToggle?.(true)
                    }, 3000)
                  } else {
                    // Find the current focal image and open it
                    setFullImageSrc(items[normalizedIndex])
                    setShowFullImage(true)
                    onFullImageToggle?.(true)
                  }
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation()
                }}
                className="inline-flex items-center justify-center text-white text-base bg-black/50 active:bg-black/70 px-4 py-3 rounded-full transition-all gap-2 z-50"
                aria-label="Zoom focal image"
                title="Zoom focal image"
              >
                <Search className="w-5 h-5" />
                <span className="text-sm">Zoom</span>
              </button>
              {onInfoClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Get current focal image index
                    const focalIndex = Math.round(currentPosition) % items.length
                    const normalizedIndex = focalIndex < 0 ? focalIndex + items.length : focalIndex
                    
                    // Call the info click handler
                    onInfoClick(normalizedIndex)
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation()
                    // Get current focal image index
                    const focalIndex = Math.round(currentPosition) % items.length
                    const normalizedIndex = focalIndex < 0 ? focalIndex + items.length : focalIndex
                    
                    // Call the info click handler
                    onInfoClick(normalizedIndex)
                  }}
                  className="inline-flex items-center justify-center text-white text-base bg-black/50 active:bg-black/70 px-4 py-3 rounded-full transition-all gap-2 z-50"
                  aria-label="Show information"
                  title="Show information"
                >
                  <Info className="w-5 h-5" />
                  <span className="text-sm">Info</span>
                </button>
              )}
              {/* Empty div to maintain spacing when no info button */}
              {!onInfoClick && <div />}
            </div>
            {/* Swipe for more text - mobile only, shows with buttons */}
            {showSwipeText && (
              <div className="md:hidden fixed bottom-4 left-0 right-0 text-center text-white/70 text-sm pointer-events-none">
                <p>Swipe for more</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    
    {/* Portrait mode message window */}
    {showPortraitMessage && isMobileDevice && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
        <div className="bg-slate-800 text-white px-6 py-4 rounded-lg text-center max-w-xs mx-4 relative">
          <button
            onClick={() => {
              // Clear the timeout to prevent double zoom
              if (portraitTimeoutRef.current) {
                clearTimeout(portraitTimeoutRef.current)
                portraitTimeoutRef.current = null
              }
              setShowPortraitMessage(false)
              // Still auto zoom after closing early
              const focalIndex = Math.round(currentPosition) % items.length
              const normalizedIndex = focalIndex < 0 ? focalIndex + items.length : focalIndex
              setFullImageSrc(items[normalizedIndex])
              setShowFullImage(true)
              onFullImageToggle?.(true)
            }}
            className="absolute top-2 right-2 text-white/70 hover:text-white"
            aria-label="Close message"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-base font-medium mb-2">📱 Portrait Mode</p>
          <p className="text-sm">Lock portrait mode before zooming for best experience</p>
        </div>
      </div>
    )}
    
    {/* Full Image Modal - Outside carousel container so it's not hidden */}
    <FullImageModal 
      isOpen={showFullImage}
      onClose={() => {
        setShowFullImage(false)
        onFullImageToggle?.(false)
      }}
      imageSrc={fullImageSrc}
      imageAlt="Full size image"
      showReturnText={!isMobileDevice}
    />
    </>
  )
}