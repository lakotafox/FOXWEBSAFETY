'use client'

import { Button } from '@/components/ui/button'

interface MobilePreviewHelpProps {
  show: boolean
  onClose: () => void
}

export default function MobilePreviewHelp({ show, onClose }: MobilePreviewHelpProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-center items-center mb-6">
          <h2 className="text-3xl font-black text-slate-900">📱 MOBILE PREVIEW GUIDE</h2>
        </div>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-xl mb-6">Quick way to check mobile view:</p>
            <div className="bg-blue-50 border-2 border-blue-600 p-4 rounded-lg inline-block">
              <p className="text-2xl font-bold text-blue-900">Press Ctrl+Shift+M to toggle mobile preview mode!</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-600 p-6 rounded-lg">
            <p className="text-lg text-yellow-900 mb-4">So PLEASE can you check how it looks on both before publishing.</p>
            
            <p className="text-lg text-yellow-900 mb-3">An image might be:</p>
            
            <ul className="text-lg text-yellow-900 mb-4 ml-4 space-y-1">
              <li>• zoomed differently</li>
              <li>• cut off</li>
              <li>• or not filling the shape nicely, for example.</li>
            </ul>
            <p className="text-lg text-yellow-900 mb-3">Find the way that makes it look good for both</p>
            
            <p className="text-lg text-yellow-900">GOODLUCK! Have fun.</p>
          </div>

          <div className="text-center pt-6">
            <Button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-bold"
            >
              I CAN DO THIS! 👍
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}