'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, Home } from 'lucide-react'

export default function FlipBook() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  
  const totalPages = 148
  
  // Show single page for cover (page 0) and last page if odd total
  const isShowingSinglePage = () => {
    return currentPage === 0 || (currentPage === totalPages - 1 && totalPages % 2 === 0)
  }
  
  const getPagesPerView = () => {
    return isShowingSinglePage() ? 1 : 2
  }

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      const imagesToLoad = []
      const startPage = Math.max(0, currentPage - 2)
      const endPage = Math.min(totalPages - 1, currentPage + 6)
      
      for (let i = startPage; i <= endPage; i++) {
        if (!loadedImages.has(i)) {
          imagesToLoad.push(i)
        }
      }
      
      imagesToLoad.forEach(pageNum => {
        const img = new Image()
        img.src = getPageUrl(pageNum)
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(pageNum))
        }
      })
    }
    
    preloadImages()
  }, [currentPage, loadedImages])

  const getPageUrl = (pageNum: number) => {
    const paddedNum = (pageNum + 1).toString().padStart(3, '0')
    return `/catalog-pages/page-${paddedNum}.jpg`
  }

  const nextPage = () => {
    if (!isFlipping) {
      const increment = currentPage === 0 ? 1 : 2
      if (currentPage < totalPages - 1) {
        setIsFlipping(true)
        setFlipDirection('next')
        setTimeout(() => {
          setCurrentPage(prev => Math.min(prev + increment, totalPages - 1))
          setIsFlipping(false)
          setFlipDirection(null)
        }, 600)
      }
    }
  }

  const prevPage = () => {
    if (!isFlipping && currentPage > 0) {
      const decrement = currentPage === 1 ? 1 : (currentPage === totalPages - 1 && totalPages % 2 === 0) ? 1 : 2
      setIsFlipping(true)
      setFlipDirection('prev')
      setTimeout(() => {
        setCurrentPage(prev => Math.max(prev - decrement, 0))
        setIsFlipping(false)
        setFlipDirection(null)
      }, 600)
    }
  }

  const goToFirstPage = () => {
    setCurrentPage(0)
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
      if (e.key === 'Home') goToFirstPage()
      if (e.key === 'f' || e.key === 'F') toggleFullscreen()
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage, isFlipping])

  // Handle fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
      }
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-slate-800 flex flex-col overflow-hidden"
    >
      {/* Book Display */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-6xl h-full flex items-center justify-center">
          {/* Book Container with 3D perspective */}
          <div 
            className="relative flex justify-center"
            style={{
              perspective: '2000px',
              transformStyle: 'preserve-3d',
            }}
          >
            {isShowingSinglePage() ? (
              /* Single Page View (Cover or Last Page) */
              <div 
                className={`relative bg-white shadow-2xl transition-all duration-600 ${
                  isFlipping ? (flipDirection === 'next' ? 'flip-single-next' : 'flip-single-prev') : ''
                }`}
                style={{
                  width: 'min(45vw, 550px)',
                  height: 'min(65vh, 750px)',
                  borderRadius: '4px',
                  transformOrigin: currentPage === 0 ? 'right center' : 'left center',
                }}
              >
                {loadedImages.has(currentPage) ? (
                  <img
                    src={getPageUrl(currentPage)}
                    alt={`Page ${currentPage + 1}`}
                    className="w-full h-full object-contain rounded"
                    style={{ backgroundColor: '#f9f9f9' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                    <div className="text-gray-400">Loading...</div>
                  </div>
                )}
                {/* Page number */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 bg-white/80 px-2 py-1 rounded">
                  {currentPage + 1}
                </div>
              </div>
            ) : (
              /* Two Page Spread View */
              <>
                {/* Left Page */}
                <div 
                  className={`relative bg-white shadow-2xl transition-all duration-600 ${
                    isFlipping && flipDirection === 'prev' ? 'flip-page-prev' : ''
                  }`}
                  style={{
                    width: 'min(40vw, 500px)',
                    height: 'min(60vh, 700px)',
                    transformOrigin: 'right center',
                    borderRadius: '4px 0 0 4px',
                  }}
                >
                  {loadedImages.has(currentPage) ? (
                    <img
                      src={getPageUrl(currentPage)}
                      alt={`Page ${currentPage + 1}`}
                      className="w-full h-full object-contain rounded-l"
                      style={{ backgroundColor: '#f9f9f9' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-l">
                      <div className="text-gray-400">Loading...</div>
                    </div>
                  )}
                  {/* Page number */}
                  <div className="absolute bottom-4 left-4 text-sm text-gray-600 bg-white/80 px-2 py-1 rounded">
                    {currentPage + 1}
                  </div>
                </div>

                {/* Center spine shadow */}
                <div 
                  className="relative w-8 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400"
                  style={{
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                    background: 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.4), rgba(0,0,0,0.2))',
                  }}
                />

                {/* Right Page */}
                <div 
                  className={`relative bg-white shadow-2xl transition-all duration-600 ${
                    isFlipping && flipDirection === 'next' ? 'flip-page-next' : ''
                  }`}
                  style={{
                    width: 'min(40vw, 500px)',
                    height: 'min(60vh, 700px)',
                    transformOrigin: 'left center',
                    borderRadius: '0 4px 4px 0',
                  }}
                >
                  {currentPage + 1 < totalPages && loadedImages.has(currentPage + 1) ? (
                    <img
                      src={getPageUrl(currentPage + 1)}
                      alt={`Page ${currentPage + 2}`}
                      className="w-full h-full object-contain rounded-r"
                      style={{ backgroundColor: '#f9f9f9' }}
                    />
                  ) : currentPage + 1 < totalPages ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-r">
                      <div className="text-gray-400">Loading...</div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-50 rounded-r flex items-center justify-center">
                      <div className="text-gray-400">End of Catalog</div>
                    </div>
                  )}
                  {/* Page number */}
                  {currentPage + 1 < totalPages && (
                    <div className="absolute bottom-4 right-4 text-sm text-gray-600 bg-white/80 px-2 py-1 rounded">
                      {currentPage + 2}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevPage}
            disabled={currentPage === 0 || isFlipping}
            className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 md:p-3 rounded-full transition-all ${
              currentPage === 0 || isFlipping ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1 || isFlipping}
            className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 md:p-3 rounded-full transition-all ${
              currentPage >= totalPages - 1 || isFlipping ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm p-3 md:p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Page Counter */}
          <div className="text-white text-sm md:text-base">
            {isShowingSinglePage() 
              ? `Page ${currentPage + 1} of ${totalPages}`
              : `Pages ${currentPage + 1}-${Math.min(currentPage + 2, totalPages)} of ${totalPages}`
            }
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={goToFirstPage}
              className="text-white hover:text-yellow-500 transition-colors p-2"
              aria-label="Go to first page"
              title="Go to first page (Home)"
            >
              <Home className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-yellow-500 transition-colors p-2"
              aria-label="Toggle fullscreen"
              title="Toggle fullscreen (F)"
            >
              <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Instructions */}
          <div className="hidden md:block text-gray-400 text-sm">
            Use arrow keys to navigate
          </div>
        </div>
      </div>

      {/* CSS for flip animations */}
      <style jsx>{`
        .flip-page-next {
          animation: flipNext 0.6s ease-in-out;
        }
        
        .flip-page-prev {
          animation: flipPrev 0.6s ease-in-out;
        }
        
        .flip-single-next {
          animation: flipSingleNext 0.6s ease-in-out;
        }
        
        .flip-single-prev {
          animation: flipSinglePrev 0.6s ease-in-out;
        }
        
        @keyframes flipNext {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }
        
        @keyframes flipPrev {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(180deg);
          }
        }
        
        @keyframes flipSingleNext {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(-90deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }
        
        @keyframes flipSinglePrev {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(90deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }
        
        .duration-600 {
          transition-duration: 600ms;
        }
      `}</style>
    </div>
  )
}