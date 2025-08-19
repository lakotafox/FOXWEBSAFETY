'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function SimpleFlipBook() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const totalPages = 148

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Generate page URLs
  const getPageUrl = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages) return '/images/blank.jpg' // Return blank for invalid pages
    const paddedNum = pageNum.toString().padStart(3, '0')
    return `/catalog-pages/page-${paddedNum}.jpg`
  }

  const nextPage = () => {
    const increment = isDesktop ? 2 : 1
    if (currentPage < totalPages && !isFlipping) {
      setIsFlipping(true)
      setFlipDirection('next')
      
      setTimeout(() => {
        setCurrentPage(Math.min(currentPage + increment, totalPages))
        setTimeout(() => {
          setIsFlipping(false)
          setFlipDirection(null)
        }, 50)
      }, 600)
    }
  }

  const prevPage = () => {
    const decrement = isDesktop ? 2 : 1
    if (currentPage > 1 && !isFlipping) {
      setIsFlipping(true)
      setFlipDirection('prev')
      
      setTimeout(() => {
        let newPage = currentPage - decrement
        // Ensure odd page for desktop left side
        if (isDesktop && newPage % 2 === 0 && newPage > 1) {
          newPage = newPage - 1
        }
        setCurrentPage(Math.max(newPage, 1))
        setTimeout(() => {
          setIsFlipping(false)
          setFlipDirection(null)
        }, 50)
      }, 600)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isFlipping) {
        if (e.key === 'ArrowRight') nextPage()
        if (e.key === 'ArrowLeft') prevPage()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage, isFlipping, isDesktop])

  // Preload adjacent pages
  useEffect(() => {
    const pagesToPreload = isDesktop ? 6 : 3
    for (let i = 1; i <= pagesToPreload; i++) {
      if (currentPage - i > 0) {
        const img = new window.Image()
        img.src = getPageUrl(currentPage - i)
      }
      if (currentPage + i <= totalPages) {
        const img = new window.Image()
        img.src = getPageUrl(currentPage + i)
      }
    }
  }, [currentPage, isDesktop])

  // Ensure odd page for desktop
  useEffect(() => {
    if (isDesktop && currentPage > 1 && currentPage % 2 === 0) {
      setCurrentPage(currentPage - 1)
    }
  }, [isDesktop])

  return (
    <div className="relative w-full h-full bg-slate-800 flex flex-col overflow-hidden">
      {/* Book Display Area */}
      <div className="flex-1 relative flex items-center justify-center" style={{ perspective: '2000px' }}>
        <div className="relative w-full h-full flex items-center justify-center px-4 py-8">
          
          {/* Desktop: Two-page spread */}
          {isDesktop ? (
            <div className="relative flex items-center justify-center" style={{ maxWidth: '1400px', width: '100%' }}>
              <div className="relative flex" style={{ transformStyle: 'preserve-3d' }}>
                
                {/* Static Left Page */}
                <div className="relative" style={{ width: '50%', maxWidth: '600px' }}>
                  <img
                    src={getPageUrl(currentPage)}
                    alt={`Page ${currentPage}`}
                    className="w-full h-auto"
                    style={{
                      maxHeight: '70vh',
                      objectFit: 'contain',
                      borderRadius: '8px 0 0 8px',
                      boxShadow: 'inset 3px 0 10px rgba(0,0,0,0.2)'
                    }}
                  />
                </div>

                {/* Static Right Page */}
                <div className="relative" style={{ width: '50%', maxWidth: '600px' }}>
                  {currentPage + 1 <= totalPages ? (
                    <img
                      src={getPageUrl(currentPage + 1)}
                      alt={`Page ${currentPage + 1}`}
                      className="w-full h-auto"
                      style={{
                        maxHeight: '70vh',
                        objectFit: 'contain',
                        borderRadius: '0 8px 8px 0',
                        boxShadow: 'inset -3px 0 10px rgba(0,0,0,0.2)'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 rounded-r-lg" style={{ minHeight: '70vh' }} />
                  )}
                </div>

                {/* Flipping Page - Only for NEXT */}
                {isFlipping && flipDirection === 'next' && (
                  <div 
                    className="absolute top-0 right-0"
                    style={{
                      width: '50%',
                      maxWidth: '600px',
                      height: '100%',
                      transformOrigin: 'left center',
                      transform: `rotateY(${isFlipping ? '-180deg' : '0deg'})`,
                      transition: 'transform 0.6s ease-in-out',
                      transformStyle: 'preserve-3d',
                      zIndex: 100
                    }}
                  >
                    {/* Front face - current right page */}
                    <div 
                      className="absolute w-full h-full"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(0deg)'
                      }}
                    >
                      <img
                        src={getPageUrl(currentPage + 1)}
                        alt="Flipping page front"
                        className="w-full h-auto"
                        style={{
                          maxHeight: '70vh',
                          objectFit: 'contain',
                          borderRadius: '0 8px 8px 0',
                          boxShadow: '5px 5px 15px rgba(0,0,0,0.3)'
                        }}
                      />
                    </div>
                    
                    {/* Back face - next left page */}
                    <div 
                      className="absolute w-full h-full"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <img
                        src={getPageUrl(currentPage + 2)}
                        alt="Flipping page back"
                        className="w-full h-auto"
                        style={{
                          maxHeight: '70vh',
                          objectFit: 'contain',
                          borderRadius: '8px 0 0 8px',
                          boxShadow: '-5px 5px 15px rgba(0,0,0,0.3)'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Flipping Page - Only for PREV */}
                {isFlipping && flipDirection === 'prev' && (
                  <div 
                    className="absolute top-0 left-0"
                    style={{
                      width: '50%',
                      maxWidth: '600px',
                      height: '100%',
                      transformOrigin: 'right center',
                      transform: `rotateY(${isFlipping ? '180deg' : '0deg'})`,
                      transition: 'transform 0.6s ease-in-out',
                      transformStyle: 'preserve-3d',
                      zIndex: 100
                    }}
                  >
                    {/* Front face - current left page */}
                    <div 
                      className="absolute w-full h-full"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(0deg)'
                      }}
                    >
                      <img
                        src={getPageUrl(currentPage)}
                        alt="Flipping page front"
                        className="w-full h-auto"
                        style={{
                          maxHeight: '70vh',
                          objectFit: 'contain',
                          borderRadius: '8px 0 0 8px',
                          boxShadow: '-5px 5px 15px rgba(0,0,0,0.3)'
                        }}
                      />
                    </div>
                    
                    {/* Back face - previous right page */}
                    <div 
                      className="absolute w-full h-full"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(-180deg)'
                      }}
                    >
                      <img
                        src={getPageUrl(currentPage - 1)}
                        alt="Flipping page back"
                        className="w-full h-auto"
                        style={{
                          maxHeight: '70vh',
                          objectFit: 'contain',
                          borderRadius: '0 8px 8px 0',
                          boxShadow: '5px 5px 15px rgba(0,0,0,0.3)'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Center spine shadow overlay */}
                <div 
                  className="absolute left-1/2 top-0 bottom-0 pointer-events-none"
                  style={{
                    width: '40px',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.2) 55%, transparent)',
                    zIndex: 50
                  }}
                />
              </div>
            </div>
          ) : (
            /* Mobile: Single page view */
            <div className="relative" style={{ maxWidth: '500px', width: '100%' }}>
              <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
                {/* Current Page */}
                <img
                  src={getPageUrl(currentPage)}
                  alt={`Page ${currentPage}`}
                  className="w-full h-auto rounded-lg shadow-2xl"
                  style={{
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                />

                {/* Mobile Flip Animation */}
                {isFlipping && (
                  <div 
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      transformOrigin: 'center center',
                      transform: `rotateY(${flipDirection === 'next' ? '-180deg' : '180deg'})`,
                      transition: 'transform 0.6s ease-in-out',
                      transformStyle: 'preserve-3d',
                      zIndex: 100
                    }}
                  >
                    {/* Front face */}
                    <div 
                      className="absolute w-full h-full"
                      style={{ 
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      <img
                        src={getPageUrl(currentPage)}
                        alt="Current page"
                        className="w-full h-auto rounded-lg shadow-2xl"
                        style={{
                          maxHeight: '70vh',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                    
                    {/* Back face */}
                    <div 
                      className="absolute w-full h-full"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <img
                        src={getPageUrl(flipDirection === 'next' ? currentPage + 1 : currentPage - 1)}
                        alt="Next page"
                        className="w-full h-auto rounded-lg shadow-2xl"
                        style={{
                          maxHeight: '70vh',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          <button
            onClick={prevPage}
            disabled={currentPage === 1 || isFlipping}
            className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all ${
              currentPage === 1 || isFlipping ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextPage}
            disabled={(isDesktop ? currentPage >= totalPages - 1 : currentPage >= totalPages) || isFlipping}
            className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all ${
              ((isDesktop ? currentPage >= totalPages - 1 : currentPage >= totalPages) || isFlipping) ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* FoxBuilt Logo Watermark */}
        <div className="absolute top-4 right-4 z-30 pointer-events-none">
          <img 
            src="/images/foxbuilt-logo.png" 
            alt="FoxBuilt" 
            className="h-8 md:h-10 w-auto opacity-70"
          />
        </div>
      </div>

      {/* Page Counter */}
      <div className="bg-slate-900 py-3 text-center">
        <div className="text-white font-bold">
          {isDesktop && currentPage + 1 <= totalPages 
            ? `Pages ${currentPage}-${currentPage + 1} of ${totalPages}`
            : `Page ${currentPage} of ${totalPages}`
          }
        </div>
        <div className="text-gray-400 text-xs mt-1">
          Use arrow keys or click arrows to turn pages
        </div>
      </div>
    </div>
  )
}