'use client'

export default function InteractiveParticles() {
  return (
    <section className="relative w-full h-[600px] bg-slate-900 overflow-hidden">
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
      
      {/* WE OFFER SPACE PLANNING AND DESIGN text overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <h2 className="text-4xl md:text-6xl font-thin text-white tracking-[0.2em] uppercase text-center px-4">
          WE OFFER SPACE PLANNING AND DESIGN
        </h2>
      </div>
    </section>
  )
}