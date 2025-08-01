"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Phone, Mail, MapPin, FileText, Save, Edit2, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getProducts, saveProducts, defaultProducts } from "@/lib/products-data"

// DVD Bouncing emoji component
const BouncingEmoji = ({ emoji, delay = 0 }: { emoji: string; delay?: number }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [velocity, setVelocity] = useState({ x: 0.3, y: 0.3 })
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize with random values after mount to avoid hydration issues
    setPosition({ x: Math.random() * 80, y: Math.random() * 80 })
    setVelocity({ 
      x: (Math.random() - 0.5) * 0.5, 
      y: (Math.random() - 0.5) * 0.5 
    })
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    const interval = setInterval(() => {
      setPosition(prev => {
        let newX = prev.x + velocity.x
        let newY = prev.y + velocity.y
        let newVelX = velocity.x
        let newVelY = velocity.y

        // Bounce off edges
        if (newX <= 0 || newX >= 90) {
          newVelX = -velocity.x
          newX = newX <= 0 ? 0 : 90
        }
        if (newY <= 0 || newY >= 90) {
          newVelY = -velocity.y
          newY = newY <= 0 ? 0 : 90
        }

        setVelocity({ x: newVelX, y: newVelY })
        return { x: newX, y: newY }
      })
    }, 50)

    return () => clearInterval(interval)
  }, [velocity, isInitialized])

  return (
    <div 
      className="absolute text-6xl transition-all duration-50"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        animationDelay: `${delay}s`
      }}
    >
      {emoji}
    </div>
  )
}

