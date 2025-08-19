'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

export default function StPageFlipBook() {
  const bookRef = useRef<HTMLDivElement>(null)
  const pageFlipRef = useRef<any>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages] = useState(148)
  const [isLoading, setIsLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Load StPageFlip from CDN
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.browser.js'
    script.async = true
    
    script.onload = () => {
      console.log('Script loaded, checking for St:', (window as any).St)
      
      // Wait a bit for the script to fully initialize
      setTimeout(() => {
        if (bookRef.current && (window as any).St) {
          const PageFlip = (window as any).St.PageFlip
          console.log('PageFlip class:', PageFlip)
          
          // Initialize PageFlip
          const pageFlip = new PageFlip(bookRef.current, {
            width: 550,
            height: 700,
            size: 'stretch',
            minWidth: 315,
            maxWidth: 1000,
            minHeight: 400,
            maxHeight: 1350,
            showCover: true,
            maxShadowOpacity: 0.5,
            mobileScrollSupport: true,
            swipeDistance: 30,
            useMouseEvents: true,
            usePortrait: false,
            startZIndex: 0,
            autoSize: true,
            clickEventForward: true,
          })

          // Load pages
          const pages = []
          for (let i = 1; i <= totalPages; i++) {
            const paddedNum = i.toString().padStart(3, '0')
            pages.push(`/catalog-pages/page-${paddedNum}.jpg`)
          }

          console.log('Loading pages:', pages.length)
          pageFlip.loadFromImages(pages)
          
          // Event listeners
          pageFlip.on('flip', (e: any) => {
            setCurrentPage(e.data)
          })

          pageFlip.on('changeState', (e: any) => {
            console.log('State changed:', e.data)
            if (e.data === 'read') {
              setIsLoading(false)
            }
          })

          pageFlipRef.current = pageFlip
        } else {
          console.error('St not found on window')
          setIsLoading(false) // Stop loading even if failed
        }
      }, 100)
    }

    script.onerror = () => {
      console.error('Failed to load StPageFlip script')
      setIsLoading(false)
    }

    document.head.appendChild(script)

    return () => {
      if (pageFlipRef.current) {
        pageFlipRef.current.destroy()
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [totalPages])

  const handlePrevPage = () => {
    if (pageFlipRef.current) {
      pageFlipRef.current.flipPrev()
    }
  }

  const handleNextPage = () => {
    if (pageFlipRef.current) {
      pageFlipRef.current.flipNext()
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 2))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      bookRef.current?.parentElement?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevPage()
      if (e.key === 'ArrowRight') handleNextPage()
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen()
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen])

  return (
    <div className="relative w-full h-full bg-slate-800 flex flex-col">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-50">
          <div className="text-white text-xl font-black">LOADING CATALOG...</div>
        </div>
      )}

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/60 rounded-full px-4 py-2 flex items-center gap-4">
        <button
          onClick={handleZoomOut}
          className="text-white hover:text-yellow-500 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-white text-sm">{Math.round(zoom * 100)}%</span>
        <button
          onClick={handleZoomIn}
          className="text-white hover:text-yellow-500 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-gray-600" />
        <button
          onClick={toggleFullscreen}
          className="text-white hover:text-yellow-500 transition-colors"
          aria-label="Toggle fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Book container */}
      <div 
        className="flex-1 flex items-center justify-center overflow-auto"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
      >
        <div ref={bookRef} className="shadow-2xl"></div>
      </div>

      {/* Navigation controls */}
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 0}
        className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all z-20 ${
          currentPage === 0 ? 'opacity-30 cursor-not-allowed' : ''
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNextPage}
        disabled={currentPage >= totalPages - 1}
        className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all z-20 ${
          currentPage >= totalPages - 1 ? 'opacity-30 cursor-not-allowed' : ''
        }`}
        aria-label="Next page"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Page counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full z-20">
        <span className="font-bold">
          {currentPage + 1} - {Math.min(currentPage + 2, totalPages)} of {totalPages}
        </span>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-gray-400 text-xs z-20">
        Use arrow keys or click to turn pages
      </div>
    </div>
  )
}