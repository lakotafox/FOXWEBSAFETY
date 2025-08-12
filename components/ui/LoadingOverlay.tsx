'use client'

import { useState, useEffect, useRef } from 'react'

interface LoadingOverlayProps {
  show: boolean
  type?: 'default' | 'upload' | 'publish'
  publishMessage?: string
  onPlayGame?: () => void
}

export default function LoadingOverlay({ 
  show, 
  type = 'default', 
  publishMessage,
  onPlayGame 
}: LoadingOverlayProps) {
  const [canPlayVideo, setCanPlayVideo] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  useEffect(() => {
    if (show && videoRef.current) {
      // Try to play the video to detect if autoplay is blocked
      videoRef.current.play()
        .then(() => {
          setCanPlayVideo(true)
        })
        .catch(() => {
          // Autoplay blocked (likely low power mode)
          setCanPlayVideo(false)
        })
    }
  }, [show])
  
  if (!show) return null

  if (type === 'publish') {
    return (
      <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center pointer-events-auto" style={{ pointerEvents: 'all' }}>
        {canPlayVideo ? (
          <video 
            ref={videoRef}
            className="w-64 h-64 mb-8"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/foxloading.webm" type="video/webm" />
          </video>
        ) : (
          <div className="w-64 h-64 mb-8 relative">
            <img 
              src="/FOXLOADINGSTATIC.png" 
              alt="Loading"
              className="w-full h-full animate-pulse"
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, slowSpin 4s linear infinite'
              }}
            />
            <style jsx>{`
              @keyframes slowSpin {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        )}
        
        <div className="text-white text-xl font-bold animate-pulse mb-8">
          {publishMessage}
        </div>
        
        <div className="text-white text-lg">
          Want to play a game while you wait?
          <button
            onClick={onPlayGame || (() => window.open('/games', '_blank'))}
            className="ml-3 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded transition-all"
          >
            YES
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center pointer-events-auto" style={{ pointerEvents: 'all' }}>
      {canPlayVideo ? (
        <video 
          ref={type === 'default' ? videoRef : undefined}
          className="w-64 h-64"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/foxloading.webm" type="video/webm" />
        </video>
      ) : (
        <div className="w-64 h-64 relative">
          <img 
            src="/FOXLOADINGSTATIC.png" 
            alt="Loading"
            className="w-full h-full animate-pulse"
            style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, slowSpin 4s linear infinite'
            }}
          />
          <style jsx>{`
            @keyframes slowSpin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}