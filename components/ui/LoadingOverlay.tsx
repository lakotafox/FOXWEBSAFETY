'use client'

import { useState, useEffect, useRef } from 'react'

interface LoadingOverlayProps {
  show: boolean
  type?: 'default' | 'upload' | 'publish' | 'success'
  publishMessage?: string
  onPlayGame?: () => void
}

// Create a singleton audio instance that persists
let globalAudioRef: HTMLAudioElement | null = null
let isMusicPlaying = false
let currentSongIndex = 0
let globalFadeInterval: NodeJS.Timeout | null = null

// Playlist of all Brotheration Records songs
const MUSIC_PLAYLIST = [
  { file: '/LOADING MUSIC.mp3', title: 'Mind Yourself', year: '2016' },
  { file: '/friends-and-things-brotheration-reggae-instrumental-2016-138165.mp3', title: 'Friends and Things', year: '2016' },
  { file: '/hot-shot-dub-reggae-riddim-brotheration-reggae-2015-138477.mp3', title: 'Hot Shot Dub', year: '2015' },
  { file: '/reggae-youtube-podcast-foolish-pride-brotheration-reggae-2021-135991.mp3', title: 'Foolish Pride', year: '2021' },
  { file: '/right-in-the-might-brotheration-records-2023-137728.mp3', title: 'Right in the Might', year: '2023' },
  { file: '/rude-rude-rudie-instrumental-brotheration-ska-reggae-2015-140259.mp3', title: 'Rude Rude Rudie', year: '2015' },
  { file: '/sidewinder-brotheration-reggae-2022-139292.mp3', title: 'Sidewinder', year: '2022' },
  { file: '/smooth-sailing-brotheration-reggae-2018-140256.mp3', title: 'Smooth Sailing', year: '2018' },
  { file: '/lovewise-brotheration-reggae-2017-140282.mp3', title: 'Lovewise', year: '2017' },
  { file: '/some-rise-up-vintage-reggae-brotheration-reggae-141400.mp3', title: 'Some Rise Up', year: '' }
]

