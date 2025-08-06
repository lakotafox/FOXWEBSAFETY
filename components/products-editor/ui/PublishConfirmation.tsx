'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PublishConfirmationProps {
  isOpen: boolean
  publishStatus: string
  publishError: boolean
  onClose: () => void
  onConfirm: (token: string) => void
}

export default function PublishConfirmation({
  isOpen,
  publishStatus,
  publishError,
  onClose,
  onConfirm
}: PublishConfirmationProps) {
  const [githubToken, setGithubToken] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4 border-4 border-slate-800">
        <h2 className="text-2xl font-black mb-4">PUBLISH TO GITHUB</h2>
        
        {!publishStatus ? (
          <>
            <p className="text-slate-600 mb-6">
              This will update the live products catalog on your website. Make sure all changes are final.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">GitHub Token</label>
              <input
                type="password"
                placeholder="Enter your GitHub personal access token"
                className="w-full p-3 border-2 border-slate-300 rounded"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Token needs repo write permissions
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={() => onConfirm(githubToken)}
                disabled={!githubToken}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                Publish Now
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={`p-4 rounded ${publishError ? 'bg-red-100' : 'bg-green-100'} mb-6`}>
              <p className={`font-semibold ${publishError ? 'text-red-800' : 'text-green-800'}`}>
                {publishStatus}
              </p>
            </div>
            
            <Button
              onClick={onClose}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold"
            >
              Close
            </Button>
          </>
        )}
      </div>
    </div>
  )
}