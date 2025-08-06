'use client'

interface PageSelectorProps {
  onSelectMainPage: () => void
  onSelectProductsPage: () => void
  onBack: () => void
}

export default function PageSelector({ 
  onSelectMainPage, 
  onSelectProductsPage, 
  onBack 
}: PageSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border-8 border-red-600 p-12 max-w-2xl w-full">
        <h1 className="text-4xl font-black text-white mb-8 text-center tracking-tight">
          FOXBUILT
          <br />
          <span className="text-red-500">EDITOR SELECTION</span>
        </h1>
        <p className="text-xl text-zinc-300 text-center mb-12 font-bold">
          Choose which page to edit:
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <button
            onClick={onSelectMainPage}
            className="bg-green-600 hover:bg-green-700 text-white font-black text-xl p-8 border-4 border-green-500 hover:border-green-600 transition-all transform hover:scale-105"
          >
            <div>EDIT MAIN PAGE</div>
            <div className="text-sm mt-2 font-normal">Homepage content & featured products</div>
          </button>
          <button
            onClick={onSelectProductsPage}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-black text-xl p-8 border-4 border-yellow-500 hover:border-yellow-600 transition-all transform hover:scale-105"
          >
            <div>EDIT PRODUCTS</div>
            <div className="text-sm mt-2 font-normal">Full products catalog page</div>
          </button>
        </div>
        <button
          onClick={onBack}
          className="mt-8 text-zinc-400 hover:text-white font-bold transition-colors block mx-auto"
        >
          ← Back to login
        </button>
      </div>
    </div>
  )
}