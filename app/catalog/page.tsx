'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function CatalogPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-black border-b-4 border-yellow-500 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-white hover:text-yellow-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-black">BACK TO HOME</span>
        </button>

        <h1 className="text-2xl font-black text-white">
          PRODUCT CATALOG
        </h1>

        <div className="w-10"></div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-50">
          <div className="text-white text-xl font-black">LOADING CATALOG...</div>
        </div>
      )}

      {/* Embedded Catalog */}
      <div className="flex-1 relative">
        {/* FoxBuilt Logo Watermark - positioned in top right corner */}
        <div className="absolute top-4 right-4 z-50 pointer-events-none">
          <img 
            src="/images/foxbuilt-logo.png" 
            alt="FoxBuilt" 
            className="h-10 w-auto"
          />
        </div>
        
        <iframe
          src="https://online.fliphtml5.com/hxniv/gevh/"
          className="w-full h-full"
          style={{ minHeight: 'calc(100vh - 80px)' }}
          frameBorder="0"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  )
}