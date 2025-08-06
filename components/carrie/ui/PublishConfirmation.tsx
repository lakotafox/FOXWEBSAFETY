'use client'

import { Button } from '@/components/ui/button'

interface PublishConfirmationProps {
  show: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function PublishConfirmation({ show, onConfirm, onCancel }: PublishConfirmationProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-sm w-full p-6">
        <h2 className="text-2xl font-black text-center mb-4 text-slate-900">
          Going back to main site?
        </h2>
        
        <div className="flex justify-center gap-4">
          <Button
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 text-white px-8"
          >
            Yes
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="px-8 border-gray-600 text-gray-800 hover:bg-gray-100 font-bold"
          >
            No
          </Button>
        </div>
      </div>
    </div>
  )
}