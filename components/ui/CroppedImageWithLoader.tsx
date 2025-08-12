'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface CroppedImageWithLoaderProps {
  src: string
  alt: string
  width?: number
  height?: number
  crop?: { scale: number; x: number; y: number }
  className?: string
  unoptimized?: boolean
  draggable?: boolean
  style?: React.CSSProperties
}

export default function CroppedImageWithLoader({
  src,
  alt,
  width = 500,
  height = 500,
  crop = { scale: 1, x: 50, y: 50 },
  className,
  unoptimized,
  draggable = true,
  style
}: CroppedImageWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageReady, setImageReady] = useState(false)
  const [minimumTimePassed, setMinimumTimePassed] = useState(false)
  const [loadingFrame, setLoadingFrame] = useState(0)
  
  // Check if image is already cached
  useEffect(() => {
    const img = new window.Image()
    img.src = src
    
    // If image is already cached (complete and naturalHeight > 0), skip loading
    if (img.complete && img.naturalHeight > 0) {
      setIsLoading(false)
      setImageReady(true)
      setMinimumTimePassed(true)
    }
  }, [src])
  
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
  
  // Ensure minimum time for one full animation cycle (27 frames * 50ms = 1350ms)
  // Only apply minimum time if we're actually loading
  useEffect(() => {
    if (!isLoading) return // Skip timer if not loading
    
    const timer = setTimeout(() => {
      setMinimumTimePassed(true)
    }, frames.length * 50) // One complete animation cycle
    
    return () => clearTimeout(timer)
  }, [frames.length, isLoading])
  
  // Hide loading when both image is ready AND minimum time has passed
  useEffect(() => {
    if (imageReady && minimumTimePassed) {
      setIsLoading(false)
    }
  }, [imageReady, minimumTimePassed])
  
  // Animate loading frames
  useEffect(() => {
    if (!isLoading) return
    
    const interval = setInterval(() => {
      setLoadingFrame((prev) => (prev + 1) % frames.length)
    }, 50)
    
    return () => clearInterval(interval)
  }, [isLoading, frames.length])

  return (
    <>
      {/* Loading state - OUTSIDE the transform container */}
      {isLoading && (
        <div className="absolute inset-0 bg-black z-10 pointer-events-none" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', willChange: 'auto' }}>
            <div className="flex flex-col items-center">
              <video 
                className="block w-20 h-20 md:w-32 md:h-32 opacity-70"
                autoPlay={true}
                loop={true}
                muted={true}
                playsInline={true}
                controls={false}
                preload="auto"
                data-playsinline="true"
                webkit-playsinline="true"
                x5-playsinline="true"
                x5-video-player-type="h5"
                x5-video-player-fullscreen="false"
              >
                <source src="/foxloading.webm" type="video/webm" />
              </video>
              <div className="mt-2 px-2 text-white text-xs md:text-lg font-mono font-bold tracking-wider text-center whitespace-nowrap overflow-visible">
                {frames[loadingFrame]}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Image with crop transform */}
      <div 
        className="absolute inset-0"
        style={{
          transform: `translate(${crop.x - 50}%, ${crop.y - 50}%) scale(${crop.scale})`,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      >
        <Image 
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          unoptimized={unoptimized}
          onLoad={() => setImageReady(true)}
          draggable={draggable}
          style={style}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
    </>
  )
}