export default function AdminEditor() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredCategory, setFeaturedCategory] = useState("new")
  const [showAddress, setShowAddress] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState(getProducts())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saveMessage, setSaveMessage] = useState("")
  const [isEditMode, setIsEditMode] = useState(true)
  const [showGalleryEditor, setShowGalleryEditor] = useState(false)
  const [showPasswordScreen, setShowPasswordScreen] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [versionAction, setVersionAction] = useState<'save' | 'load' | 'delete'>('save')
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [showSpecsModal, setShowSpecsModal] = useState(false)
  const [selectedProductForSpecs, setSelectedProductForSpecs] = useState<any>(null)
  const [editingSpecs, setEditingSpecs] = useState("")

  // Gallery images
  const defaultGalleryImages = [
    "/images/showroom-1.jpg",
    "/images/showroom-2.jpg",
    "/images/Showroomwglassboard.jpg",
    "/images/showfacinggarage.jpg",
    "/images/tanconf.jpg",
    "/images/reception tan.jpg",
  ]
  const [galleryImages, setGalleryImages] = useState(defaultGalleryImages)
  const [pendingGalleryImages, setPendingGalleryImages] = useState(defaultGalleryImages)
  
  // Load saved data on mount
  useEffect(() => {
    // First try to load draft from GitHub
    const loadDraft = async () => {
      try {
        const response = await fetch('/draft.json', {
          cache: 'no-cache'
        })
        if (response.ok) {
          const draft = await response.json()
          // Check if draft is newer than 24 hours
          const draftAge = new Date().getTime() - new Date(draft.savedAt).getTime()
          const hoursSinceDraft = draftAge / (1000 * 60 * 60)
          
          if (hoursSinceDraft < 24) {
            if (confirm(`Found a draft from ${new Date(draft.savedAt).toLocaleString()}. Load it?`)) {
              setFeaturedProducts(draft.products)
              setGalleryImages(draft.gallery)
              setPendingGalleryImages(draft.gallery)
              setSaveMessage("✅ Draft loaded successfully!")
              setTimeout(() => setSaveMessage(""), 3000)
              return // Don't load from localStorage if we loaded draft
            }
          }
        }
      } catch (e) {
        // Don't log 404 errors - it's normal if no draft exists
        console.log('No draft found - you have nothing staged to save')
      }
      
      // If no draft or user declined, load from localStorage as fallback
      const savedGallery = localStorage.getItem('foxbuilt-gallery')
      if (savedGallery) {
        try {
          const images = JSON.parse(savedGallery)
          setGalleryImages(images)
          setPendingGalleryImages(images)
        } catch (e) {
          console.error('Error loading gallery images:', e)
        }
      }
    }
    
    loadDraft()
  }, [])

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Auto-slide gallery
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [pendingGalleryImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % pendingGalleryImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + pendingGalleryImages.length) % pendingGalleryImages.length)
  }

  // Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "foxbuilt2025") {
      setIsAuthenticated(true)
    } else if (password === "goof") {
      window.location.href = '/games'
    } else {
      alert("Incorrect password")
    }
  }

  // Update product
  const updateProduct = (category: string, productId: number, field: string, value: any) => {
    const newProducts = { ...featuredProducts }
    const productIndex = newProducts[category].findIndex(p => p.id === productId)
    if (productIndex !== -1) {
      newProducts[category][productIndex][field] = value
      setFeaturedProducts(newProducts)
    }
  }

  // Handle image upload
  const handleImageUpload = async (category: string, productId: number, file: File) => {
    // Show loading state
    setSaveMessage("📸 Uploading image to GitHub...")
    
    try {
      // GitHub API configuration
      // GitHub token from environment variable
      // Set this in Netlify: Site settings → Environment variables
      // Name: NEXT_PUBLIC_GITHUB_TOKEN
      // Value: your GitHub token (get from https://github.com/settings/tokens/new)
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
      const OWNER = 'lakotafox'
      const REPO = 'FOXSITE'
      
      // Generate unique filename
      const timestamp = Date.now()
      const fileName = `product-${productId}-${timestamp}.jpg`
      const PATH = `public/images/${fileName}`
      
      // Convert file to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = async () => {
        const base64Data = reader.result as string
        // Remove the data:image/jpeg;base64, prefix
        const base64Content = base64Data.split(',')[1]
        
        // Upload to GitHub
        const response = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `Add product image: ${fileName}`,
              content: base64Content,
              branch: 'main'
            })
          }
        )
        
        if (response.ok) {
          // Update product with new image path
          updateProduct(category, productId, 'image', `/images/${fileName}`)
          setSaveMessage("✅ Image uploaded successfully!")
          setTimeout(() => setSaveMessage(""), 2000)
        } else {
          const error = await response.json()
          console.error('GitHub upload error:', error)
          if (response.status === 401) {
            setSaveMessage("❌ GitHub token expired - Tell Khabe: 'GitHub 401 error'")
            alert("ERROR: GitHub token expired (401)\n\nTell Khabe: 'GitHub 401 error - need new token'\n\nHe'll fix it free!")
          } else {
            setSaveMessage(`❌ Error: ${error.message || response.status}`)
          }
          setTimeout(() => setSaveMessage(""), 5000)
        }
      }
      
      reader.onerror = () => {
        setSaveMessage("❌ Error reading image file")
        setTimeout(() => setSaveMessage(""), 3000)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      setSaveMessage("❌ Error uploading image")
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  // Handle gallery image upload
  const handleGalleryImageUpload = async (index: number, file: File) => {
    setSaveMessage("📸 Uploading gallery image to GitHub...")
    
    try {
      // GitHub token from environment variable
      // Set this in Netlify: Site settings → Environment variables
      // Name: NEXT_PUBLIC_GITHUB_TOKEN
      // Value: your GitHub token (get from https://github.com/settings/tokens/new)
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
      const OWNER = 'lakotafox'
      const REPO = 'FOXSITE'
      
      // Generate unique filename
      const timestamp = Date.now()
      const fileName = `gallery-${index}-${timestamp}.jpg`
      const PATH = `public/images/${fileName}`
      
      // Convert file to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = async () => {
        const base64Data = reader.result as string
        const base64Content = base64Data.split(',')[1]
        
        // Upload to GitHub
        const response = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `Add gallery image: ${fileName}`,
              content: base64Content,
              branch: 'main'
            })
          }
        )
        
        if (!response.ok) {
          const error = await response.json()
          console.error('GitHub API error:', error)
          console.error('Tried to upload to:', PATH)
          if (response.status === 401) {
            setSaveMessage("❌ GitHub token expired - Tell Khabe: 'GitHub 401 error'")
            alert("ERROR: GitHub token expired (401)\n\nTell Khabe: 'GitHub 401 error - need new token'\n\nHe'll fix it free!")
          } else if (response.status === 404) {
            setSaveMessage(`❌ GitHub repo not found or no access - check token permissions`)
          } else {
            setSaveMessage(`❌ Error: ${error.message || response.status}`)
          }
          setTimeout(() => setSaveMessage(""), 5000)
          return
        }
        
        // Update gallery with new image path
        const newImages = [...pendingGalleryImages]
        newImages[index] = `/images/${fileName}`
        setPendingGalleryImages(newImages)
        setSaveMessage("✅ Gallery image uploaded!")
        setTimeout(() => setSaveMessage(""), 2000)
      }
    } catch (error) {
      console.error('Gallery upload error:', error)
      setSaveMessage("❌ Error uploading image")
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  // Save draft to GitHub
  const saveDraft = async () => {
    setSaveMessage("💾 Saving draft...")
    
    try {
      // GitHub token from environment variable
      // Set this in Netlify: Site settings → Environment variables
      // Name: NEXT_PUBLIC_GITHUB_TOKEN
      // Value: your GitHub token (get from https://github.com/settings/tokens/new)
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
      const OWNER = 'lakotafox'
      const REPO = 'FOXSITE'
      const PATH = 'public/draft.json'
      
      // Get current draft file SHA if it exists
      let sha = ''
      try {
        const currentFileResponse = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
          {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        )
        
        if (currentFileResponse.ok) {
          const currentFile = await currentFileResponse.json()
          sha = currentFile.sha
        }
      } catch (e) {
        // File doesn't exist yet, that's OK
      }
      
      // Prepare draft content
      const draftContent = {
        products: featuredProducts,
        gallery: pendingGalleryImages,
        savedAt: new Date().toISOString(),
        savedBy: "Kyle"
      }
      
      // Encode content to base64
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(draftContent, null, 2))))
      
      // Update or create draft file
      const updateResponse = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Save draft - ${new Date().toLocaleString()}`,
            content: contentBase64,
            sha: sha || undefined,
            branch: 'main'
          })
        }
      )
      
      if (updateResponse.ok) {
        setSaveMessage("✅ Draft saved! You can continue from any device.")
        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        const error = await updateResponse.json()
        console.error('GitHub API error:', error)
        setSaveMessage("❌ Error saving draft. Check console.")
        setTimeout(() => setSaveMessage(""), 5000)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      setSaveMessage("❌ Error saving draft.")
      setTimeout(() => setSaveMessage(""), 5000)
    }
  }

  // Save all changes (publish live)
  const saveAllChanges = async () => {
    setSaveMessage("🚀 Publishing live site...")
    
    try {
      // GitHub API configuration
      // GitHub token from environment variable
      // Set this in Netlify: Site settings → Environment variables
      // Name: NEXT_PUBLIC_GITHUB_TOKEN
      // Value: your GitHub token (get from https://github.com/settings/tokens/new)
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
      const OWNER = 'lakotafox'
      const REPO = 'FOXSITE'
      const PATH = 'public/content.json'
      
      // First, get the current file to get its SHA
      const currentFileResponse = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )
      
      let sha = ''
      if (currentFileResponse.ok) {
        const currentFile = await currentFileResponse.json()
        sha = currentFile.sha
      }
      
      // Prepare the content
      const content = {
        products: featuredProducts,
        gallery: pendingGalleryImages,
        lastUpdated: new Date().toISOString(),
        updatedBy: "Kyle"
      }
      
      // Encode content to base64
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))))
      
      // Update the file on GitHub
      const updateResponse = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Update products and gallery via admin panel - ${new Date().toLocaleString()}`,
            content: contentBase64,
            sha: sha, // Required for updates
            branch: 'main'
          })
        }
      )
      
      if (updateResponse.ok) {
        // Also save to localStorage as backup
        saveProducts(featuredProducts)
        localStorage.setItem('foxbuilt-gallery', JSON.stringify(pendingGalleryImages))
        setGalleryImages(pendingGalleryImages)
        
        setSaveMessage("✅ Published successfully! Website will update in ~30 seconds.")
        
        setTimeout(() => {
          setSaveMessage("")
          setShowPublishConfirm(true)
        }, 3000)
      } else {
        const error = await updateResponse.json()
        console.error('GitHub API error:', error)
        setSaveMessage("❌ Error publishing. Check console for details.")
        setTimeout(() => setSaveMessage(""), 5000)
      }
    } catch (error) {
      console.error('Error publishing to GitHub:', error)
      setSaveMessage("❌ Error publishing. Check your GitHub token.")
      setTimeout(() => setSaveMessage(""), 5000)
    }
  }

  // Save to version slot
  const saveToVersion = (version: string) => {
    const versionData = {
      products: featuredProducts,
      gallery: pendingGalleryImages,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(`foxbuilt-version-${version}`, JSON.stringify(versionData))
    setSaveMessage(`✅ Saved to ${version}!`)
    setShowVersionModal(false)
    setTimeout(() => setSaveMessage(""), 3000)
  }

  // Load from version slot
  const loadFromVersion = (version: string) => {
    const versionData = localStorage.getItem(`foxbuilt-version-${version}`)
    if (versionData) {
      const parsed = JSON.parse(versionData)
      setFeaturedProducts(parsed.products)
      setGalleryImages(parsed.gallery)
      setPendingGalleryImages(parsed.gallery)
      saveProducts(parsed.products)
      localStorage.setItem('foxbuilt-gallery', JSON.stringify(parsed.gallery))
      setSaveMessage(`🔄 Loaded ${version}!`)
      setShowVersionModal(false)
      
      // Trigger storage event for main page
      window.dispatchEvent(new Event('storage'))
      
      setTimeout(() => setSaveMessage(""), 3000)
    } else {
      alert(`No saved data found for ${version}`)
    }
  }

  // Check if version has saved data
  const hasVersionData = (version: string): boolean => {
    return !!localStorage.getItem(`foxbuilt-version-${version}`)
  }

  // Delete version
  const deleteVersion = (version: string) => {
    if (confirm(`Are you sure you want to delete ${version}? This cannot be undone.`)) {
      localStorage.removeItem(`foxbuilt-version-${version}`)
      setSaveMessage(`🗑️ Deleted ${version}!`)
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  // Revert to V1.0
  const revertToV1 = () => {
    if (confirm("Are you sure you want to revert to V1.0? This will reset all products and gallery images to their original state.")) {
      setFeaturedProducts(defaultProducts)
      saveProducts(defaultProducts)
      setGalleryImages(defaultGalleryImages)
      setPendingGalleryImages(defaultGalleryImages)
      localStorage.setItem('foxbuilt-gallery', JSON.stringify(defaultGalleryImages))
      
      setSaveMessage("🔄 Reverted to V1.0! All products and gallery reset to original.")
      
      // Trigger storage event for main page
      window.dispatchEvent(new Event('storage'))
      
      setTimeout(() => {
        setSaveMessage("")
      }, 3000)
    }
  }

  // Login screen
  if (!isAuthenticated) {
    if (!showPasswordScreen) {
      // Initial prompt screen
      return (
        <div 
          className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden cursor-pointer"
          onClick={() => setShowPasswordScreen(true)}
          onKeyDown={() => setShowPasswordScreen(true)}
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

    // Password screen
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
            {/* ASCII Art */}
            <pre className="text-red-600 font-mono text-xs md:text-sm text-center mb-8 font-bold">
{`                                                     •
███████╗  ██████╗  ██╗  ██╗ ██████╗  ██╗   ██╗ ██╗ ██╗    ████████╗
██╔════╝ ██╔═══██╗ ╚██╗██╔╝ ██╔══██╗ ██║   ██║ ██║ ██║    ╚══██╔══╝
█████╗   ██║   ██║  ╚███╔╝  ██████╔╝ ██║   ██║ ██║ ██║       ██║   
██╔══╝   ██║   ██║  ██╔██╗  ██╔══██╗ ██║   ██║ ██║ ██║       ██║   
██║      ╚██████╔╝ ██╔╝ ██╗ ██████╔╝ ╚██████╔╝ ██║ ███████╗  ██║   
╚═╝       ╚═════╝  ╚═╝  ╚═╝ ╚═════╝   ╚═════╝  ╚═╝ ╚══════╝  ╚═╝`}
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

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Admin Controls Bar */}
      <div className="bg-green-600 text-white p-2">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              <span className="font-bold text-sm sm:text-base">ADMIN EDIT MODE</span>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                onClick={() => {
                  setVersionAction('load')
                  setShowVersionModal(true)
                }}
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 hover:bg-gray-100 text-xs sm:text-sm"
              >
                Versions
              </Button>
              <Button
                onClick={revertToV1}
                variant="outline"
                size="sm"
                className="bg-white text-red-600 hover:bg-gray-100 text-xs sm:text-sm"
              >
                Revert to V1.0
              </Button>
              <Button
                onClick={saveDraft}
                size="sm"
              className="bg-white text-blue-600 hover:bg-blue-100"
            >
              <Save className="w-4 h-4 mr-1" />
              💾 Save Draft
            </Button>
            <Button
              onClick={saveAllChanges}
              size="sm"
              className="bg-white text-green-600 hover:bg-green-100"
            >
              <Save className="w-4 h-4 mr-1" />
              🚀 Publish Live
            </Button>
          </div>
        </div>
      </div>

      {/* Save message */}
      {saveMessage && (
        <div className="fixed top-0 left-0 right-0 z-[59] bg-green-500 text-white p-4 text-center font-bold">
          {saveMessage}
        </div>
      )}

      {/* Main site content with edit capability */}
      <div>
        {/* Header - Hidden in admin mode */}
        {!isEditMode && (
          <header
            className={`fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b-4 border-red-600 shadow-xl transition-all duration-500 ${
              isScrolled ? "py-0.25" : "py-1.5"
            }`}
          >
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className={`transition-all duration-500 ${isScrolled ? "scale-50" : "scale-100"}`}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Image
                    src="/images/foxbuilt-logo.png"
                    alt="FoxBuilt Logo"
                    width={isScrolled ? 80 : 160}
                    height={isScrolled ? 30 : 60}
                    className="h-auto transition-all duration-500"
                  />
                </div>
              </div>
            </div>

            <div
              className={`hidden md:flex items-center space-x-2 transition-all duration-500 ${isScrolled ? "scale-75" : "scale-100"}`}
            >
              <Phone className={`text-red-500 ${isScrolled ? "w-4 h-4" : "w-5 h-5"}`} />
              <span className={`text-white font-black tracking-wide ${isScrolled ? "text-sm" : "text-lg"}`}>
                (801) 899-9406
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide border-2 border-blue-600 hover:border-blue-700 transition-all duration-500 ${
                  isScrolled ? "px-2 py-1 text-xs" : "px-4 py-2 text-sm"
                }`}
                onClick={() => window.open('/catolog no page one.pdf', '_blank')}
              >
                <FileText className={`${isScrolled ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"}`} />
                CATALOG
              </Button>

              <Button
                className={`bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide border-2 border-red-600 hover:border-red-700 transition-all duration-500 ${
                  isScrolled ? "px-3 py-1 text-sm" : "px-6 py-2"
                }`}
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                GET QUOTE
              </Button>
            </div>
          </div>
        </header>
        )}

        {/* Hero Section - Same as main site */}
        <section className={`bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 py-24 text-white relative overflow-hidden ${isEditMode ? "pt-24" : "pt-40"}`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-blue-600/20"></div>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-white to-blue-600"></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight">
              AMERICAN MADE
              <br />
              <span className="text-red-500">WORKSPACE</span>
              <br />
              <span className="text-blue-400">SOLUTIONS</span>
            </h1>
            <div className="mb-8">
              <span className="inline-block bg-red-600 text-white px-6 py-3 text-sm font-black uppercase tracking-widest border-4 border-white">
                🇺🇸 27 YEARS STRONG 🇺🇸
              </span>
            </div>
            <p className="text-xl text-zinc-300 mb-10 max-w-3xl mx-auto font-bold leading-relaxed">
              BUILT TOUGH. BUILT RIGHT. BUILT TO LAST.
              <br />
              From executive offices to heavy-duty workstations - we outfit America's workforce.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-black text-lg px-10 py-4 border-4 border-white tracking-widest"
                onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
              >
                VISIT SHOWROOM
              </Button>
              <Button
                size="lg"
                className="bg-black hover:bg-zinc-800 text-white font-black text-lg px-10 py-4 border-4 border-white tracking-widest"
              >
                (801) 899-9406
              </Button>
            </div>
          </div>
        </section>

        {/* Gallery - Same as main site */}
        <section id="gallery" className="py-20 bg-zinc-100">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-black text-center text-slate-900 mb-16 tracking-tight">
              AMERICAN <span className="text-red-600">CRAFTSMANSHIP</span>
            </h2>
            <div className="relative max-w-6xl mx-auto">
              {isEditMode && (
                <div className="text-center mb-4">
                  <Button
                    onClick={() => setShowGalleryEditor(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Gallery Images
                  </Button>
                </div>
              )}
              <div className="relative h-96 md:h-[600px] overflow-hidden border-8 border-slate-700">
                {pendingGalleryImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image src={image || "/placeholder.svg"} alt={`Project ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 p-4 border-4 border-white shadow-xl transition-all"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 p-4 border-4 border-white shadow-xl transition-all"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>

              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {pendingGalleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-4 h-4 border-2 border-white transition-all ${
                      index === currentSlide ? "bg-red-600" : "bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section - EDITABLE */}
        <section className="py-20 bg-slate-800">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-black text-center text-white mb-16 tracking-tight">
              FEATURED <span className="text-blue-400">PRODUCTS</span>
            </h2>

            {/* Category Buttons */}
            <div className="flex justify-center mb-12">
              <div className="bg-slate-700 border-4 border-slate-600 p-2 flex flex-wrap justify-center">
                <Button
                  className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                    featuredCategory === "new"
                      ? "bg-red-600 text-white border-2 border-red-600"
                      : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
                  }`}
                  onClick={() => setFeaturedCategory("new")}
                >
                  NEW
                </Button>
                <Button
                  className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                    featuredCategory === "battleTested"
                      ? "bg-blue-600 text-white border-2 border-blue-600"
                      : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
                  }`}
                  onClick={() => setFeaturedCategory("battleTested")}
                >
                  BATTLE TESTED
                </Button>
                <Button
                  className={`font-black text-sm md:text-lg px-3 md:px-6 py-2 md:py-3 tracking-wide transition-all ${
                    featuredCategory === "seating"
                      ? "bg-green-600 text-white border-2 border-green-600"
                      : "bg-transparent text-zinc-300 hover:text-white border-2 border-transparent"
                  }`}
                  onClick={() => setFeaturedCategory("seating")}
                >
                  SEATING
                </Button>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredProducts[featuredCategory].map((product) => (
                <Card
                  key={product.id}
                  className={`overflow-hidden hover:shadow-2xl transition-all border-4 border-slate-600 bg-zinc-100 ${
                    isEditMode ? "ring-2 ring-green-500" : ""
                  }`}
                >
                  <div className="relative h-56 group">
                    <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
                    {isEditMode && (
                      <label className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                        <div className="text-white text-center">
                          <Edit2 className="w-8 h-8 mx-auto mb-2" />
                          <span>Click to change image</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(featuredCategory, product.id, file)
                          }}
                        />
                      </label>
                    )}
                    <div
                      className={`absolute top-4 right-4 text-white px-3 py-1 font-black text-sm ${
                        featuredCategory === "new"
                          ? "bg-red-600"
                          : featuredCategory === "battleTested"
                            ? "bg-blue-600"
                            : "bg-green-600"
                      }`}
                    >
                      {featuredCategory === "new" ? "NEW" : featuredCategory === "battleTested" ? "PROVEN" : "COMFORT"}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    {/* Title */}
                    {isEditMode && editingId === product.id ? (
                      <input
                        type="text"
                        value={product.title}
                        onChange={(e) => updateProduct(featuredCategory, product.id, 'title', e.target.value)}
                        className="text-xl font-black mb-3 tracking-wide w-full p-1 border rounded"
                        onBlur={() => setEditingId(null)}
                        autoFocus
                      />
                    ) : (
                      <h3 
                        className={`text-xl font-black mb-3 tracking-wide ${
                          isEditMode ? "cursor-pointer hover:bg-yellow-100 p-1 rounded" : ""
                        }`}
                        onClick={() => isEditMode && setEditingId(product.id)}
                      >
                        {product.title}
                      </h3>
                    )}

                    {/* Description */}
                    {isEditMode ? (
                      <textarea
                        value={product.description}
                        onChange={(e) => updateProduct(featuredCategory, product.id, 'description', e.target.value)}
                        className="text-slate-600 mb-4 font-semibold w-full p-1 border rounded resize-none"
                        rows={2}
                      />
                    ) : (
                      <p className="text-slate-600 mb-4 font-semibold">{product.description}</p>
                    )}

                    {/* Features */}
                    {product.features && (
                      <ul className="text-sm text-slate-500 mb-4 space-y-1">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${
                                featuredCategory === "new"
                                  ? "bg-red-600"
                                  : featuredCategory === "battleTested"
                                    ? "bg-blue-600"
                                    : "bg-green-600"
                              }`}
                            ></span>
                            {isEditMode ? (
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => {
                                  const newFeatures = [...product.features]
                                  newFeatures[index] = e.target.value
                                  updateProduct(featuredCategory, product.id, 'features', newFeatures)
                                }}
                                className="flex-1 p-1 border rounded text-sm"
                              />
                            ) : (
                              feature
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Price */}
                    <div className="flex justify-between items-center">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) => updateProduct(featuredCategory, product.id, 'price', e.target.value)}
                          className={`text-2xl font-black p-1 border rounded ${
                            featuredCategory === "new"
                              ? "text-red-600"
                              : featuredCategory === "battleTested"
                                ? "text-blue-600"
                                : "text-green-600"
                          }`}
                          placeholder="e.g., $1,299"
                        />
                      ) : (
                        <span
                          className={`text-2xl font-black ${
                            featuredCategory === "new"
                              ? "text-red-600"
                              : featuredCategory === "battleTested"
                                ? "text-blue-600"
                                : "text-green-600"
                          }`}
                        >
                          {product.price}
                        </span>
                      )}
                      <Button 
                        variant="outline" 
                        className="border-2 border-slate-700 font-bold"
                        onClick={() => {
                          setSelectedProductForSpecs(product)
                          setEditingSpecs(product.specs || "")
                          setShowSpecsModal(true)
                        }}
                      >
                        SPECS
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-20 bg-zinc-100">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-black text-center text-slate-900 mb-16 tracking-tight">
              AMERICAN <span className="text-red-600">GRIT</span>
            </h2>

            <div className="max-w-5xl mx-auto">
              {/* Kyle Fox Story */}
              <div className="bg-slate-800 text-white border-8 border-slate-700 p-10 mb-16">
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="relative w-56 h-56 border-8 border-red-600 flex-shrink-0">
                    <Image src="/images/kyle-fox-profile.webp" alt="Kyle Fox - Founder" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white mb-6 tracking-wide">KYLE FOX - FOUNDER</h3>
                    <blockquote className="text-xl text-zinc-300 italic mb-6 font-bold">
                      "You need a desk? I actually know a great guy, He deserves your business" That's our marketing.
                    </blockquote>
                    <p className="text-zinc-300 leading-relaxed text-lg font-semibold">
                      Started with nothing but a van, a dream, and American determination. Built this company from the
                      ground up with sweat, steel, and satisfaction guaranteed. We don't just sell furniture - we build
                      the foundation of American business, one workspace at a time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Visit Our Showroom CTA */}
              <div className="bg-gradient-to-r from-red-600 to-blue-600 text-white border-8 border-slate-700 p-10 text-center">
                <h3 className="text-3xl font-black mb-6 tracking-wide">WANT TO SEE IT IN PERSON?</h3>
                <p className="text-xl mb-8 font-bold">
                  Visit our showroom at 420 W Commerce Dr Building LL, Pleasant Grove, UT 84062. Coffee's hot, snacks are
                  free, and the furniture is built to last.
                </p>
                <Button
                  className="bg-white text-slate-900 hover:bg-zinc-200 font-black text-lg px-8 py-4 border-4 border-slate-900"
                  onClick={() => setShowAddress(!showAddress)}
                >
                  {showAddress ? "HIDE ADDRESS" : "VISIT SHOWROOM"}
                </Button>

                {showAddress && (
                  <div className="mt-8 bg-white/10 border-4 border-white p-6 text-center">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-4">
                        <MapPin className="w-6 h-6 text-white" />
                        <div>
                          <p className="text-xl font-bold">420 W Commerce Dr Building LL</p>
                          <p className="text-xl font-bold">Pleasant Grove, UT 84062</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-4">
                        <Phone className="w-6 h-6 text-white" />
                        <span className="text-xl font-bold">{textContent.phoneNumber}</span>
                      </div>
                      <div className="text-lg font-bold text-zinc-200">
                        <p>Monday–Friday: 10:00am–5:00pm</p>
                        <p>Saturday–Sunday: By Appointment</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-slate-900 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-black text-center mb-16 tracking-tight">
              GET IN <span className="text-red-500">TOUCH</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
              <div>
                <h3 className="text-3xl font-black mb-8 tracking-wide">CONTACT INFO</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-600 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400 font-semibold">CALL US</p>
                      <p className="text-xl font-black">(801) 899-9406</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400 font-semibold">EMAIL US</p>
                      <p className="text-xl font-black">info@foxbuilt.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400 font-semibold">VISIT US</p>
                      <p className="text-lg font-black">420 W Commerce Dr Building LL</p>
                      <p className="text-lg font-black">Pleasant Grove, UT 84062</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black mb-8 tracking-wide">SEND A MESSAGE</h3>
                <form className="space-y-6">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 text-white placeholder-zinc-400 font-bold"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 text-white placeholder-zinc-400 font-bold"
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 text-white placeholder-zinc-400 font-bold"
                  />
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-lg py-4 border-4 border-red-500">
                    SEND MESSAGE
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black py-10 text-center text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-4xl">🇺🇸</span>
              <span className="font-black text-xl tracking-widest">PROUDLY AMERICAN</span>
              <span className="text-4xl">🇺🇸</span>
            </div>
            <p className="text-zinc-400 font-semibold">© 2024 FoxBuilt. All rights reserved.</p>
            <p className="text-zinc-500 text-sm mt-2">Built strong. Built right. Built to last.</p>
          </div>
        </footer>
      </div>

      {/* Gallery Editor Modal */}
      {showGalleryEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Gallery Images</h2>
              <Button
                onClick={() => setShowGalleryEditor(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {pendingGalleryImages.map((image, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium">
                    Image {index + 1}
                  </label>
                  <div className="relative aspect-video bg-gray-100 rounded border-2 border-dashed border-gray-300 overflow-hidden group">
                    {image && (
                      <Image 
                        src={image} 
                        alt={`Gallery ${index + 1}`} 
                        fill 
                        className="object-cover" 
                      />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                      <div className="text-white opacity-0 group-hover:opacity-100 text-center">
                        <Edit2 className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-sm">Click to change</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleGalleryImageUpload(index, file)
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <Button
                onClick={() => {
                  // Reset pending gallery images to current saved state
                  setPendingGalleryImages(galleryImages)
                  setShowGalleryEditor(false)
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowGalleryEditor(false)
                  // Gallery changes are now staged in pendingGalleryImages
                  // They will be published when user clicks Publish button
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Version Management Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {versionAction === 'save' ? 'Save Build Version' : versionAction === 'load' ? 'Load Build Version' : 'Delete Build Version'}
              </h2>
              <Button
                onClick={() => setShowVersionModal(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {['V2.0', 'V3.0', 'V4.0', 'V5.0', 'V6.0', 'V7.0', 'V8.0', 'V9.0'].map((version) => {
                const hasData = hasVersionData(version)
                const versionInfo = hasData ? JSON.parse(localStorage.getItem(`foxbuilt-version-${version}`) || '{}') : null
                
                return (
                  <Button
                    key={version}
                    onClick={() => {
                      if (versionAction === 'save') {
                        if (hasData && !confirm(`${version} already has saved data. Overwrite?`)) {
                          return
                        }
                        saveToVersion(version)
                      } else if (versionAction === 'load') {
                        loadFromVersion(version)
                      } else if (versionAction === 'delete') {
                        if (hasData) {
                          deleteVersion(version)
                          // Force re-render by closing and reopening modal
                          setShowVersionModal(false)
                          setTimeout(() => {
                            setShowVersionModal(true)
                            setVersionAction('delete')
                          }, 100)
                        }
                      }
                    }}
                    variant={hasData ? "default" : "outline"}
                    className={`h-20 flex flex-col items-center justify-center ${
                      hasData 
                        ? versionAction === 'save' 
                          ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                          : versionAction === 'load'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <span className="font-bold text-lg">{version}</span>
                    {hasData && versionInfo?.savedAt && (
                      <span className="text-xs opacity-80">
                        {new Date(versionInfo.savedAt).toLocaleDateString()}
                      </span>
                    )}
                    {!hasData && (
                      <span className="text-xs opacity-60">Empty Slot</span>
                    )}
                  </Button>
                )
              })}
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  onClick={() => setVersionAction(versionAction === 'delete' ? 'load' : 'delete')}
                  variant="outline"
                  size="sm"
                  className={versionAction === 'delete' ? 'text-red-600 border-red-600' : ''}
                >
                  {versionAction === 'delete' ? 'Back to Load' : 'Delete Mode'}
                </Button>
              </div>
              <Button
                onClick={() => setShowVersionModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-center mb-4">
              Going back to main site?
            </h2>
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                Yes
              </Button>
              <Button
                onClick={() => setShowPublishConfirm(false)}
                variant="outline"
                className="px-8"
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Specs Editor Modal */}
      {showSpecsModal && selectedProductForSpecs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Edit Specifications - {selectedProductForSpecs.title}
              </h2>
              <Button
                onClick={() => setShowSpecsModal(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Product Specifications (measurements, materials, etc.)
              </label>
              <textarea
                value={editingSpecs}
                onChange={(e) => setEditingSpecs(e.target.value)}
                className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Dimensions: 60&quot;W x 30&quot;D x 29&quot;H
Weight: 120 lbs
Material: Laminate surface with metal frame
Colors: Silver Birch, Natural Oak, Espresso
Warranty: 10 year limited"
              />
              <p className="text-sm text-gray-500 mt-2">
                Tip: Use line breaks to separate different specifications
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowSpecsModal(false)
                  setEditingSpecs("")
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Find the product in the current category and update its specs
                  Object.keys(featuredProducts).forEach(category => {
                    const productIndex = featuredProducts[category].findIndex(p => p.id === selectedProductForSpecs.id)
                    if (productIndex !== -1) {
                      const newProducts = { ...featuredProducts }
                      newProducts[category][productIndex].specs = editingSpecs
                      setFeaturedProducts(newProducts)
                    }
                  })
                  setShowSpecsModal(false)
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Specifications
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}