'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import ImageWithLoader from '@/components/ui/ImageWithLoader'
import './RollingGallery.css'

interface RollingGalleryProps {
  images: string[]
  autoplay?: boolean
  pauseOnHover?: boolean
  onImageClick?: (index: number) => void
  className?: string
}

export default function RollingGallery({ 
  images, 
  autoplay = false, 
  pauseOnHover = false,
  onImageClick,
  className = ''
}: RollingGalleryProps) {
  const [isScreenSizeSm, setIsScreenSizeSm] = useState(false)
  const [showInstruction, setShowInstruction] = useState(false)
  const [imagesReady, setImagesReady] = useState(false)
  const [loadedImagesCount, setLoadedImagesCount] = useState(0)
  const [loadingFrame, setLoadingFrame] = useState(0)
  const [minimumTimePassed, setMinimumTimePassed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const rotationRef = useRef(0)
  const autoplayTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const isDraggingRef = useRef(false)
  const autoplayResumeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Animated loading bar frames
  const frames = [
    '▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁',
    '▂ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁',
    '▃ ▂ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁',
    '▄ ▃ ▂ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁',
    '▅ ▄ ▃ ▂ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁',
    '▆ ▅ ▄ ▃ ▂ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁',
    '▇ ▆ ▅ ▄ ▃ ▂ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁',
    '█ ▇ ▆ ▅ ▄ ▃ ▂ ▁ ▁ ▁ ▁ ▁ ▁ ▁',
    '▇ █ ▇ ▆ ▅ ▄ ▃ ▂ ▁ ▁ ▁ ▁ ▁ ▁',
    '▆ ▇ █ ▇ ▆ ▅ ▄ ▃ ▂ ▁ ▁ ▁ ▁ ▁',
    '▅ ▆ ▇ █ ▇ ▆ ▅ ▄ ▃ ▂ ▁ ▁ ▁ ▁',
    '▄ ▅ ▆ ▇ █ ▇ ▆ ▅ ▄ ▃ ▂ ▁ ▁ ▁',
    '▃ ▄ ▅ ▆ ▇ █ ▇ ▆ ▅ ▄ ▃ ▂ ▁ ▁',
    '▂ ▃ ▄ ▅ ▆ ▇ █ ▇ ▆ ▅ ▄ ▃ ▂ ▁',
    '▁ ▂ ▃ ▄ ▅ ▆ ▇ █ ▇ ▆ ▅ ▄ ▃ ▂',
    '▁ ▁ ▂ ▃ ▄ ▅ ▆ ▇ █ ▇ ▆ ▅ ▄ ▃',
    '▁ ▁ ▁ ▂ ▃ ▄ ▅ ▆ ▇ █ ▇ ▆ ▅ ▄',
    '▁ ▁ ▁ ▁ ▂ ▃ ▄ ▅ ▆ ▇ █ ▇ ▆ ▅',
    '▁ ▁ ▁ ▁ ▁ ▂ ▃ ▄ ▅ ▆ ▇ █ ▇ ▆',
    '▁ ▁ ▁ ▁ ▁ ▁ ▂ ▃ ▄ ▅ ▆ ▇ █ ▇',
    '▁ ▁ ▁ ▁ ▁ ▁ ▁ ▂ ▃ ▄ ▅ ▆ ▇ █',
    '▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▂ ▃ ▄ ▅ ▆ ▇',
    '▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▂ ▃ ▄ ▅ ▆',
    '▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▂ ▃ ▄ ▅',
    '▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▂ ▃ ▄',
    '▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▂ ▃',
    '▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▂',
  ]

  const cylinderWidth = isScreenSizeSm ? 1100 : 1800
  const faceCount = images.length || 1
  const faceWidth = (cylinderWidth / faceCount) * 1.2
  const radius = cylinderWidth / (2 * Math.PI) * 1.5 // Increased radius to prevent overlap
  const anglePerFace = 360 / faceCount

  // Initialize screen size
  useEffect(() => {
    setIsScreenSizeSm(window.innerWidth <= 640)
    
    const handleResize = () => {
      setIsScreenSizeSm(window.innerWidth <= 640)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Reset loaded images count when images change
  useEffect(() => {
    setLoadedImagesCount(0)
    setImagesReady(false)
  }, [images])

  // Show instruction text after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])
  
  // Ensure minimum 2.5 seconds loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumTimePassed(true)
    }, 2500)
    
    return () => clearTimeout(timer)
  }, [])

  // Animate loading frames
  useEffect(() => {
    if (imagesReady) return
    
    const interval = setInterval(() => {
      setLoadingFrame((prev) => (prev + 1) % frames.length)
    }, 50) // Fast animation - 50ms per frame
    
    return () => clearInterval(interval)
  }, [imagesReady, frames.length])
  
  // Set images ready when all images have loaded AND minimum time has passed
  useEffect(() => {
    // Check if all images have loaded AND minimum time has passed
    if (loadedImagesCount === images.length && images.length > 0 && minimumTimePassed) {
      // Add a small delay to ensure transforms are applied
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
      const delay = isMobile ? 300 : 100
      
      const timer = setTimeout(() => {
        setImagesReady(true)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [loadedImagesCount, images.length, minimumTimePassed])

  // Setup draggable (mobile only)
  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return
    
    // Don't enable dragging until images are ready
    if (!imagesReady) return

    // Define startAutoplay function inside the effect
    const startAutoplay = () => {
      if (!trackRef.current || !autoplay) return

      // Kill existing timeline
      if (autoplayTimelineRef.current) {
        autoplayTimelineRef.current.kill()
      }

      // Create new timeline - slow rotation
      autoplayTimelineRef.current = gsap.timeline({ repeat: -1 })
      autoplayTimelineRef.current.to(trackRef.current, {
        rotateY: '-=360',
        duration: 60, // 60 seconds for one full rotation (very slow)
        ease: 'none'
      })
    }

    let startX = 0
    let startY = 0
    let currentRotation = 0
    let isHorizontalSwipe = false
    let hasDecidedDirection = false
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      
      // Get current rotation from GSAP, not from stored value
      // This ensures we start from the actual current position
      if (trackRef.current) {
        const currentTransform = gsap.getProperty(trackRef.current, 'rotateY') as number
        currentRotation = currentTransform || rotationRef.current
        rotationRef.current = currentRotation
      } else {
        currentRotation = rotationRef.current
      }
      
      hasDecidedDirection = false
      isHorizontalSwipe = false
      
      // Kill autoplay immediately when user touches
      if (autoplayTimelineRef.current) {
        autoplayTimelineRef.current.kill()
        autoplayTimelineRef.current = null
      }
      
      // Clear any pending resume timeout
      if (autoplayResumeTimeoutRef.current) {
        clearTimeout(autoplayResumeTimeoutRef.current)
        autoplayResumeTimeoutRef.current = null
      }
      
      // Kill any ongoing animations to prevent jumping
      if (trackRef.current) {
        gsap.killTweensOf(trackRef.current)
      }
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!trackRef.current) return
      
      const touch = e.touches[0]
      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY
      
      // Determine swipe direction on first significant move
      if (!hasDecidedDirection && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        hasDecidedDirection = true
        // If horizontal movement is greater, it's a carousel swipe
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)
        
        if (isHorizontalSwipe) {
          isDraggingRef.current = true
        }
      }
      
      // If it's a horizontal swipe, handle carousel rotation and prevent page scroll
      if (isHorizontalSwipe && isDraggingRef.current) {
        e.preventDefault() // Prevent page scroll only for horizontal swipes
        
        const rotation = currentRotation + (deltaX * 0.15)
        rotationRef.current = rotation
        
        gsap.set(trackRef.current, {
          rotateY: rotation,
          transformStyle: 'preserve-3d'
        })
      }
      // If it's vertical, let the page scroll normally
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDraggingRef.current || !trackRef.current) return
      
      const touch = e.changedTouches[0]
      const finalDeltaX = touch.clientX - startX
      
      isDraggingRef.current = false
      
      // Add momentum/inertia for horizontal swipes
      gsap.to(trackRef.current, {
        rotateY: rotationRef.current + (finalDeltaX * 0.1),
        duration: 0.5,
        ease: 'power2.out'
      })
      
      // Resume autoplay after 750ms on mobile
      if (autoplay) {
        if (autoplayResumeTimeoutRef.current) {
          clearTimeout(autoplayResumeTimeoutRef.current)
        }
        autoplayResumeTimeoutRef.current = setTimeout(() => {
          startAutoplay()
        }, 750)
      }
    }
    
    const element = trackRef.current
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [autoplay, pauseOnHover, isScreenSizeSm, imagesReady])

  // Autoplay functionality
  const startAutoplay = () => {
    if (!trackRef.current || !autoplay || !imagesReady) return

    // Kill existing timeline
    if (autoplayTimelineRef.current) {
      autoplayTimelineRef.current.kill()
    }

    // Create new timeline - slow rotation
    autoplayTimelineRef.current = gsap.timeline({ repeat: -1 })
    autoplayTimelineRef.current.to(trackRef.current, {
      rotateY: '-=360',
      duration: 60, // 60 seconds for one full rotation (very slow)
      ease: 'none'
    })
  }

  const stopAutoplay = () => {
    if (autoplayTimelineRef.current) {
      autoplayTimelineRef.current.pause()
    }
  }

  // Setup autoplay
  useEffect(() => {
    if (autoplay && imagesReady) {
      startAutoplay()
    }

    return () => {
      if (autoplayTimelineRef.current) {
        autoplayTimelineRef.current.kill()
      }
    }
  }, [autoplay, imagesReady])

  // Handle mouse enter/leave for pause on hover
  const handleMouseEnter = () => {
    // Removed pause on hover logic
  }

  const handleMouseLeave = () => {
    // Removed pause on hover logic
  }

  // Handle image click
  const handleImageClick = (index: number) => {
    if (!isDraggingRef.current && onImageClick) {
      onImageClick(index)
    }
  }

  // Handle when an image finishes loading
  const handleImageLoad = useCallback(() => {
    setLoadedImagesCount(prev => prev + 1)
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ 
        perspective: '2000px', 
        height: '450px',
        perspectiveOrigin: '50% 50%'
      }}
    >
      {/* Full carousel loading overlay */}
      {!imagesReady && (
        <div className="absolute inset-0 bg-black z-40 flex flex-col items-center justify-center">
          <video 
            className="w-1/3 h-1/3 max-w-48 max-h-48 opacity-70"
            autoPlay={true}
            loop={true}
            muted={true}
            playsInline={true}
            controls={false}
            preload="auto"
          >
            <source src="/foxloading.webm" type="video/webm" />
          </video>
          <div className="mt-2 px-2 text-white text-xs md:text-lg font-mono font-bold tracking-wider overflow-visible whitespace-nowrap">
            {frames[loadingFrame]}
          </div>
          <div className="mt-2 text-white text-xs md:text-base font-mono tracking-wider">
            LOADING
          </div>
        </div>
      )}
      
      {/* Gallery track */}
      <div className="flex items-center justify-center h-full">
        <div
          ref={trackRef}
          className="relative"
          style={{
            width: `${cylinderWidth}px`,
            height: '300px',
            transformStyle: 'preserve-3d',
            transform: `translateZ(-${radius}px) rotateY(0deg)`,
            transformOrigin: 'center center'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {images.map((url, i) => (
            <div
              key={i}
              className="absolute flex items-center justify-center"
              style={{
                width: `${Math.min(faceWidth, 400)}px`,
                height: '280px',
                left: '50%',
                top: '50%',
                marginLeft: `-${Math.min(faceWidth, 400) / 2}px`,
                marginTop: '-140px',
                transform: `rotateY(${i * anglePerFace}deg) translateZ(${radius}px)`,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                zIndex: Math.round(Math.cos((i * anglePerFace * Math.PI) / 180) * 100),
                opacity: imagesReady ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
              onClick={() => handleImageClick(i)}
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow bg-slate-900">
                <ImageWithLoader
                  src={url}
                  alt={`Gallery image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 300px, 400px"
                  unoptimized
                  onLoadComplete={handleImageLoad}
                  hideLoadingAnimation={true}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}