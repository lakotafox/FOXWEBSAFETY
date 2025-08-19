'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

declare global {
  interface Window {
    jQuery: any
    $: any
  }
}

export default function TurnJSSimple() {
  const [isReady, setIsReady] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const flipbookRef = useRef<HTMLDivElement>(null)
  
  const totalPages = 148

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.relative')) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Load jQuery and Turn.js
  useEffect(() => {
    // Check if jQuery already exists
    if (window.jQuery) {
      loadTurnJS()
      return
    }

    // Load jQuery first
    const jqueryScript = document.createElement('script')
    jqueryScript.src = 'https://code.jquery.com/jquery-3.7.1.min.js'
    jqueryScript.onload = () => {
      window.$ = window.jQuery
      loadTurnJS()
    }
    document.head.appendChild(jqueryScript)

    function loadTurnJS() {
      const turnScript = document.createElement('script')
      turnScript.src = '/js/turn.min.js'
      turnScript.onload = () => {
        console.log('Turn.js loaded')
        setIsReady(true)
      }
      turnScript.onerror = (e) => {
        console.error('Failed to load Turn.js:', e)
      }
      document.head.appendChild(turnScript)
    }

    return () => {
      // Cleanup if needed
    }
  }, [])

  // Initialize flipbook when ready
  useEffect(() => {
    if (!isReady || !flipbookRef.current) return

    const $ = window.$
    const $flipbook = $(flipbookRef.current)

    // Wait for DOM to be ready
    setTimeout(() => {
      try {
        // Calculate responsive dimensions
        const isMobile = window.innerWidth < 768
        const containerWidth = window.innerWidth - 40 // Account for padding
        const containerHeight = window.innerHeight - 200 // Account for header/nav
        
        let bookWidth, bookHeight
        if (isMobile) {
          // Mobile: single page, use most of screen width
          bookWidth = Math.min(containerWidth * 0.95, 500)
          bookHeight = Math.min(containerHeight * 0.9, 700)
        } else {
          // Desktop: double page spread
          bookWidth = Math.min(containerWidth * 0.9, 1000)
          bookHeight = Math.min(containerHeight * 0.9, 600)
        }
        
        // Initialize with corners options for better mobile experience
        const options: any = {
          width: bookWidth,
          height: bookHeight,
          autoCenter: true,
          display: isMobile ? 'single' : 'double',
          elevation: 50,
          gradients: true, // Re-enable gradients
          acceleration: true,
          when: {
            turning: function(event: any, page: number) {
              setCurrentPage(page)
            },
            start: function(event: any, pageObject: any, corner: any) {
              // Allow the default behavior
              return true
            },
            end: function(event: any, pageObject: any, turned: boolean) {
              // Let the animation complete naturally
              return true
            }
          }
        }
        
        // For mobile, make corners easier to grab
        if (isMobile) {
          options.cornerSize = 300 // Larger corner area on mobile
        }
        
        $flipbook.turn(options)
        
        // Prevent animation restart on release
        let isDragging = false
        let dragStarted = false
        
        $flipbook.on('start', function(event: any, pageObject: any, corner: any) {
          if (corner) {
            isDragging = true
            dragStarted = true
          }
        })
        
        $flipbook.on('end', function(event: any, pageObject: any, turned: boolean) {
          // If we were dragging and released, let Turn.js complete the animation
          if (isDragging) {
            isDragging = false
            // Don't interfere with Turn.js's default behavior
          }
        })
        
        // Add swipe handling with vertical scroll support
        let touchStartX = 0
        let touchStartY = 0
        let isHorizontalSwipe = false
        let hasDecidedDirection = false
        
        // Use native touch events with proper passive handling
        const flipbookElement = $flipbook[0]
        
        const handleTouchStart = function(e: TouchEvent) {
          if (e.touches.length === 1) { // Single touch only (not pinch)
            touchStartX = e.touches[0].screenX
            touchStartY = e.touches[0].screenY
            hasDecidedDirection = false
            isHorizontalSwipe = false
          }
        }
        
        const handleTouchMove = function(e: TouchEvent) {
          // Allow pinch zoom (multiple touches)
          if (e.touches.length > 1) {
            return // Don't interfere with pinch zoom
          }
          
          const touch = e.touches[0]
          const deltaX = Math.abs(touch.screenX - touchStartX)
          const deltaY = Math.abs(touch.screenY - touchStartY)
          
          // Determine swipe direction on first significant move
          if (!hasDecidedDirection && (deltaX > 5 || deltaY > 5)) {
            hasDecidedDirection = true
            // If vertical movement is greater, it's a scroll
            isHorizontalSwipe = deltaX > deltaY
            
            if (isHorizontalSwipe) {
              // Prevent vertical scroll for horizontal swipes
              e.preventDefault()
            }
            // If it's vertical, let the page scroll naturally (don't preventDefault)
          } else if (hasDecidedDirection && isHorizontalSwipe) {
            // Continue preventing scroll for horizontal swipes
            e.preventDefault()
          }
        }
        
        const handleTouchEnd = function(e: TouchEvent) {
          // Only handle page flip if it was a horizontal swipe
          if (!dragStarted && isHorizontalSwipe) {
            const touchEndX = e.changedTouches[0].screenX
            const diff = touchEndX - touchStartX
            
            // Only trigger if significant horizontal swipe
            if (Math.abs(diff) > 50) {
              if (diff > 0) {
                $flipbook.turn('previous')
              } else {
                $flipbook.turn('next')
              }
            }
          }
          dragStarted = false
          hasDecidedDirection = false
          isHorizontalSwipe = false
        }
        
        // Add listeners with correct passive flags
        flipbookElement.addEventListener('touchstart', handleTouchStart, { passive: true })
        flipbookElement.addEventListener('touchmove', handleTouchMove, { passive: false })
        flipbookElement.addEventListener('touchend', handleTouchEnd, { passive: true })
        
        console.log('Flipbook initialized')
      } catch (error) {
        console.error('Error initializing flipbook:', error)
      }
    }, 100)

    return () => {
      try {
        if ($flipbook.data('turn')) {
          $flipbook.turn('destroy')
        }
      } catch (e) {
        // Ignore errors
      }
    }
  }, [isReady])

  // Handle window resize
  useEffect(() => {
    if (!isReady) return

    const handleResize = () => {
      const $ = window.$
      if ($ && flipbookRef.current) {
        const $flipbook = $(flipbookRef.current)
        
        const isMobile = window.innerWidth < 768
        const containerWidth = window.innerWidth - 40
        const containerHeight = window.innerHeight - 200
        
        let bookWidth, bookHeight
        if (isMobile) {
          bookWidth = Math.min(containerWidth * 0.95, 500)
          bookHeight = Math.min(containerHeight * 0.9, 700)
        } else {
          bookWidth = Math.min(containerWidth * 0.9, 1000)
          bookHeight = Math.min(containerHeight * 0.9, 600)
        }
        
        $flipbook.turn('size', bookWidth, bookHeight)
        $flipbook.turn('display', isMobile ? 'single' : 'double')
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isReady])

  const nextPage = () => {
    const $ = window.$
    if ($ && flipbookRef.current) {
      $(flipbookRef.current).turn('next')
    }
  }

  const prevPage = () => {
    const $ = window.$
    if ($ && flipbookRef.current) {
      $(flipbookRef.current).turn('previous')
    }
  }

  const goToPage = (catalogPageNumber: number) => {
    const $ = window.$
    if ($ && flipbookRef.current) {
      // The catalog page numbers in the dropdown are the actual printed page numbers
      // page-001.jpg = Cover
      // page-002.jpg = blank/inside cover 
      // page-003.jpg = Page 1 (table of contents)
      // page-004.jpg = Page 2
      // page-005.jpg = Page 3
      // page-006.jpg = Page 4 (first desking page)
      
      // So catalog page 4 should show page-006.jpg which is Turn.js page 6
      // We need to add 2 to account for cover + inside cover
      const turnJsPage = catalogPageNumber + 2
      $(flipbookRef.current).turn('page', turnJsPage)
      setActiveDropdown(null)
    }
  }


  // Generate pages HTML
  const generatePages = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <div key={i} className="page" style={{ backgroundColor: 'white' }}>
          <img 
            src={`/catalog-pages/page-${i.toString().padStart(3, '0')}.jpg`}
            alt={`Page ${i}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            loading="lazy"
          />
        </div>
      )
    }
    return pages
  }

  return (
    <>
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-slate-800 flex flex-col"
      style={{ zIndex: 30 }}
    >
      {/* Navigation Bar */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 relative" style={{ zIndex: 40 }}>
        <div className="max-w-7xl mx-auto">
          {/* Catalog Index Header */}
          <div className="text-center mb-2">
            <h2 className="text-white text-sm font-bold uppercase tracking-wider">CATALOG INDEX</h2>
          </div>
          {/* Navigation Dropdowns */}
          <div className="flex items-center justify-center gap-6">
            {/* Desking Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'desking' ? null : 'desking')}
                className="text-yellow-500 hover:text-yellow-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2"
              >
                Desking
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'desking' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'desking' && (
                <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] border border-slate-700" style={{ zIndex: 41 }}>
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
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'panels' ? null : 'panels')}
                className="text-blue-500 hover:text-blue-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2"
              >
                Panels
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'panels' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'panels' && (
                <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] border border-slate-700" style={{ zIndex: 41 }}>
                  <button onClick={() => goToPage(56)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">56-59: Webb Panels</button>
                  <button onClick={() => goToPage(60)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">60-61: Borders</button>
                  <button onClick={() => goToPage(62)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">62: SpaceMax Panels</button>
                  <button onClick={() => goToPage(63)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">63: Drawing Services</button>
                </div>
              )}
            </div>

            {/* Tables Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'tables' ? null : 'tables')}
                className="text-green-500 hover:text-green-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2"
              >
                Tables
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'tables' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'tables' && (
                <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] border border-slate-700" style={{ zIndex: 41 }}>
                  <button onClick={() => goToPage(66)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">66-67: Gathering Tables</button>
                  <button onClick={() => goToPage(68)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">68-71: Training Room</button>
                  <button onClick={() => goToPage(73)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">73-78: Conference Tables</button>
                  <button onClick={() => goToPage(79)} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">79-83: Occasional Tables</button>
                </div>
              )}
            </div>

            {/* Seating Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'seating' ? null : 'seating')}
                className="text-red-500 hover:text-red-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2"
              >
                Seating
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'seating' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'seating' && (
                <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] border border-slate-700" style={{ zIndex: 41 }}>
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
        </div>
      </div>

      {/* Flipbook Container */}
      <div className="flex-1 relative flex items-center justify-center p-4 pb-16 md:p-8 md:pb-20">
        {!isReady ? (
          <div className="text-white text-2xl font-bold">Loading Catalog...</div>
        ) : (
        <>
          <div 
            ref={flipbookRef}
            id="flipbook"
            className="flipbook"
            style={{
              position: 'relative',
              touchAction: 'pan-y pinch-zoom', // Allow vertical scrolling and pinch-to-zoom
              userSelect: 'none',
              WebkitUserSelect: 'none',
              zIndex: 1
            }}
          >
            {generatePages()}
          </div>

          {/* Navigation */}
          <button
            onClick={prevPage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextPage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

        </>
        )}
      </div>

      <style jsx global>{`
        .flipbook {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        .flipbook[style*="cursor: grab"] {
          cursor: grab !important;
        }
        
        .flipbook[style*="cursor: grabbing"] {
          cursor: grabbing !important;
        }
        
        .flipbook .page {
          background-color: white !important;
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
          pointer-events: none; /* Prevent image drag */
        }
        
        .flipbook .page img {
          pointer-events: none; /* Prevent image drag */
          -webkit-user-drag: none;
          user-drag: none;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        /* Fix for Turn.js flip rendering on mobile */
        .flipbook .turn-page {
          background-color: white !important;
        }
        
        .flipbook .page-wrapper {
          background-color: white !important;
          width: 100%;
          height: 100%;
        }
        
        /* Ensure pages are visible during flip */
        .flipbook .shadow,
        .flipbook .gradient {
          opacity: 0.5 !important;
        }
        
        .flipbook .hard {
          background: #ccc !important;
          color: #333;
          font-weight: bold;
        }
        
        .flipbook .even {
          background: white !important;
        }
        
        .flipbook .odd {
          background: white !important;
        }
      `}</style>
    </div>

    {/* Static page indicator below catalog */}
    <div className="bg-slate-800 text-center py-3" style={{ zIndex: 30 }}>
      <div className="bg-black/60 text-white px-4 py-2 rounded-full inline-block text-sm md:text-base">
        {currentPage === 1 ? 'Cover' : 
         currentPage === 2 ? 'Inside Cover' :
         `Page ${currentPage - 2} of ${totalPages - 2}`}
      </div>
    </div>
    </>
  )
}