'use client'

import { Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface YellowHeaderProps {
  onMobilePreview: () => void
  onPublish: () => void
}

export default function YellowHeader({ onMobilePreview, onPublish }: YellowHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black p-2 border-b-4 border-yellow-600">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Edit2 className="w-5 h-5" />
          <span className="font-bold text-sm sm:text-base">PRODUCTS EDITOR</span>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <Button
            onClick={onMobilePreview}
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-6 py-3 text-lg"
          >
            📱 Mobile Preview
          </Button>
          <Button
            onClick={onPublish}
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-8 py-3 text-lg"
          >
            🚀 Publish
          </Button>
        </div>
      </div>
    </div>
  )
}