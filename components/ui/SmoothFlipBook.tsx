'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Home } from 'lucide-react'

export default function SmoothFlipBook() {
  const [currentPage, setCurrentPage] = useState(0)
  const [displayPage, setDisplayPage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<HTMLDivElement>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout>()
  
  const totalPages = 148

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const promises = []
      const start = Math.max(0, currentPage - 2)
      const end = Math.min(totalPages, currentPage + 6)
      
      for (let i = start; i < end; i++) {
        if (!loadedImages.has(i)) {
          const promise = new Promise<number>((resolve) => {
            const img = new Image()
            img.src = `/catalog-pages/page-${(i + 1).toString().padStart(3, '0')}.jpg`
            img.onload = () => resolve(i)
            img.onerror = () => resolve(i)
          })
          promises.push(promise)
        }
      }
      
      const loaded = await Promise.all(promises)
      setLoadedImages(prev => new Set([...prev, ...loaded]))
    }
    
    loadImages()
  }, [currentPage, loadedImages, totalPages])

  const getPageUrl = useCallback((pageNum: number) => {
    if (pageNum < 0 || pageNum >= totalPages) return ''
    return `/catalog-pages/page-${(pageNum + 1).toString().padStart(3, '0')}.jpg`
  }, [totalPages])

  const flipNext = useCallback(() => {
    if (isAnimating || currentPage >= totalPages - 1) return
    
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    
    setIsAnimating(true)
    setFlipDirection('next')
    
    // Start the flip animation
    animationTimeoutRef.current = setTimeout(() => {
      const newPage = currentPage === 0 ? 1 : Math.min(currentPage + 2, totalPages - 1)
      setDisplayPage(newPage)
      setCurrentPage(newPage)
      
      // Reset animation state
      setIsAnimating(false)
      setFlipDirection(null)
    }, 650)
  }, [currentPage, isAnimating, totalPages])

  const flipPrev = useCallback(() => {
    if (isAnimating || currentPage <= 0) return
    
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    
    setIsAnimating(true)
    setFlipDirection('prev')
    
    animationTimeoutRef.current = setTimeout(() => {
      const newPage = currentPage === 1 ? 0 : Math.max(0, currentPage - 2)
      setDisplayPage(newPage)
      setCurrentPage(newPage)
      
      // Reset animation state
      setIsAnimating(false)
      setFlipDirection(null)
    }, 650)
  }, [currentPage, isAnimating])

  const goHome = () => {
    setCurrentPage(0)
    setDisplayPage(0)
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isAnimating) {
        if (e.key === 'ArrowRight') flipNext()
        if (e.key === 'ArrowLeft') flipPrev()
        if (e.key === 'Home') goHome()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [flipNext, flipPrev, isAnimating])

  // Check if showing single page (cover)
  const isSinglePage = displayPage === 0

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden"
    >
      {/* Book Container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div 
          ref={bookRef}
          className="relative"
          style={{
            width: isSinglePage ? '500px' : '1000px',
            maxWidth: isSinglePage ? '90vw' : '95vw',
            height: '700px',
            maxHeight: '75vh',
            perspective: '2000px',
            transition: 'width 0.6s ease',
          }}
        >
          {/* Book Pages */}
          <div className="relative w-full h-full">
            {isSinglePage ? (
              /* Single Cover Page */
              <div className="absolute inset-0 flex justify-center">
                <div 
                  className="relative bg-white shadow-2xl"
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: '100%',
                    borderRadius: '8px',
                  }}
                >
                  {/* Cover Image */}
                  {loadedImages.has(0) && (
                    <img
                      src={getPageUrl(0)}
                      alt="Cover"
                      className="absolute inset-0 w-full h-full object-contain rounded-lg"
                      style={{ padding: '8px' }}
                    />
                  )}
                  
                  {/* Flipping animation for cover */}
                  {isAnimating && flipDirection === 'next' && (
                    <div
                      className="absolute inset-0 bg-white shadow-2xl rounded-lg"
                      style={{
                        transformOrigin: 'left center',
                        animation: 'coverFlip 0.6s ease-in-out',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                        {loadedImages.has(0) && (
                          <img
                            src={getPageUrl(0)}
                            alt="Cover"
                            className="w-full h-full object-contain rounded-lg"
                            style={{ padding: '8px' }}
                          />
                        )}
                      </div>
                      <div 
                        className="absolute inset-0"
                        style={{ 
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        {loadedImages.has(1) && (
                          <img
                            src={getPageUrl(1)}
                            alt="Page 2"
                            className="w-full h-full object-contain rounded-lg"
                            style={{ padding: '8px' }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Two-Page Spread */
              <div className="absolute inset-0 flex">
                {/* Left Page */}
                <div className="relative w-1/2 h-full">
                  <div 
                    className="absolute inset-0 bg-white"
                    style={{
                      borderRadius: '8px 0 0 8px',
                      boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
                    }}
                  >
                    {loadedImages.has(displayPage) && (
                      <img
                        src={getPageUrl(displayPage)}
                        alt={`Page ${displayPage + 1}`}
                        className="w-full h-full object-contain"
                        style={{ padding: '8px', borderRadius: '8px 0 0 8px' }}
                      />
                    )}
                  </div>

                  {/* Prev flip animation */}
                  {isAnimating && flipDirection === 'prev' && (
                    <div
                      className="absolute inset-0 bg-white"
                      style={{
                        transformOrigin: 'right center',
                        animation: 'pageFlipPrev 0.6s ease-in-out',
                        transformStyle: 'preserve-3d',
                        zIndex: 20,
                        borderRadius: '8px 0 0 8px',
                      }}
                    >
                      <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                        {loadedImages.has(currentPage) && (
                          <img
                            src={getPageUrl(currentPage)}
                            alt={`Page ${currentPage + 1}`}
                            className="w-full h-full object-contain"
                            style={{ padding: '8px' }}
                          />
                        )}
                      </div>
                      <div 
                        className="absolute inset-0"
                        style={{ 
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        {loadedImages.has(currentPage - 2) && (
                          <img
                            src={getPageUrl(currentPage - 2)}
                            alt={`Page ${currentPage - 1}`}
                            className="w-full h-full object-contain"
                            style={{ padding: '8px', transform: 'scaleX(-1)' }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Center Spine */}
                <div 
                  className="relative w-px bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300"
                  style={{
                    boxShadow: '0 0 20px rgba(0,0,0,0.2)',
                    zIndex: 15,
                  }}
                />

                {/* Right Page */}
                <div className="relative w-1/2 h-full">
                  <div 
                    className="absolute inset-0 bg-white"
                    style={{
                      borderRadius: '0 8px 8px 0',
                      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                    }}
                  >
                    {displayPage + 1 < totalPages && loadedImages.has(displayPage + 1) && (
                      <img
                        src={getPageUrl(displayPage + 1)}
                        alt={`Page ${displayPage + 2}`}
                        className="w-full h-full object-contain"
                        style={{ padding: '8px', borderRadius: '0 8px 8px 0' }}
                      />
                    )}
                  </div>

                  {/* Next flip animation */}
                  {isAnimating && flipDirection === 'next' && (
                    <div
                      className="absolute inset-0 bg-white"
                      style={{
                        transformOrigin: 'left center',
                        animation: 'pageFlipNext 0.6s ease-in-out',
                        transformStyle: 'preserve-3d',
                        zIndex: 20,
                        borderRadius: '0 8px 8px 0',
                      }}
                    >
                      <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                        {loadedImages.has(currentPage + 1) && (
                          <img
                            src={getPageUrl(currentPage + 1)}
                            alt={`Page ${currentPage + 2}`}
                            className="w-full h-full object-contain"
                            style={{ padding: '8px' }}
                          />
                        )}
                      </div>
                      <div 
                        className="absolute inset-0"
                        style={{ 
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        {loadedImages.has(currentPage + 3) && (
                          <img
                            src={getPageUrl(currentPage + 3)}
                            alt={`Page ${currentPage + 4}`}
                            className="w-full h-full object-contain"
                            style={{ padding: '8px', transform: 'scaleX(-1)' }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={flipPrev}
        disabled={currentPage === 0 || isAnimating}
        className={`absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full shadow-lg transition-all ${
          (currentPage === 0 || isAnimating) ? 'opacity-30 cursor-not-allowed' : ''
        }`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={flipNext}
        disabled={currentPage >= totalPages - 1 || isAnimating}
        className={`absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full shadow-lg transition-all ${
          (currentPage >= totalPages - 1 || isAnimating) ? 'opacity-30 cursor-not-allowed' : ''
        }`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={goHome}
              className="text-white/80 hover:text-white transition-colors p-2"
              title="Go to cover"
            >
              <Home className="w-5 h-5" />
            </button>
            
            <div className="text-white/90 text-sm font-medium">
              {isSinglePage 
                ? 'Cover'
                : `Pages ${displayPage + 1}-${Math.min(displayPage + 2, totalPages)} of ${totalPages}`
              }
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="text-white/80 hover:text-white transition-colors p-2"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes coverFlip {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }

        @keyframes pageFlipNext {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }

        @keyframes pageFlipPrev {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(180deg);
          }
        }
      `}</style>
    </div>
  )
}