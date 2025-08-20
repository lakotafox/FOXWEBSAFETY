'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import MessageBubble from './MessageBubble'
import VoiceControls from './VoiceControls'
import TypingIndicator from './TypingIndicator'
import ProductCard from './ProductCard'
import { Message } from '@/lib/foxbot/conversation-engine-v2'
import { sendMessageToGemini, GeminiResponse } from '@/lib/foxbot/gemini-client'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello, I'm FOXBOT. How can I help?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [ollamaAvailable, setOllamaAvailable] = useState(false)
  const [lastResponseOffline, setLastResponseOffline] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    
    const cleanText = text.replace(/[*_~`]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    window.speechSynthesis.speak(utterance)
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    setTimeout(async () => {
      const response = await sendMessageToGemini(inputValue)
      const products = response.products || []

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
        products
      }

      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)

      if (speechEnabled) {
        speakText(response.response)
      }

      // Check if FOXBOT is offline and show buttons
      if (response.showOfflineButtons) {
        setLastResponseOffline(true)
        setTimeout(() => {
          const actionMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "Quick Actions:",
            sender: 'bot',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, actionMessage])
        }, 500)
      }
      // Check for new button flags from FOXBOT
      else if (response.showContactButtons || response.showCatalogButton) {
        setLastResponseOffline(false)
        // Add quick action buttons
        setTimeout(() => {
          const actionMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "Quick Actions:",
            sender: 'bot',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, actionMessage])
        }, 500)
      }
      // Check if response suggests contacting human specialist
      else if (response.response.includes("I'll connect you with Kyle or Cyndee") ||
          response.response.toLowerCase().includes('877') || 
          response.response.toLowerCase().includes('sales team') ||
          response.response.toLowerCase().includes('human specialist') ||
          response.response.toLowerCase().includes('call or message') ||
          response.response.toLowerCase().includes('contact buttons below') ||
          response.response.toLowerCase().includes('reach our team')) {
        setLastResponseOffline(false)
        // Add a quick action button in the chat
        setTimeout(() => {
          const actionMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "Quick Actions:",
            sender: 'bot',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, actionMessage])
        }, 500)
      } else {
        setLastResponseOffline(false)
      }
    }, 1000)
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-900 to-black">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <MessageBubble 
              message={message} 
              onQuickAction={(action) => {
                if (action === 'call') {
                  window.location.href = 'tel:+18777693768'
                } else if (action === 'message') {
                  // Trigger the contact form or messaging interface
                  const messageButton = document.querySelector('[data-message-button]') as HTMLElement
                  messageButton?.click()
                } else if (action === 'website') {
                  window.location.href = '/'
                }
              }}
              showWebsiteButton={lastResponseOffline && message.text === "Quick Actions:"}
            />
            {message.products && message.products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 ml-0 md:ml-12">
                {message.products.map((product, index) => (
                  <ProductCard key={`${message.id}-${product.id}-${index}`} product={product} />
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-yellow-500/30 bg-black/50 backdrop-blur p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={toggleListening}
            disabled={!voiceEnabled}
            className={`p-3 rounded-lg transition-all ${
              voiceEnabled
                ? isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message or click the mic to speak..."
            className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500 text-black px-6 py-3 rounded-lg font-bold transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <VoiceControls
          voiceEnabled={voiceEnabled}
          setVoiceEnabled={setVoiceEnabled}
          speechEnabled={speechEnabled}
          setSpeechEnabled={setSpeechEnabled}
        />
      </div>
    </div>
  )
}