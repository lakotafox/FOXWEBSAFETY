'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Maximize2, Minimize2, Home } from 'lucide-react'

declare global {
  interface Window {
    jQuery: any
    $: any
  }
}

export default function TurnJSFlipBook() {
  const [isReady, setIsReady] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const flipbookRef = useRef<HTMLDivElement>(null)
  
  const totalPages = 148

  // Handle window resize
  useEffect(() => {
    if (!isReady || !flipbookRef.current) return

    const handleResize = () => {
      const $ = window.$
      const $flipbook = $(flipbookRef.current)
      
      if ($flipbook.turn) {
        const containerWidth = flipbookRef.current.parentElement?.clientWidth || 900
        const containerHeight = flipbookRef.current.parentElement?.clientHeight || 600
        const bookWidth = Math.min(containerWidth * 0.9, 1200)
        const bookHeight = Math.min(containerHeight * 0.9, 800)
        const isMobile = window.innerWidth < 768
        
        $flipbook.turn('size', bookWidth, bookHeight)
        $flipbook.turn('display', isMobile ? 'single' : 'double')
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isReady])

  // Initialize Turn.js after jQuery and Turn.js are loaded
  useEffect(() => {
    if (!isReady || !flipbookRef.current) return

    const $ = window.$
    if (!$) {
      console.error('jQuery not loaded')
      return
    }

    const $flipbook = $(flipbookRef.current)

    // Get container dimensions
    const containerWidth = flipbookRef.current.parentElement?.clientWidth || 900
    const containerHeight = flipbookRef.current.parentElement?.clientHeight || 600
    
    // Calculate optimal size maintaining aspect ratio
    const bookWidth = Math.min(containerWidth * 0.9, 1200)
    const bookHeight = Math.min(containerHeight * 0.9, 800)
    
    // Check if mobile
    const isMobile = window.innerWidth < 768
    
    console.log('Initializing Turn.js with:', { bookWidth, bookHeight, totalPages })
    
    try {
      // Initialize Turn.js
      $flipbook.turn({
        width: bookWidth,
        height: bookHeight,
        autoCenter: true,
        display: isMobile ? 'single' : 'double',
        elevation: 50,
        gradients: true,
        when: {
          turning: function(event: any, page: number) {
            setCurrentPage(page)
          }
        }
      })

      // Add pages with proper structure
      for (let i = 1; i <= totalPages; i++) {
        const pageDiv = document.createElement('div')
        pageDiv.className = 'page'
        pageDiv.style.width = '100%'
        pageDiv.style.height = '100%'
        pageDiv.style.backgroundColor = 'white'
        
        const img = document.createElement('img')
        img.src = `/catalog-pages/page-${i.toString().padStart(3, '0')}.jpg`
        img.style.width = '100%'
        img.style.height = '100%'
        img.style.objectFit = 'contain'
        img.loading = 'lazy'
        
        pageDiv.appendChild(img)
        $flipbook.turn('addPage', $(pageDiv), i)
      }
      
      console.log('Turn.js initialized successfully')
    } catch (error) {
      console.error('Error initializing Turn.js:', error)
    }

    // Cleanup function
    return () => {
      try {
        if ($flipbook.turn) {
          $flipbook.turn('destroy')
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }, [isReady, totalPages])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isReady) return

    const handleKeyPress = (e: KeyboardEvent) => {
      const $ = window.$
      const $flipbook = $(flipbookRef.current)
      
      if (e.key === 'ArrowLeft') {
        $flipbook.turn('previous')
      } else if (e.key === 'ArrowRight') {
        $flipbook.turn('next')
      } else if (e.key === 'Home') {
        $flipbook.turn('page', 1)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isReady])

  const goToPage = (pageNumber: number) => {
    if (!isReady) return
    const $ = window.$
    const $flipbook = $(flipbookRef.current)
    $flipbook.turn('page', pageNumber)
    setActiveDropdown(null)
  }

  const nextPage = () => {
    if (!isReady) return
    const $ = window.$
    const $flipbook = $(flipbookRef.current)
    $flipbook.turn('next')
  }

  const prevPage = () => {
    if (!isReady) return
    const $ = window.$
    const $flipbook = $(flipbookRef.current)
    $flipbook.turn('previous')
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

  // Load scripts in sequence
  useEffect(() => {
    // First load jQuery
    const jqueryScript = document.createElement('script')
    jqueryScript.src = 'https://code.jquery.com/jquery-3.7.1.min.js'
    jqueryScript.onload = () => {
      window.$ = window.jQuery
      
      // Then load Turn.js after jQuery is ready
      const turnScript = document.createElement('script')
      turnScript.src = '/js/turn.min.js'
      turnScript.onload = () => {
        setIsReady(true)
      }
      document.body.appendChild(turnScript)
    }
    document.body.appendChild(jqueryScript)

    // Cleanup
    return () => {
      const scripts = document.querySelectorAll('script[src*="jquery"], script[src*="turn"]')
      scripts.forEach(script => script.remove())
    }
  }, [])

  return (
    <>

      <div 
        ref={containerRef}
        className="catalog-flipbook relative w-full h-full bg-slate-800 overflow-hidden flex flex-col"
      >
        {/* Navigation Bar */}
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <div className="flex items-center gap-6">
              {/* Desking Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('desking')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="text-yellow-500 hover:text-yellow-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2">
                  Desking
                  <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'desking' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'desking' && (
                  <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] z-[100] border border-slate-700">
                    <button onClick={() => goToPage(4)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">04-28: Classic Laminate</button>
                    <button onClick={() => goToPage(30)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">30-37: Elements Laminate</button>
                    <button onClick={() => goToPage(38)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">38-39: Encore Collection</button>
                    <button onClick={() => goToPage(40)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">40-45: Signature Collection</button>
                    <button onClick={() => goToPage(48)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">48-49: Riser Series</button>
                    <button onClick={() => goToPage(50)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">50-53: Height Adjustable</button>
                    <button onClick={() => goToPage(140)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">140-143: Accessories</button>
                  </div>
                )}
              </div>

              {/* Panels Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('panels')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="text-blue-500 hover:text-blue-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2">
                  Panels
                  <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'panels' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'panels' && (
                  <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] z-[100] border border-slate-700">
                    <button onClick={() => goToPage(56)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">56-59: Webb Panels</button>
                    <button onClick={() => goToPage(60)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">60-61: Borders</button>
                    <button onClick={() => goToPage(62)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">62: SpaceMax Panels</button>
                    <button onClick={() => goToPage(63)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">63: Drawing Services</button>
                  </div>
                )}
              </div>

              {/* Tables Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('tables')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="text-green-500 hover:text-green-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2">
                  Tables
                  <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'tables' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'tables' && (
                  <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] z-[100] border border-slate-700">
                    <button onClick={() => goToPage(66)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">66-67: Gathering Tables</button>
                    <button onClick={() => goToPage(68)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">68-71: Training Room</button>
                    <button onClick={() => goToPage(73)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">73-78: Conference Tables</button>
                    <button onClick={() => goToPage(79)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">79-83: Occasional Tables</button>
                  </div>
                )}
              </div>

              {/* Seating Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('seating')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="text-red-500 hover:text-red-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2">
                  Seating
                  <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'seating' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'seating' && (
                  <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] z-[100] border border-slate-700">
                    <button onClick={() => goToPage(86)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">86-89: Chair Guide</button>
                    <button onClick={() => goToPage(90)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">90-98: Reception & Lounge</button>
                    <button onClick={() => goToPage(99)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">99-113: Management</button>
                    <button onClick={() => goToPage(114)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">114-121: Task</button>
                    <button onClick={() => goToPage(122)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">122-123: Big & Tall</button>
                    <button onClick={() => goToPage(124)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">124-125: Drafting</button>
                    <button onClick={() => goToPage(126)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">126-139: Guest & Multi</button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Flipbook Container */}
        <div className="flex-1 relative flex items-center justify-center p-8" style={{ minHeight: '500px' }}>
          {!isReady ? (
            <div className="text-white text-xl font-black">LOADING CATALOG...</div>
          ) : (
            <>
              <div 
                ref={flipbookRef}
                className="flipbook"
                style={{
                  margin: '0 auto',
                  boxShadow: '0 0 20px rgba(0,0,0,0.4)'
                }}
              />

              {/* Navigation Buttons */}
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-opacity ${
                  currentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages}
                className={`absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-opacity ${
                  currentPage >= totalPages ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Page indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
                Page {currentPage} of {totalPages}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}