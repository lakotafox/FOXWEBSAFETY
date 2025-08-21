'use client'

import { useState, useEffect } from 'react'
import { getCloudinaryConfig, saveCloudinaryConfig } from '@/lib/cloudinary-config'

export default function CloudinarySettings() {
  const [isOpen, setIsOpen] = useState(false)
  const [cloudName, setCloudName] = useState('')
  const [uploadPreset, setUploadPreset] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    const config = getCloudinaryConfig()
    if (config.cloudName && config.uploadPreset) {
      setCloudName(config.cloudName)
      setUploadPreset(config.uploadPreset)
      setIsConfigured(true)
    }
  }, [])

  const handleSave = () => {
    if (cloudName && uploadPreset) {
      saveCloudinaryConfig(cloudName, uploadPreset)
      setIsConfigured(true)
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`px-6 py-3 rounded-lg font-bold text-lg transition-all shadow-xl ${
          isConfigured 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-yellow-500 hover:bg-yellow-600 text-black animate-pulse'
        }`}
      >
        {isConfigured ? '☁️ Cloudinary Ready' : '⚠️ Setup Cloudinary'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
          <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Cloudinary Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cloud Name
                </label>
                <input
                  type="text"
                  value={cloudName}
                  onChange={(e) => setCloudName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 text-white rounded border border-slate-600 focus:border-yellow-500 focus:outline-none"
                  placeholder="your-cloud-name"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Found in your Cloudinary dashboard
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Upload Preset (Unsigned)
                </label>
                <input
                  type="text"
                  value={uploadPreset}
                  onChange={(e) => setUploadPreset(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 text-white rounded border border-slate-600 focus:border-yellow-500 focus:outline-none"
                  placeholder="your-upload-preset"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Create in Settings {'>'} Upload {'>'} Add upload preset (Unsigned)
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!cloudName || !uploadPreset}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black disabled:text-gray-400 font-bold py-2 px-4 rounded transition-all"
              >
                Save Settings
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}