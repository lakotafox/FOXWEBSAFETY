'use client'

export default function BackToTop() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 left-8 z-[100] group flex flex-col items-center hover:scale-110 transition-transform"
      aria-label="Back to top"
    >
      <img 
        src="/rocket.png" 
        alt="Launch to top" 
        width={60} 
        height={60}
        className="drop-shadow-lg"
      />
      <span className="text-xs font-bold text-slate-800 mt-1 bg-white/90 px-2 py-1 rounded shadow-lg">
        LAUNCH TO TOP
      </span>
    </button>
  )
}