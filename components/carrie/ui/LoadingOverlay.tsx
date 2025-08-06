'use client'

interface LoadingOverlayProps {
  show: boolean
  type: 'default' | 'publish'
  publishMessage?: string
}

export default function LoadingOverlay({ show, type, publishMessage }: LoadingOverlayProps) {
  if (!show) return null

  if (type === 'publish') {
    return (
      <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center pointer-events-auto" style={{ pointerEvents: 'all' }}>
        {/* Fox loading video */}
        <video 
          className="w-64 h-64 mb-8"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/foxloading.webm" type="video/webm" />
        </video>
        
        {/* Construction message */}
        <div className="text-white text-xl font-bold animate-pulse mb-8">
          {publishMessage}
        </div>
        
        {/* Game prompt */}
        <div className="text-white text-lg">
          Want to play a game while you wait?
          <button
            onClick={() => window.open('/games', '_blank')}
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
      {/* Fox loading video only */}
      <video 
        className="w-64 h-64"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/foxloading.webm" type="video/webm" />
      </video>
    </div>
  )
}