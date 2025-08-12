'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface GalleryPreviewProps {
  previewImage?: string
}

export default function GalleryPreview({ previewImage = '/images/conference-room.jpg' }: GalleryPreviewProps) {
  const router = useRouter()

  return (
    <section id="gallery" className="py-20 bg-zinc-100">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-black text-center text-slate-800 mb-12 tracking-tight">
          OUR <span className="text-blue-400">GALLERY</span>
        </h2>
        
        <div className="max-w-4xl mx-auto">
          {/* Preview Image */}
          <div className="relative h-96 border-8 border-slate-700 bg-black overflow-hidden rounded-lg mb-8 group cursor-pointer"
               onClick={() => router.push('/gallery')}>
            <Image
              src={previewImage}
              alt="Gallery preview"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-white text-3xl font-black mb-4">VIEW FULL GALLERY</h3>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg flex items-center gap-3 mx-auto transition-all duration-300 hover:scale-105"
                >
                  EXPLORE
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-center text-slate-600 text-lg">
            Discover our showroom and installations. Click above to view the full gallery.
          </p>
        </div>
      </div>
    </section>
  )
}