'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import BouncingEmoji from '../ui/BouncingEmoji'

interface PasswordScreenProps {
  onAuthenticate: () => void
}

export default function PasswordScreen({ onAuthenticate }: PasswordScreenProps) {
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "foxbuilt2025") {
      onAuthenticate()
    } else if (password === "goof") {
      window.location.href = '/games'
    } else {
      alert("Incorrect password")
      setPassword("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* DVD Bouncing emojis (faded) */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <BouncingEmoji emoji="🎃" delay={0} />
        <BouncingEmoji emoji="🇺🇸" delay={0.5} />
        <BouncingEmoji emoji="🎃" delay={1} />
        <BouncingEmoji emoji="🇺🇸" delay={1.5} />
        <BouncingEmoji emoji="🔨" delay={2} />
        <BouncingEmoji emoji="🛠️" delay={2.5} />
      </div>
      
      <Card className="max-w-2xl w-full bg-white/95 backdrop-blur shadow-2xl border-4 border-red-600">
        <CardContent className="p-12">
          {/* ASCII Art - FOX on mobile, FOXBUILT on desktop */}
          <pre className="text-red-600 font-mono text-xs text-center mb-8 font-bold block md:hidden">
{`███████╗  ██████╗  ██╗  ██╗
██╔════╝ ██╔═══██╗ ╚██╗██╔╝
█████╗   ██║   ██║  ╚███╔╝ 
██╔══╝   ██║   ██║  ██╔██╗ 
██║      ╚██████╔╝ ██╔╝ ██╗
╚═╝       ╚═════╝  ╚═╝  ╚═╝`}
          </pre>
          
          <pre className="text-red-600 font-mono text-sm text-center mb-8 font-bold hidden md:block">
{`███████╗  ██████╗  ██╗  ██╗ ██████╗  ██╗   ██╗ ██╗ ██╗   ████████╗
██╔════╝ ██╔═══██╗ ╚██╗██╔╝ ██╔══██╗ ██║   ██║ ██║ ██║   ╚══██╔══╝
█████╗   ██║   ██║  ╚███╔╝  ██████╔╝ ██║   ██║ ██║ ██║      ██║   
██╔══╝   ██║   ██║  ██╔██╗  ██╔══██╗ ██║   ██║ ██║ ██║      ██║   
██║      ╚██████╔╝ ██╔╝ ██╗ ██████╔╝ ╚██████╔╝ ██║ ███████╗ ██║   
╚═╝       ╚═════╝  ╚═╝  ╚═╝ ╚═════╝   ╚═════╝  ╚═╝ ╚══════╝ ╚═╝`}
          </pre>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-slate-900 mb-4">
              Hey Dad! 👋
            </h1>
            <p className="text-xl text-slate-700 font-bold mb-2">
              Nice to see ya! 🎃
            </p>
            <p className="text-lg text-slate-600">
              Ready to update the website?
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter the secret password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-slate-300 rounded-lg mb-6 text-lg font-semibold focus:border-red-500 focus:outline-none"
              autoFocus
            />
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-lg py-4 tracking-wider"
            >
              LET'S GO! 🚀
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-slate-500">
            <p>Remember: With great power comes great furniture updates!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}