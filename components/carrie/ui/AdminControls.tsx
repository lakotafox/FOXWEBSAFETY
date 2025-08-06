'use client'

import { Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminControlsProps {
  onPublish: () => void
  onMobilePreview: () => void
}

export default function AdminControls({ onPublish, onMobilePreview }: AdminControlsProps) {
  return (
    <div className="bg-green-600 text-white p-2">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            <span className="font-bold text-sm sm:text-base">MAIN PAGE EDITOR</span>
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
    </div>
  )
}