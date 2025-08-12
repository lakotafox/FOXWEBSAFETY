'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface CategorySliderProps {
  categories: Array<{
    id: string
    label: string
    color: string
    bgColor: string
  }>
  selectedCategory: string
  onCategoryChange: (category: string) => void
  className?: string
}

export default function CategorySlider({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  className = ''
}: CategorySliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(0)
  const [currentHoverIndex, setCurrentHoverIndex] = useState(-1)
  const [stretchAmount, setStretchAmount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const outerContainerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<gsap.core.Tween | null>(null)
  
  // Get category index
  const selectedIndex = categories.findIndex(c => c.id === selectedCategory)
  
  // Calculate slider width (should be 1/3 of container for 3 items)
  const sliderWidthPercent = 100 / categories.length
  
  // Calculate target position based on selected category
  useEffect(() => {
    const targetPosition = selectedIndex * sliderWidthPercent
    setSliderPosition(targetPosition)
  }, [selectedIndex, sliderWidthPercent])
  
  // Handle drag/touch start
  const handleStart = (clientX: number) => {
    setIsDragging(true)
    setDragStartX(clientX)
  }
  
  // Handle drag/touch move
  const handleMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return
    
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const relativeX = clientX - rect.left
    const percentage = (relativeX / rect.width) * 100
    
    // Find which category we're hovering over (using clamped position)
    const segmentWidth = 100 / categories.length
    const clampedPercentage = Math.max(0, Math.min(percentage, 100))
    const hoverIndex = Math.round(clampedPercentage / segmentWidth)
    const clampedIndex = Math.max(0, Math.min(hoverIndex, categories.length - 1))
    setCurrentHoverIndex(clampedIndex)
    
    // Allow position to go beyond boundaries for stretching
    let displayPosition = percentage
    let stretch = 0
    
    if (percentage < 0) {
      // Dragging beyond left edge - apply resistance
      const resistance = 0.3 // Make it harder to drag further
      displayPosition = percentage * resistance
      stretch = displayPosition
    } else if (percentage > 100 - sliderWidthPercent) {
      // Dragging beyond right edge - apply resistance
      const maxPosition = 100 - sliderWidthPercent
      const excess = percentage - maxPosition
      const resistance = 0.3
      displayPosition = maxPosition + (excess * resistance)
      stretch = excess * resistance
    } else {
      // Normal range - no stretch
      displayPosition = percentage
    }
    
    setStretchAmount(stretch)
    setSliderPosition(displayPosition)
  }
  
  // Handle drag/touch end
  const handleEnd = (clientX: number) => {
    if (!isDragging || !containerRef.current) return
    
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const relativeX = clientX - rect.left
    const percentage = (relativeX / rect.width) * 100
    
    // Find closest category (clamp percentage for category selection)
    const segmentWidth = 100 / categories.length
    const clampedPercentage = Math.max(0, Math.min(percentage, 100))
    const closestIndex = Math.round(clampedPercentage / segmentWidth)
    const clampedIndex = Math.max(0, Math.min(closestIndex, categories.length - 1))
    
    // Animate back to valid position with elastic effect
    const targetPosition = clampedIndex * sliderWidthPercent
    
    if (stretchAmount !== 0) {
      // Animate outer container back with elastic bounce
      if (outerContainerRef.current) {
        gsap.to(outerContainerRef.current, {
          scaleX: 1,
          scaleY: 1,
          duration: 0.6,
          ease: "elastic.out(1, 0.3)"
        })
      }
      
      // Animate slider position back
      gsap.to(this, {
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
        onUpdate: function() {
          setSliderPosition(targetPosition)
        }
      })
    } else {
      // Normal snap to position
      setSliderPosition(targetPosition)
    }
    
    // Update selected category
    onCategoryChange(categories[clampedIndex].id)
    setIsDragging(false)
    setCurrentHoverIndex(-1)
    setStretchAmount(0)
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Capture pointer to maintain drag even outside element
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.nativeEvent.pointerId)
    handleStart(e.clientX)
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      e.stopPropagation()
      handleMove(e.clientX)
    }
  }
  
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      e.stopPropagation()
      // Release pointer capture
      const target = e.currentTarget as HTMLElement
      target.releasePointerCapture(e.nativeEvent.pointerId)
      handleEnd(e.clientX)
    }
  }
  
  const handleMouseLeave = () => {
    if (isDragging) {
      // Animate stretch back if needed
      if (sliderRef.current && stretchAmount !== 0) {
        gsap.to(sliderRef.current, {
          scaleX: 1,
          duration: 0.6,
          ease: "elastic.out(1, 0.3)"
        })
      }
      
      // Snap to current position
      const targetPosition = selectedIndex * sliderWidthPercent
      setSliderPosition(targetPosition)
      setIsDragging(false)
      setCurrentHoverIndex(-1)
      setStretchAmount(0)
    }
  }
  
  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length > 0) {
      handleEnd(e.changedTouches[0].clientX)
    }
  }

  // Get the background color - use hover index while dragging, otherwise use selected
  const activeIndex = isDragging && currentHoverIndex >= 0 ? currentHoverIndex : selectedIndex
  const currentBgColor = categories[activeIndex]?.bgColor || 'bg-blue-600'

  return (
    <div className={`flex justify-center ${className}`}>
      <div 
        ref={outerContainerRef}
        className="bg-slate-700 border-4 border-slate-600 p-1"
        style={{
          transform: stretchAmount !== 0 && isDragging ? 
            `scaleX(${1 + Math.abs(stretchAmount) * 0.01}) scaleY(${1 - Math.abs(stretchAmount) * 0.008})` : 
            'scaleX(1) scaleY(1)',
          transformOrigin: 'center'
        }}
      >
        <div 
          ref={containerRef}
          className="relative flex items-center overflow-hidden select-none cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const target = e.currentTarget as HTMLElement
            target.setPointerCapture(e.pointerId)
            setIsDragging(true)
            handleStart(e.clientX)
          }}
          onPointerMove={(e) => {
            if (isDragging) {
              e.preventDefault()
              e.stopPropagation()
              handleMove(e.clientX)
            }
          }}
          onPointerUp={(e) => {
            if (isDragging) {
              e.preventDefault()
              e.stopPropagation()
              const target = e.currentTarget as HTMLElement
              target.releasePointerCapture(e.pointerId)
              handleEnd(e.clientX)
            }
          }}
          onPointerCancel={(e) => {
            if (isDragging) {
              const target = e.currentTarget as HTMLElement
              target.releasePointerCapture(e.pointerId)
              // Snap back to nearest valid position
              const targetPosition = selectedIndex * sliderWidthPercent
              setSliderPosition(targetPosition)
              setIsDragging(false)
              setCurrentHoverIndex(-1)
              setStretchAmount(0)
            }
          }}
        >
          {/* Sliding background */}
          <div
            ref={sliderRef}
            className={`absolute top-0 h-full ${currentBgColor} ${isDragging ? '' : 'transition-all duration-300 ease-out'}`}
            style={{
              left: `${Math.max(0, Math.min(sliderPosition, 100 - sliderWidthPercent))}%`,
              width: `${sliderWidthPercent}%`,
              zIndex: 1,
              transform: stretchAmount !== 0 ? 
                `scaleX(${1 + Math.abs(stretchAmount) * 0.02}) scaleY(${1 - Math.abs(stretchAmount) * 0.005})` : 
                'scaleX(1) scaleY(1)',
              transformOrigin: stretchAmount < 0 ? 'right center' : 'left center'
            }}
          />
          
          {/* Category labels */}
          <div className="relative z-10 w-full flex">
            {categories.map((category, index) => {
              // Determine if this category should be highlighted
              const isHighlighted = isDragging 
                ? index === currentHoverIndex  // While dragging, highlight based on hover
                : category.id === selectedCategory  // Otherwise, highlight selected
              
              return (
              <div
                key={category.id}
                className={`flex-1 flex items-center justify-center font-black text-sm md:text-base px-2 md:px-4 py-1 md:py-2 tracking-wide transition-colors duration-300 cursor-pointer ${
                  isHighlighted
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
                onClick={() => {
                  if (!isDragging) {
                    onCategoryChange(category.id)
                  }
                }}
              >
                <span className="text-center">
                  {category.label.includes(' ') ? (
                    // Split PRE-OWNED into two lines
                    category.label.split(' ').map((word, i) => (
                      <span key={i}>
                        {word}
                        {i < category.label.split(' ').length - 1 && <br />}
                      </span>
                    ))
                  ) : (
                    // Make NEW and CHAIRS/SEATING bigger
                    <span className="text-base md:text-lg">{category.label}</span>
                  )}
                </span>
              </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}