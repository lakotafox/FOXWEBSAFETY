'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone, MapPin, MessageSquare, X } from 'lucide-react'
import ChatInterface from '@/components/foxbot/ChatInterface'

export default function FoxbotPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-2xl font-black animate-pulse">
          INITIALIZING FOXBOT...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="border-b-2 border-yellow-500 px-4 py-3 flex items-center justify-between bg-black/90 backdrop-blur">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-white hover:text-yellow-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold">BACK</span>
        </button>

        <h1 className="text-2xl font-black text-yellow-500 tracking-wider">
          FOXBOT
        </h1>

        <div className="w-20"></div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 p-4 border-b border-yellow-500/20">
        <a
          href="tel:+18777693768"
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold transition-colors"
        >
          <Phone className="w-5 h-5" />
          <span>CALL</span>
        </a>
        
        <a
          href="https://maps.google.com/?q=FOXBUILT+Office+Furniture"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold transition-colors"
        >
          <MapPin className="w-5 h-5" />
          <span>MAPS</span>
        </a>
        
        <button
          onClick={() => setShowContactForm(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold transition-colors"
          data-message-button
        >
          <MessageSquare className="w-5 h-5" />
          <span>MESSAGE</span>
        </button>
      </div>

      <ChatInterface />

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowContactForm(false)}
              className="absolute top-4 right-4 text-white hover:text-yellow-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-black text-yellow-500 mb-6">CONTACT FOXBUILT</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-white text-sm font-bold mb-2">NAME</label>
                <input
                  type="text"
                  className="w-full bg-black border-2 border-yellow-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-yellow-400"
                  placeholder="Your Name"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-bold mb-2">EMAIL</label>
                <input
                  type="email"
                  className="w-full bg-black border-2 border-yellow-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-yellow-400"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-bold mb-2">PHONE</label>
                <input
                  type="tel"
                  className="w-full bg-black border-2 border-yellow-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-yellow-400"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-bold mb-2">MESSAGE</label>
                <textarea
                  className="w-full bg-black border-2 border-yellow-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-yellow-400 h-32 resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-lg transition-colors"
              >
                SEND MESSAGE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}