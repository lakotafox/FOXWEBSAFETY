'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HelpModalProps {
  show: boolean
  onClose: () => void
}

export default function HelpModal({ show, onClose }: HelpModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-slate-900">HEY POPS 👋</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
            <h3 className="font-bold text-xl mb-3 text-blue-900 text-center">Here is a quick guide</h3>
            <p className="text-blue-800 text-lg text-center">
              :Hover mouse over image to see edit options.
            </p>
            <p className="text-blue-800 text-lg mt-2 text-center">
              :Use lock 🔒 to resize and position images.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-2xl mb-4 text-slate-900 text-center">EDIT Image Controls</h3>
            <div className="space-y-4 text-gray-700">
              <p className="text-lg text-center">
                :when lock is <span className="text-green-600 font-bold">GREEN</span> 🟢 use ⬆️⬇️⬅️➡️ to move the image
              </p>
              <p className="text-lg text-center">
                :when lock is <span className="text-green-600 font-bold">GREEN</span> 🟢 use Scroll Wheel to Zoom in/out
              </p>
              <p className="text-lg text-center">
                :when you are done resizing your image lock it! (Click lock <span className="text-red-600 font-bold">RED</span> 🔴)
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-2xl mb-4 text-slate-900 text-center">💾 Publishing Changes</h3>
            <div className="space-y-4 text-gray-700">
              <p className="text-lg text-center">
                <span className="text-2xl">1️⃣:</span> Make all your changes to products and images
              </p>
              <p className="text-lg text-center">
                <span className="text-2xl">2️⃣:</span> Click the <strong>"Publish"</strong> button at the top
              </p>
              <p className="text-lg text-center">
                <span className="text-2xl">3️⃣:</span> Wait <strong>60 seconds</strong> for changes to build and go live
              </p>
              <p className="text-lg text-center">
                <span className="text-2xl">4️⃣:</span> Your updates will be available!
              </p>
            </div>
          </div>

          <div className="text-center pt-6">
            <Button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-bold"
            >
              Got it! 👍
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}