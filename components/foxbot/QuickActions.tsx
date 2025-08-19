import { Phone, MessageSquare } from 'lucide-react'

interface QuickActionsProps {
  onAction: (action: 'call' | 'message') => void
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="flex gap-2 mt-2">
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
    </div>
  )
}