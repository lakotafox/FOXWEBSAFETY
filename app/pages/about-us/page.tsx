"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AboutUsPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      router.push('/#about')
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [router])
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600 opacity-20 blur-[200px] animate-pulse"></div>
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-blue-600 opacity-20 blur-[150px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-white opacity-10 blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* ASCII Art Container */}
      <div className="relative z-10 text-center">
        {/* FOXBUILT ASCII Art */}
        <pre className="font-mono text-xs sm:text-sm md:text-base leading-none select-none animate-glow">
          <span className="text-red-500">███████╗</span>  <span className="text-white">██████╗</span>  <span className="text-blue-500">██╗  ██╗</span> <span className="text-red-500">██████╗</span>  <span className="text-white">██╗   ██╗</span> <span className="text-blue-500">██╗ ██╗</span>   <span className="text-red-500">████████╗</span>
          <span className="text-red-500">██╔════╝</span> <span className="text-white">██╔═══██╗</span> <span className="text-blue-500">╚██╗██╔╝</span> <span className="text-red-500">██╔══██╗</span> <span className="text-white">██║   ██║</span> <span className="text-blue-500">██║ ██║</span>   <span className="text-red-500">╚══██╔══╝</span>
          <span className="text-red-500">█████╗</span>   <span className="text-white">██║   ██║</span>  <span className="text-blue-500">╚███╔╝</span>  <span className="text-red-500">██████╔╝</span> <span className="text-white">██║   ██║</span> <span className="text-blue-500">██║ ██║</span>      <span className="text-red-500">██║</span>   
          <span className="text-red-500">██╔══╝</span>   <span className="text-white">██║   ██║</span>  <span className="text-blue-500">██╔██╗</span>  <span className="text-red-500">██╔══██╗</span> <span className="text-white">██║   ██║</span> <span className="text-blue-500">██║ ██║</span>      <span className="text-red-500">██║</span>   
          <span className="text-red-500">██║</span>      <span className="text-white">╚██████╔╝</span> <span className="text-blue-500">██╔╝ ██╗</span> <span className="text-red-500">██████╔╝</span> <span className="text-white">╚██████╔╝</span> <span className="text-blue-500">██║ ███████╗</span> <span className="text-red-500">██║</span>   
          <span className="text-red-500">╚═╝</span>       <span className="text-white">╚═════╝</span>  <span className="text-blue-500">╚═╝  ╚═╝</span> <span className="text-red-500">╚═════╝</span>   <span className="text-white">╚═════╝</span>  <span className="text-blue-500">╚═╝ ╚══════╝</span> <span className="text-red-500">╚═╝</span>
        </pre>
        
        {/* ABOUT US ASCII Art */}
        <pre className="font-mono text-xs sm:text-sm md:text-base leading-none mt-8 select-none animate-glow-delayed">
          <span className="text-white">█████╗</span>  <span className="text-red-500">██████╗</span>  <span className="text-blue-500">██████╗</span>  <span className="text-white">██╗   ██╗</span> <span className="text-red-500">████████╗</span>    <span className="text-blue-500">██╗   ██╗</span> <span className="text-white">███████╗</span>
          <span className="text-white">██╔══██╗</span> <span className="text-red-500">██╔══██╗</span> <span className="text-blue-500">██╔═══██╗</span> <span className="text-white">██║   ██║</span> <span className="text-red-500">╚══██╔══╝</span>    <span className="text-blue-500">██║   ██║</span> <span className="text-white">██╔════╝</span>
          <span className="text-white">███████║</span> <span className="text-red-500">██████╔╝</span> <span className="text-blue-500">██║   ██║</span> <span className="text-white">██║   ██║</span>    <span className="text-red-500">██║</span>       <span className="text-blue-500">██║   ██║</span> <span className="text-white">███████╗</span>
          <span className="text-white">██╔══██║</span> <span className="text-red-500">██╔══██╗</span> <span className="text-blue-500">██║   ██║</span> <span className="text-white">██║   ██║</span>    <span className="text-red-500">██║</span>       <span className="text-blue-500">██║   ██║</span> <span className="text-white">╚════██║</span>
          <span className="text-white">██║  ██║</span> <span className="text-red-500">██████╔╝</span> <span className="text-blue-500">╚██████╔╝</span> <span className="text-white">╚██████╔╝</span>    <span className="text-red-500">██║</span>       <span className="text-blue-500">╚██████╔╝</span> <span className="text-white">███████║</span>
          <span className="text-white">╚═╝  ╚═╝</span> <span className="text-red-500">╚═════╝</span>   <span className="text-blue-500">╚═════╝</span>   <span className="text-white">╚═════╝</span>     <span className="text-red-500">╚═╝</span>        <span className="text-blue-500">╚═════╝</span>  <span className="text-white">╚══════╝</span>
        </pre>
      </div>
      
      {/* Loading indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor) drop-shadow(0 0 30px currentColor);
            opacity: 0.8;
          }
          50% {
            filter: drop-shadow(0 0 20px currentColor) drop-shadow(0 0 40px currentColor) drop-shadow(0 0 60px currentColor);
            opacity: 1;
          }
        }
        
        @keyframes glow-delayed {
          0%, 100% {
            filter: drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor) drop-shadow(0 0 30px currentColor);
            opacity: 0.8;
          }
          50% {
            filter: drop-shadow(0 0 20px currentColor) drop-shadow(0 0 40px currentColor) drop-shadow(0 0 60px currentColor);
            opacity: 1;
          }
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-glow-delayed {
          animation: glow-delayed 2s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  )
}