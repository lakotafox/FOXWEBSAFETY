'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ImageWithLoaderProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  unoptimized?: boolean
  style?: React.CSSProperties
  onLoadComplete?: () => void
  hideLoadingAnimation?: boolean
}

export default function ImageWithLoader({
  src,
  alt,
  width,
  height,
  fill,
  className,
  sizes,
  priority,
  unoptimized,
  style,
  onLoadComplete,
  hideLoadingAnimation = false
}: ImageWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageReady, setImageReady] = useState(false)
  const [minimumTimePassed, setMinimumTimePassed] = useState(false)
  const [loadingFrame, setLoadingFrame] = useState(0)
  
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
  
  // Ensure minimum 1 second loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumTimePassed(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Hide loading when both image is ready AND minimum time has passed
  useEffect(() => {
    if (imageReady && minimumTimePassed) {
      setIsLoading(false)
      // Call onLoadComplete after we've set loading to false
      if (onLoadComplete) {
        // Use setTimeout to ensure it's called after state update
        setTimeout(() => {
          onLoadComplete()
        }, 0)
      }
    }
  }, [imageReady, minimumTimePassed]) // Intentionally exclude onLoadComplete to prevent infinite loops
  
  // Animate loading frames
  useEffect(() => {
    if (!isLoading) return
    
    const interval = setInterval(() => {
      setLoadingFrame((prev) => (prev + 1) % frames.length)
    }, 50) // Fast animation - 50ms per frame
    
    return () => clearInterval(interval)
  }, [isLoading, frames.length])

  return (
    <>
      {/* Loading state with fox animation - only show if not hidden */}
      {isLoading && !hideLoadingAnimation && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
          <video 
            className="w-1/2 h-1/2 max-w-48 max-h-48 opacity-70"
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
          <div className="mt-2 px-2 text-white text-xs md:text-lg font-mono font-bold tracking-wider overflow-visible whitespace-nowrap">
            {frames[loadingFrame]}
          </div>
        </div>
      )}
      
      {/* Actual image */}
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
          unoptimized={unoptimized}
          style={{
            ...style,
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onLoad={() => setImageReady(true)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 500}
          height={height || 500}
          className={className}
          sizes={sizes}
          priority={priority}
          unoptimized={unoptimized}
          style={{
            ...style,
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onLoad={() => setImageReady(true)}
        />
      )}
    </>
  )
}