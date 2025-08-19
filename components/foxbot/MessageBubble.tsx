import { Message } from '@/lib/foxbot/conversation-engine-v2'
import QuickActions from './QuickActions'

interface MessageBubbleProps {
  message: Message
  onQuickAction?: (action: 'call' | 'message' | 'website') => void
  showWebsiteButton?: boolean
}

export default function MessageBubble({ message, onQuickAction, showWebsiteButton = false }: MessageBubbleProps) {
  const isBot = message.sender === 'bot'
  const showQuickActions = isBot && message.text === "Quick Actions:"

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
      <div className={`flex items-start gap-3 max-w-[70%] ${isBot ? '' : 'flex-row-reverse'}`}>
        {isBot && (
          <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-sm">FB</span>
          </div>
        )}
        
        <div
          className={`px-4 py-3 rounded-2xl ${
            isBot
              ? 'bg-gray-800 text-white rounded-tl-none'
              : 'bg-yellow-500 text-black rounded-tr-none'
          }`}
        >
          {showQuickActions ? (
            <div>
              <p className="mb-2">Connect with our team:</p>
              {onQuickAction && (
                <QuickActions onAction={onQuickAction} showWebsiteButton={showWebsiteButton} />
              )}
            </div>
          ) : (
            <div>
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
              <span className={`text-xs ${isBot ? 'text-gray-400' : 'text-black/60'} mt-1 block`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}