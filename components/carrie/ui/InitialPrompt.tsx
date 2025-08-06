'use client'

import BouncingEmoji from './BouncingEmoji'

interface InitialPromptProps {
  onShowPassword: () => void
}

export default function InitialPrompt({ onShowPassword }: InitialPromptProps) {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden cursor-pointer"
      onClick={onShowPassword}
      onKeyDown={onShowPassword}
      tabIndex={0}
    >
      {/* DVD Bouncing emojis */}
      <div className="absolute inset-0 overflow-hidden">
        <BouncingEmoji emoji="🎃" delay={0} />
        <BouncingEmoji emoji="🇺🇸" delay={0.5} />
        <BouncingEmoji emoji="🎃" delay={1} />
        <BouncingEmoji emoji="🇺🇸" delay={1.5} />
        <BouncingEmoji emoji="🔨" delay={2} />
        <BouncingEmoji emoji="🛠️" delay={2.5} />
        
        {/* Floating text message */}
        <div className="absolute top-3/4 right-1/4 text-white/80 font-bold text-lg animate-pulse" style={{ animationDelay: '1s' }}>
          🇺🇸 May Your Business Prosper! 🇺🇸
        </div>
      </div>
      
      {/* Main prompt */}
      <div className="text-center z-10">
        <h1 className="text-3xl md:text-4xl font-black text-white animate-pulse">
          FIRE THE EDITOR, BOSS?
        </h1>
      </div>
    </div>
  )
}