'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Maximize2, Minimize2 } from 'lucide-react'

export default function CatalogFlipBook() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const flipContainerRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  
  const totalPages = 148

  // Helper function to navigate to a specific catalog page
  const goToPage = (catalogPageNumber: number) => {
    // catalogPageNumber is 1-based (actual page number in the catalog)
    // The flip book shows two pages behind what we expect, so we add 2
    // Then convert to 0-based index by subtracting 1
    // Net effect: add 1 to the catalog page number
    
    if (catalogPageNumber === 1) {
      setCurrentPage(0) // Cover
    } else {
      // Add 1 to compensate for the offset (catalogPageNumber + 2 - 1 for 0-based = +1)
      const targetIndex = catalogPageNumber + 1
      
      // For spreads, we want the left page to be odd-indexed (1, 3, 5, 87, etc.)
      // If target is even-indexed, subtract 1 to get the odd left page
      if (targetIndex % 2 === 0) {
        setCurrentPage(targetIndex - 1)
      } else {
        setCurrentPage(targetIndex)
      }
    }
  }

  // Preload nearby images only
  useEffect(() => {
    const preloadImage = (pageNum: number) => {
      if (pageNum >= 0 && pageNum < totalPages) {
        const img = new Image()
        img.src = `/catalog-pages/page-${(pageNum + 1).toString().padStart(3, '0')}.jpg`
      }
    }

    // Preload current and nearby pages
    for (let i = -2; i <= 4; i++) {
      preloadImage(currentPage + i)
    }
  }, [currentPage])

  const getPageUrl = (pageNum: number) => {
    if (pageNum < 0 || pageNum >= totalPages) return ''
    // Map internal page numbers to actual file names
    // pageNum 0 = page-001.jpg (cover)
    // pageNum 1 = page-003.jpg (desking, skip page-002.jpg which is duplicate cover)
    // pageNum 2 = page-004.jpg 
    // etc.
    let fileIndex
    if (pageNum === 0) {
      fileIndex = 1 // page-001.jpg
    } else {
      fileIndex = pageNum + 2 // Skip page-002.jpg by adding 2 instead of 1
    }
    return `/catalog-pages/page-${fileIndex.toString().padStart(3, '0')}.jpg`
  }

  const flipNext = () => {
    if (isAnimatingRef.current || currentPage >= totalPages - 1) return
    
    isAnimatingRef.current = true
    const flipContainer = flipContainerRef.current
    if (!flipContainer) return

    // Add flip animation class
    flipContainer.classList.add('flipping-next')
    
    // Update page after animation completes
    setTimeout(() => {
      flipContainer.classList.remove('flipping-next')
      const newPage = currentPage === 0 ? 1 : Math.min(currentPage + 2, totalPages - 1)
      setCurrentPage(newPage)
      
      // Small delay to ensure state update completes
      setTimeout(() => {
        isAnimatingRef.current = false
      }, 50)
    }, 600)
  }

  const flipPrev = () => {
    if (isAnimatingRef.current || currentPage <= 0) return
    
    isAnimatingRef.current = true
    const flipContainer = flipContainerRef.current
    if (!flipContainer) return

    // Add flip animation class
    flipContainer.classList.add('flipping-prev')
    
    // Update page after animation completes
    setTimeout(() => {
      flipContainer.classList.remove('flipping-prev')
      const newPage = currentPage === 1 ? 0 : Math.max(currentPage - 2, 0)
      setCurrentPage(newPage)
      
      // Small delay to ensure state update completes
      setTimeout(() => {
        isAnimatingRef.current = false
      }, 50)
    }, 600)
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
      if (!isAnimatingRef.current) {
        if (e.key === 'ArrowRight') flipNext()
        if (e.key === 'ArrowLeft') flipPrev()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage])

  const isCover = currentPage === 0

  return (
    <div 
      ref={containerRef}
      className="catalog-flipbook relative w-full h-full bg-slate-800 overflow-hidden flex flex-col"
    >
      {/* Compact Navigation Bar */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-6">
            {/* Desking Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('desking')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className="text-yellow-500 hover:text-yellow-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2"
              >
                Desking
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'desking' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'desking' && (
                <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] z-[100] border border-slate-700">
                  <button onClick={() => { goToPage(4); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">04-28: Classic Laminate</button>
                  <button onClick={() => { goToPage(30); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">30-37: Elements Laminate</button>
                  <button onClick={() => { goToPage(38); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">38-39: Encore Collection</button>
                  <button onClick={() => { goToPage(40); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">40-45: Signature Collection</button>
                  <button onClick={() => { goToPage(48); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">48-49: Riser Series</button>
                  <button onClick={() => { goToPage(50); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">50-53: Height Adjustable</button>
                  <button onClick={() => { goToPage(140); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">140-143: Accessories</button>
                </div>
              )}
            </div>

            {/* Panels Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('panels')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className="text-blue-500 hover:text-blue-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2"
              >
                Panels
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'panels' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'panels' && (
                <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] z-[100] border border-slate-700">
                  <button onClick={() => { goToPage(56); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">56-59: Webb Panels</button>
                  <button onClick={() => { goToPage(60); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">60-61: Borders</button>
                  <button onClick={() => { goToPage(62); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">62: SpaceMax Panels</button>
                  <button onClick={() => { goToPage(63); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">63: Drawing Services</button>
                </div>
              )}
            </div>

            {/* Tables Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('tables')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className="text-green-500 hover:text-green-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2"
              >
                Tables
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'tables' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'tables' && (
                <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] z-[100] border border-slate-700">
                  <button onClick={() => { goToPage(66); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">66-67: Gathering Tables</button>
                  <button onClick={() => { goToPage(68); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">68-71: Training Room</button>
                  <button onClick={() => { goToPage(73); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">73-78: Conference Tables</button>
                  <button onClick={() => { goToPage(79); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">79-83: Occasional Tables</button>
                </div>
              )}
            </div>

            {/* Seating Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('seating')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className="text-red-500 hover:text-red-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-1 py-2"
              >
                Seating
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'seating' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'seating' && (
                <div className="absolute top-full left-0 mt-0 bg-slate-800 rounded-b shadow-xl py-2 min-w-[250px] z-[100] border border-slate-700">
                  <button onClick={() => { goToPage(86); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">86-89: Chair Guide</button>
                  <button onClick={() => { goToPage(90); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">90-98: Reception & Lounge</button>
                  <button onClick={() => { goToPage(99); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">99-113: Management</button>
                  <button onClick={() => { goToPage(114); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">114-121: Task</button>
                  <button onClick={() => { goToPage(122); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">122-123: Big & Tall</button>
                  <button onClick={() => { goToPage(124); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">124-125: Drafting</button>
                  <button onClick={() => { goToPage(126); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition-colors">126-139: Guest & Multi</button>
                </div>
              )}
            </div>
          </div>
          
          {/* Fullscreen button - positioned absolutely on the right */}
          <button
            onClick={toggleFullscreen}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Book Container */}
      <div className="flex-1 relative flex items-center justify-center p-8">
        <div 
          ref={flipContainerRef}
          className="flip-container"
          data-page={currentPage}
        >
          {isCover ? (
            /* Cover Page - Single */
            <div className="book-cover">
              {/* Underlying pages (pages 2-3, visible after flip) */}
              <div className="page-left page-under">
                <img
                  src={getPageUrl(1)}
                  alt="Page 2"
                  className="page-image"
                />
              </div>
              <div className="page-right page-under">
                <img
                  src={getPageUrl(2)}
                  alt="Page 3"
                  className="page-image"
                />
              </div>
              
              {/* Current cover page (positioned as right page) */}
              <div className="page-content page-current">
                <img
                  src={getPageUrl(0)}
                  alt="Cover"
                  className="page-image"
                />
              </div>
              
              {/* Flip page (hidden until animation) */}
              <div className="flip-page flip-page-cover">
                <div className="flip-face flip-face-front">
                  <img src={getPageUrl(0)} alt="Cover" className="page-image" />
                </div>
                <div className="flip-face flip-face-back">
                  <img src={getPageUrl(1)} alt="Page 2" className="page-image" />
                </div>
              </div>
            </div>
          ) : (
            /* Two-Page Spread */
            <div className="book-spread">
              {/* Underlying pages (visible during flip) */}
              {/* For NEXT flip: show the next spread underneath */}
              <div className="page-left page-under-next">
                {currentPage + 2 < totalPages && (
                  <img
                    src={getPageUrl(currentPage + 2)}
                    alt={`Page ${currentPage + 3}`}
                    className="page-image"
                  />
                )}
              </div>
              <div className="page-right page-under-next">
                {currentPage + 3 < totalPages && (
                  <img
                    src={getPageUrl(currentPage + 3)}
                    alt={`Page ${currentPage + 4}`}
                    className="page-image"
                  />
                )}
              </div>

              {/* For PREV flip: show the previous spread underneath */}
              <div className="page-left page-under-prev">
                {currentPage > 1 && currentPage - 2 >= 0 && (
                  <img
                    src={getPageUrl(currentPage - 2)}
                    alt={`Page ${currentPage - 1}`}
                    className="page-image"
                  />
                )}
              </div>
              <div className="page-right page-under-prev">
                {currentPage > 1 && currentPage - 1 >= 0 && (
                  <img
                    src={getPageUrl(currentPage - 1)}
                    alt={`Page ${currentPage}`}
                    className="page-image"
                  />
                )}
              </div>

              {/* Current visible pages */}
              {/* Left Page */}
              <div className="page-left page-current">
                <img
                  src={getPageUrl(currentPage)}
                  alt={`Page ${currentPage + 1}`}
                  className="page-image"
                />
              </div>

              {/* Spine */}
              <div className="book-spine" />

              {/* Right Page */}
              <div className="page-right page-current">
                {currentPage + 1 < totalPages ? (
                  <img
                    src={getPageUrl(currentPage + 1)}
                    alt={`Page ${currentPage + 2}`}
                    className="page-image"
                  />
                ) : (
                  <div className="page-blank">End</div>
                )}
              </div>

              {/* Flip pages (hidden until animation) */}
              {/* Next flip - Right page flipping */}
              <div className="flip-page flip-page-next">
                <div className="flip-face flip-face-front">
                  {currentPage + 1 < totalPages && (
                    <img src={getPageUrl(currentPage + 1)} alt="" className="page-image" />
                  )}
                </div>
                <div className="flip-face flip-face-back">
                  {currentPage + 2 < totalPages && (
                    <img src={getPageUrl(currentPage + 2)} alt="" className="page-image" />
                  )}
                </div>
              </div>

              {/* Prev flip - Left page flipping back */}
              <div className="flip-page flip-page-prev">
                <div className="flip-face flip-face-front">
                  <img src={getPageUrl(currentPage)} alt="" className="page-image" />
                </div>
                <div className="flip-face flip-face-back">
                  {currentPage - 1 >= 0 && (
                    <img src={getPageUrl(currentPage - 1)} alt="" className="page-image" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={flipPrev}
        disabled={currentPage === 0}
        className={`absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-opacity ${
          currentPage === 0 ? 'opacity-30 cursor-not-allowed' : ''
        }`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={flipNext}
        disabled={currentPage >= totalPages - 1}
        className={`absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-opacity ${
          currentPage >= totalPages - 1 ? 'opacity-30 cursor-not-allowed' : ''
        }`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>


      {/* CSS Styles */}
      <style jsx>{`
        .catalog-flipbook {
          font-family: system-ui, -apple-system, sans-serif;
        }

        .flip-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          height: 100%;
          max-height: 650px;
          perspective: 2000px;
          margin: 0 auto;
        }

        .book-cover,
        .book-spread {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .book-cover .page-content {
          position: absolute;
          width: 50%;
          height: 100%;
          background: white;
          border-radius: 0 8px 8px 0;
          box-shadow: 5px 0 20px rgba(0,0,0,0.1);
          padding: 8px;
          right: 0;
        }

        .book-cover .page-under {
          display: none !important;
        }

        .book-cover .page-current {
          z-index: 2;
        }


        .book-spread {
          gap: 2px;
        }

        .page-left,
        .page-right {
          flex: 1;
          height: 100%;
          background: white;
          position: absolute;
          width: 50%;
          padding: 8px;
        }

        .page-left {
          left: 0;
          border-radius: 8px 0 0 8px;
          box-shadow: -5px 0 20px rgba(0,0,0,0.1);
        }

        .page-right {
          right: 0;
          border-radius: 0 8px 8px 0;
          box-shadow: 5px 0 20px rgba(0,0,0,0.1);
        }

        .page-under-next,
        .page-under-prev {
          z-index: 1;
          display: none;
        }

        .page-current {
          z-index: 2;
        }

        /* Show correct underlying pages during flip */
        .flipping-next .page-under-next {
          display: block;
        }
        
        /* Hide the right page that's being flipped */
        .flipping-next .page-right.page-current {
          visibility: hidden;
        }
        
        .flipping-prev .page-under-prev {
          display: block;
        }
        
        /* Hide the left page that's being flipped back */
        .flipping-prev .page-left.page-current {
          visibility: hidden;
        }
        

        .book-spine {
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, #374151, #1f2937, #374151);
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .page-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .page-blank {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
        }

        /* Flip pages - hidden by default */
        .flip-page {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          transform-style: preserve-3d;
          display: none;
          z-index: 100;
        }

        .flip-page-next {
          right: 0;
          transform-origin: left center;
        }

        .flip-page-prev {
          left: 0;
          transform-origin: right center;
        }

        .flip-page-cover {
          position: absolute;
          width: 50%;
          height: 100%;
          right: 0;
          top: 0;
          transform-origin: left center;
          z-index: 100;
          transform-style: preserve-3d;
        }
        
        .flip-page-cover .flip-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          background: white;
          padding: 8px;
          border-radius: 0 8px 8px 0;
          box-shadow: 5px 0 20px rgba(0,0,0,0.1);
        }

        .flip-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          background: white;
          padding: 8px;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }

        .flip-face-front {
          z-index: 2;
        }

        .flip-face-back {
          transform: rotateY(180deg);
        }

        /* Animation states */
        .flipping-next .flip-page-next {
          display: block;
          animation: flipNextAnimation 0.6s ease-in-out;
        }

        .flipping-prev .flip-page-prev {
          display: block;
          animation: flipPrevAnimation 0.6s ease-in-out;
        }

        /* Cover flip animation */
        .book-cover.flipping-next .flip-page-cover,
        .flipping-next .book-cover .flip-page-cover {
          display: block;
          animation: flipCoverAnimation 0.6s ease-in-out;
        }

        @keyframes flipCoverAnimation {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }

        @keyframes flipNextAnimation {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }

        @keyframes flipPrevAnimation {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(180deg);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .flip-container {
            max-width: 100%;
          }
          
          .book-cover .page-content {
            width: 90vw;
            max-width: 450px;
            right: auto;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 8px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          }
          
          .flip-page-cover {
            width: 90vw;
            max-width: 450px;
            right: auto;
            left: 50%;
            transform-origin: left center;
          }
          
          @keyframes flipCoverAnimation {
            0% {
              transform: translateX(-50%) rotateY(0deg);
            }
            100% {
              transform: translateX(-50%) rotateY(-180deg);
            }
          }
        }
      `}</style>
    </div>
  )
}