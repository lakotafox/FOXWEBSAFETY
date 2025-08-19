export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="flex items-start gap-3 max-w-[70%]">
        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
          <span className="text-black font-black text-sm">FB</span>
        </div>
        
        <div className="px-4 py-3 rounded-2xl bg-gray-800 rounded-tl-none">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  )
}