import { Phone, MessageSquare, Home } from 'lucide-react'

interface QuickActionsProps {
  onAction: (action: 'call' | 'message' | 'website') => void
  showWebsiteButton?: boolean
}

export default function QuickActions({ onAction, showWebsiteButton = false }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <button
        onClick={() => onAction('call')}
        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold text-sm transition-colors"
      >
        <Phone className="w-4 h-4" />
        Call Now
      </button>
      
      <button
        onClick={() => onAction('message')}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        Send Message
      </button>
      
      {showWebsiteButton && (
        <button
          onClick={() => onAction('website')}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Website
        </button>
      )}
    </div>
  )
}