export default function LoadingOverlay({ 
  show, 
  type = 'default', 
  publishMessage,
  onPlayGame 
}: LoadingOverlayProps) {
  const [canPlayVideo, setCanPlayVideo] = useState(true)
  const [showMusicButton, setShowMusicButton] = useState(false)
  const [currentSong, setCurrentSong] = useState(MUSIC_PLAYLIST[0])
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [volume, setVolume] = useState(60)
  const [isError, setIsError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Function to play next song
  const playNextSong = () => {
    currentSongIndex = (currentSongIndex + 1) % MUSIC_PLAYLIST.length
    const nextSong = MUSIC_PLAYLIST[currentSongIndex]
    setCurrentSong(nextSong)
    
    if (globalAudioRef) {
      globalAudioRef.src = nextSong.file
      if (isMusicPlaying) {
        globalAudioRef.play().catch(() => console.log('Audio play blocked'))
      }
    }
  }
  
  // Function to play previous song
  const playPreviousSong = () => {
    currentSongIndex = currentSongIndex === 0 ? MUSIC_PLAYLIST.length - 1 : currentSongIndex - 1
    const prevSong = MUSIC_PLAYLIST[currentSongIndex]
    setCurrentSong(prevSong)
    
    if (globalAudioRef) {
      globalAudioRef.src = prevSong.file
      if (isMusicPlaying) {
        globalAudioRef.play().catch(() => console.log('Audio play blocked'))
      }
    }
  }
  
  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (globalAudioRef) {
      globalAudioRef.volume = newVolume / 100
    }
  }
  
  // Toggle volume slider
  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider)
  }
  
  const toggleMusic = () => {
    if (globalAudioRef) {
      if (isMusicPlaying) {
        globalAudioRef.pause()
        isMusicPlaying = false
      } else {
        globalAudioRef.play().catch(() => {
          console.log('Audio play failed')
        })
        isMusicPlaying = true
      }
    }
  }

  const [showErrorHeader, setShowErrorHeader] = useState(false)
  const [showRotatingMessages, setShowRotatingMessages] = useState(false)
  const errorHeaderTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Check if music is already playing on mount
    if (isMusicPlaying) {
      setShowMusicButton(true)
      setCurrentSong(MUSIC_PLAYLIST[currentSongIndex])
    }
    
    // Check if this is an error message
    if (publishMessage && publishMessage.includes("That's okay because")) {
      setIsError(true)
      setShowErrorHeader(true)
      setShowRotatingMessages(false)
      
      // Start rotating messages after 4 seconds
      if (errorHeaderTimeoutRef.current) {
        clearTimeout(errorHeaderTimeoutRef.current)
      }
      errorHeaderTimeoutRef.current = setTimeout(() => {
        setShowRotatingMessages(true)
      }, 4000)
    } else if (publishMessage && isError) {
      // Keep error state true once it's been set
      // This ensures red and green text stay visible
    } else if (publishMessage && !publishMessage.includes("That's okay because")) {
      setIsError(false)
      setShowErrorHeader(false)
      setShowRotatingMessages(false)
    }
    
    if (show && videoRef.current) {
      // Try to play the video to detect if autoplay is blocked
      videoRef.current.play()
        .then(() => {
          setCanPlayVideo(true)
        })
        .catch(() => {
          // Autoplay blocked (likely low power mode)
          setCanPlayVideo(false)
        })
    }
    
    // Play music for publish animation
    if (show && type === 'publish') {
      if (!globalAudioRef) {
        // Start with a random song
        currentSongIndex = Math.floor(Math.random() * MUSIC_PLAYLIST.length)
        const initialSong = MUSIC_PLAYLIST[currentSongIndex]
        setCurrentSong(initialSong)
        
        globalAudioRef = new Audio(initialSong.file)
        globalAudioRef.volume = 0 // Start at silent
        
        // Set up event listener for when song ends
        globalAudioRef.addEventListener('ended', () => {
          playNextSong()
        })
      }
      
      if (!isMusicPlaying) {
        globalAudioRef.play().catch(() => {
          console.log('Audio autoplay blocked')
        })
        isMusicPlaying = true
        setShowMusicButton(true)
        
        // Clear any existing fade interval
        if (globalFadeInterval) {
          clearInterval(globalFadeInterval)
          globalFadeInterval = null
        }
        
        // Fade in volume over 10 seconds with exponential curve for smoother fade
        let currentVolume = 0
        let fadeStep = 0
        const totalSteps = 200
        const targetVolume = volume / 100 // Use the volume state
        globalFadeInterval = setInterval(() => {
          fadeStep++
          // Use exponential curve for more natural volume fade
          currentVolume = Math.pow(fadeStep / totalSteps, 3) * targetVolume
          if (fadeStep >= totalSteps) {
            currentVolume = targetVolume
            if (globalFadeInterval) {
              clearInterval(globalFadeInterval)
              globalFadeInterval = null
            }
          }
          if (globalAudioRef) {
            globalAudioRef.volume = currentVolume
          }
        }, 50) // Update every 50ms for smooth 10 second fade
      }
    }
  }, [show, type, publishMessage])
  
  // Play success chime when success screen shows
  useEffect(() => {
    if (type === 'success' && show) {
      console.log('Playing success chime...')
      
      // Pause the music temporarily
      const wasMusicPlaying = isMusicPlaying
      if (globalAudioRef && isMusicPlaying) {
        globalAudioRef.pause()
      }
      
      // Play success chime 3 times
      const chime = new Audio('/success-chime.mp3')
      chime.volume = 0.8  // Set volume to 80%
      let chimeCount = 0
      
      const playChime = () => {
        chimeCount++
        console.log(`Playing chime ${chimeCount}/3`)
        chime.currentTime = 0
        chime.play().catch(e => console.log('Chime play failed:', e))
        
        if (chimeCount < 3) {
          // Wait for chime to finish then play again
          chime.onended = () => {
            setTimeout(playChime, 200) // Small delay between chimes
          }
        } else {
          // After 3 chimes, resume music if it was playing
          chime.onended = () => {
            console.log('Chimes complete, resuming music')
            if (globalAudioRef && wasMusicPlaying) {
              globalAudioRef.play().catch(e => console.log('Music resume failed:', e))
            }
          }
        }
      }
      
      // Start playing the chimes
      playChime()
      
      // Cleanup
      return () => {
        chime.pause()
        chime.onended = null
      }
    }
  }, [type, show])
  
  const stopMusic = () => {
    if (globalAudioRef) {
      globalAudioRef.pause()
      globalAudioRef.currentTime = 0
      isMusicPlaying = false
      setShowMusicButton(false)
    }
  }
  
  // Debug logging
  console.log('LoadingOverlay - show:', show, 'type:', type, 'publishMessage:', publishMessage)
  
  if (!show) return null

  if (type === 'publish') {
    return (
      <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center pointer-events-auto" style={{ pointerEvents: 'all' }}>
        {/* Music controls in top left corner - LARGER */}
        <div className="fixed top-8 left-8 text-white bg-black/50 p-6 rounded-lg backdrop-blur-sm">
          {/* Song title */}
          <div className="mb-4">
            <div className="text-2xl font-bold">♪ {currentSong.title}</div>
            <div className="text-lg opacity-75">
              Brotheration Records {currentSong.year && `• ${currentSong.year}`}
            </div>
          </div>
          
          {/* Music control buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={playPreviousSong}
              className="text-white hover:text-red-500 transition-colors hover:scale-110"
              title="Previous Song"
            >
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            
            <div className="relative">
              <button
                onClick={toggleVolumeSlider}
                className="text-white hover:text-red-500 transition-colors hover:scale-110"
                title="Volume Control"
              >
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
              
              {/* Volume slider dropdown */}
              {showVolumeSlider && (
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-black/80 p-4 rounded-lg backdrop-blur-sm">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${volume}%, #374151 ${volume}%, #374151 100%)`
                    }}
                  />
                  <div className="text-center mt-2 text-white text-sm">{volume}%</div>
                </div>
              )}
            </div>
            
            <button
              onClick={playNextSong}
              className="text-white hover:text-red-500 transition-colors hover:scale-110"
              title="Next Song"
            >
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Game button in top right corner */}
        <div className="fixed top-8 right-8">
          <button
            onClick={() => {
              // Stop fade-in and mute music when opening game page
              if (globalFadeInterval) {
                clearInterval(globalFadeInterval)
                globalFadeInterval = null
              }
              if (globalAudioRef) {
                globalAudioRef.volume = 0
                setVolume(0)
              }
              if (onPlayGame) {
                onPlayGame()
              } else {
                window.open('/games', '_blank')
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded transition-all hover:scale-105 shadow-lg"
          >
            🎮 PLAY A GAME
          </button>
        </div>
        
        {/* Fox animation centered */}
        {canPlayVideo ? (
          <video 
            ref={videoRef}
            className="w-64 h-64"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/foxloading.webm" type="video/webm" />
          </video>
        ) : (
          <div className="w-64 h-64 relative">
            <img 
              src="/FOXLOADINGSTATIC.png" 
              alt="Loading"
              className="w-full h-full animate-pulse"
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, slowSpin 4s linear infinite'
              }}
            />
            <style jsx>{`
              @keyframes slowSpin {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        )}
        
        {/* Error messages - constant header and rotating messages */}
        {showErrorHeader && (
          <div className="mt-6">
            {/* Always show red header - BIGGER */}
            <div className="text-red-500 text-3xl font-bold mb-3">
              FAILED TO PUBLISH, SOMETHING BROKE
            </div>
            
            {/* Always show green "That's okay because..." - BIGGER */}
            <div className="text-green-500 text-3xl font-bold mb-3">
              That's okay because...
            </div>
            
            {/* Show rotating white messages after 4 seconds - BIGGER */}
            {showRotatingMessages && (
              <div className="text-white text-2xl animate-pulse"
                style={{
                  animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              >
                {publishMessage && !publishMessage.includes("That's okay because") ? publishMessage : ''}
              </div>
            )}
          </div>
        )}
        
        {/* Regular non-error messages */}
        {!isError && (
          <div className="text-white text-xl font-bold mt-4 animate-pulse">
            {publishMessage}
          </div>
        )}
      </div>
    )
  }

  // Success screen after publish completes
  if (type === 'success') {
    console.log('Showing success screen')
    return (
      <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center pointer-events-auto" style={{ pointerEvents: 'all' }}>
        {/* Music controls in top left corner - same as publish */}
        <div className="fixed top-8 left-8 text-white bg-black/50 p-6 rounded-lg backdrop-blur-sm">
          {/* Song title */}
          <div className="mb-4">
            <div className="text-2xl font-bold">♪ {currentSong.title}</div>
            <div className="text-lg opacity-75">
              Brotheration Records {currentSong.year && `• ${currentSong.year}`}
            </div>
          </div>
          
          {/* Music control buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={playPreviousSong}
              className="text-white hover:text-red-500 transition-colors hover:scale-110"
              title="Previous Song"
            >
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            
            <div className="relative">
              <button
                onClick={toggleVolumeSlider}
                className="text-white hover:text-red-500 transition-colors hover:scale-110"
                title="Volume Control"
              >
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
              
              {/* Volume slider dropdown */}
              {showVolumeSlider && (
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-black/80 p-4 rounded-lg backdrop-blur-sm">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${volume}%, #374151 ${volume}%, #374151 100%)`
                    }}
                  />
                  <div className="text-center mt-2 text-white text-sm">{volume}%</div>
                </div>
              )}
            </div>
            
            <button
              onClick={playNextSong}
              className="text-white hover:text-red-500 transition-colors hover:scale-110"
              title="Next Song"
            >
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Success message in center */}
        <div className="text-center">
          <h1 className="text-6xl font-black text-green-500 mb-8">
            SUCCESSFULLY UPDATED THE WEBSITE
          </h1>
          
          <button
            onClick={() => window.location.href = '/'}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-2xl px-12 py-6 rounded-full shadow-lg transition-all hover:scale-110"
          >
            Return to Main Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center pointer-events-auto" style={{ pointerEvents: 'all' }}>
      {canPlayVideo ? (
        <video 
          ref={type === 'default' ? videoRef : undefined}
          className="w-64 h-64"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/foxloading.webm" type="video/webm" />
        </video>
      ) : (
        <div className="w-64 h-64 relative">
          <img 
            src="/FOXLOADINGSTATIC.png" 
            alt="Loading"
            className="w-full h-full animate-pulse"
            style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, slowSpin 4s linear infinite'
            }}
          />
          <style jsx>{`
            @keyframes slowSpin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}