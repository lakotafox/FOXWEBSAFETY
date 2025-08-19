import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

interface VoiceControlsProps {
  voiceEnabled: boolean
  setVoiceEnabled: (enabled: boolean) => void
  speechEnabled: boolean
  setSpeechEnabled: (enabled: boolean) => void
}

export default function VoiceControls({
  voiceEnabled,
  setVoiceEnabled,
  speechEnabled,
  setSpeechEnabled
}: VoiceControlsProps) {
  return (
    <div className="flex justify-center gap-4 mt-4">
      <button
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          voiceEnabled
            ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500'
            : 'bg-gray-800 text-gray-400 border border-gray-700'
        }`}
      >
        {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        <span className="text-sm font-medium">Voice Input</span>
      </button>

      <button
        onClick={() => setSpeechEnabled(!speechEnabled)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          speechEnabled
            ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500'
            : 'bg-gray-800 text-gray-400 border border-gray-700'
        }`}
      >
        {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        <span className="text-sm font-medium">AI Voice</span>
      </button>
    </div>
  )
}