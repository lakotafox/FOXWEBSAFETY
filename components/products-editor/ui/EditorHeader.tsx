'use client'

import { Button } from '@/components/ui/button'
import { Save, X, Check, Maximize2, HelpCircle } from 'lucide-react'

interface EditorHeaderProps {
  onSave: () => void
  onPublish: () => void
  onMaximize: () => void
  onClose: () => void
  onHelp: () => void
}

export default function EditorHeader({ onSave, onPublish, onMaximize, onClose, onHelp }: EditorHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 shadow-2xl border-b-4 border-yellow-400">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-wide">PRODUCTS CATALOG EDITOR</h1>
          <p className="text-yellow-400 text-sm font-semibold mt-1">
            Edit products for the /products page
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Save className="w-5 h-5" />
            Save Draft
          </Button>
          
          <Button
            onClick={onPublish}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Check className="w-5 h-5" />
            Publish to GitHub
          </Button>
          
          <Button
            onClick={onHelp}
            variant="outline"
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-slate-900 font-bold px-4 py-3"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={onMaximize}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-slate-900 font-bold px-4 py-3"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold px-4 py-3"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}