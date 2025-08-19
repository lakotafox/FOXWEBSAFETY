'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'

export default function PageFlipBook() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipProgress, setFlipProgress] = useState(0)
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(148).fill(false))
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  
  const totalPages = 148

  // Preload images near current page
  useEffect(() => {
    const loadImage = (index: number) => {
      if (index < 0 || index >= totalPages || imagesLoaded[index]) return
      
      const img = new Image()
      img.src = `/catalog-pages/page-${(index + 1).toString().padStart(3, '0')}.jpg`
      img.onload = () => {
        setImagesLoaded(prev => {
          const newState = [...prev]
          newState[index] = true
          return newState
        })
      }
    }

    // Load current and nearby pages
    for (let i = -2; i <= 3; i++) {
      loadImage(currentPage + i)
    }
  }, [currentPage, imagesLoaded, totalPages])

  const getPageUrl = (pageNum: number) => {
    if (pageNum < 0 || pageNum >= totalPages) return ''
    const paddedNum = (pageNum + 1).toString().padStart(3, '0')
    return `/catalog-pages/page-${paddedNum}.jpg`
  }

  const animateFlip = (direction: 'next' | 'prev', callback: () => void) => {
    let progress = 0
    const duration = 600 // ms
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      setFlipProgress(eased * 100)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        callback()
        setFlipProgress(0)
        setIsFlipping(false)
        setFlipDirection(null)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const nextPage = () => {
    if (isFlipping || currentPage >= totalPages - 1) return
    
    setIsFlipping(true)
    setFlipDirection('next')
    
    animateFlip('next', () => {
      if (currentPage === 0) {
        setCurrentPage(1) // Go to page 2-3 spread
      } else if (currentPage === 1) {
        setCurrentPage(3) // Go to page 4-5 spread
      } else {
        setCurrentPage(prev => Math.min(prev + 2, totalPages - 1))
      }
    })
  }

  const prevPage = () => {
    if (isFlipping || currentPage <= 0) return
    
    setIsFlipping(true)
    setFlipDirection('prev')
    
    animateFlip('prev', () => {
      if (currentPage === 1) {
        setCurrentPage(0) // Back to cover
      } else if (currentPage === 3) {
        setCurrentPage(1) // Back to page 2-3
      } else {
        setCurrentPage(prev => Math.max(prev - 2, 0))
      }
    })
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage()
      if (e.key === 'ArrowLeft') prevPage()
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage, isFlipping])

  const renderPages = () => {
    const isCover = currentPage === 0
    const flipAngle = (flipProgress / 100) * 180

    if (isCover) {
      // Single cover page
      return (
        <div className="relative" style={{ perspective: '2000px' }}>
          {/* Current cover */}
          <div 
            className="relative mx-auto"
            style={{
              width: '400px',
              maxWidth: '90vw',
              height: '580px',
              maxHeight: '70vh',
            }}
          >
            <div className="absolute inset-0 bg-white rounded shadow-2xl">
              {imagesLoaded[0] && (
                <img
                  src={getPageUrl(0)}
                  alt="Cover"
                  className="w-full h-full object-contain rounded"
                />
              )}
            </div>

            {/* Flipping page overlay */}
            {isFlipping && flipDirection === 'next' && (
              <div 
                className="absolute inset-0"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(-${flipAngle}deg)`,
                  transformOrigin: 'right center',
                  transition: 'none',
                }}
              >
                {/* Front face - current page */}
                <div 
                  className="absolute inset-0 bg-white rounded shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {imagesLoaded[0] && (
                    <img
                      src={getPageUrl(0)}
                      alt="Cover"
                      className="w-full h-full object-contain rounded"
                    />
                  )}
                </div>
                
                {/* Back face - next page */}
                <div 
                  className="absolute inset-0 bg-white rounded shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {imagesLoaded[1] && (
                    <img
                      src={getPageUrl(1)}
                      alt="Page 2"
                      className="w-full h-full object-contain rounded"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    } else {
      // Two-page spread
      const leftPage = currentPage
      const rightPage = currentPage + 1

      return (
        <div className="relative flex" style={{ perspective: '2000px' }}>
          {/* Left page */}
          <div 
            className="relative"
            style={{
              width: '400px',
              maxWidth: '45vw',
              height: '580px',
              maxHeight: '70vh',
            }}
          >
            <div className="absolute inset-0 bg-white rounded-l shadow-xl">
              {imagesLoaded[leftPage] && (
                <img
                  src={getPageUrl(leftPage)}
                  alt={`Page ${leftPage + 1}`}
                  className="w-full h-full object-contain rounded-l"
                />
              )}
            </div>

            {/* Flipping left page (going back) */}
            {isFlipping && flipDirection === 'prev' && (
              <div 
                className="absolute inset-0"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${flipAngle}deg)`,
                  transformOrigin: 'right center',
                  transition: 'none',
                  zIndex: 10,
                }}
              >
                {/* Front face - current left page */}
                <div 
                  className="absolute inset-0 bg-white rounded-l shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {imagesLoaded[leftPage] && (
                    <img
                      src={getPageUrl(leftPage)}
                      alt={`Page ${leftPage + 1}`}
                      className="w-full h-full object-contain rounded-l"
                    />
                  )}
                </div>
                
                {/* Back face - previous page */}
                <div 
                  className="absolute inset-0 bg-white rounded-l shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {imagesLoaded[leftPage - 2] && (
                    <img
                      src={getPageUrl(leftPage - 2)}
                      alt={`Page ${leftPage - 1}`}
                      className="w-full h-full object-contain rounded-l"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Center spine */}
          <div 
            className="relative w-1 bg-gradient-to-r from-gray-300 to-gray-400"
            style={{
              boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            }}
          />

          {/* Right page */}
          <div 
            className="relative"
            style={{
              width: '400px',
              maxWidth: '45vw',
              height: '580px',
              maxHeight: '70vh',
            }}
          >
            <div className="absolute inset-0 bg-white rounded-r shadow-xl">
              {rightPage < totalPages && imagesLoaded[rightPage] && (
                <img
                  src={getPageUrl(rightPage)}
                  alt={`Page ${rightPage + 1}`}
                  className="w-full h-full object-contain rounded-r"
                />
              )}
            </div>

            {/* Flipping right page (going forward) */}
            {isFlipping && flipDirection === 'next' && (
              <div 
                className="absolute inset-0"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(-${flipAngle}deg)`,
                  transformOrigin: 'left center',
                  transition: 'none',
                  zIndex: 10,
                }}
              >
                {/* Front face - current right page */}
                <div 
                  className="absolute inset-0 bg-white rounded-r shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {rightPage < totalPages && imagesLoaded[rightPage] && (
                    <img
                      src={getPageUrl(rightPage)}
                      alt={`Page ${rightPage + 1}`}
                      className="w-full h-full object-contain rounded-r"
                    />
                  )}
                </div>
                
                {/* Back face - next page */}
                <div 
                  className="absolute inset-0 bg-white rounded-r shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {rightPage + 2 < totalPages && imagesLoaded[rightPage + 2] && (
                    <img
                      src={getPageUrl(rightPage + 2)}
                      alt={`Page ${rightPage + 3}`}
                      className="w-full h-full object-contain rounded-r"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-slate-800 flex flex-col"
    >
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        {renderPages()}
      </div>

      {/* Navigation */}
      <button
        onClick={prevPage}
        disabled={currentPage === 0 || isFlipping}
        className={`absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all ${
          currentPage === 0 || isFlipping ? 'opacity-30 cursor-not-allowed' : ''
        }`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextPage}
        disabled={currentPage >= totalPages - 1 || isFlipping}
        className={`absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all ${
          currentPage >= totalPages - 1 || isFlipping ? 'opacity-30 cursor-not-allowed' : ''
        }`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="text-white">
            {currentPage === 0 
              ? 'Cover' 
              : `Pages ${currentPage + 1}-${Math.min(currentPage + 2, totalPages)} of ${totalPages}`
            }
          </div>
          
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-yellow-500 transition-colors p-2"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}