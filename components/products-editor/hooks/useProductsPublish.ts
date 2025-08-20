'use client'

import { CONSTRUCTION_MESSAGES } from '@/components/products-editor/constants/default-products'

interface PublishOptions {
  products: any
  cropSettings: any
  pageName?: string
  categoryId?: string
  saveProductsPageItems: (products: any) => void
  saveCropSettings: (settings: any) => void
  showSaveMessage: (msg: string, duration?: number) => void
  setSaveMessage: (msg: string) => void
  setShowPublishLoadingOverlay: (show: boolean) => void
  setPublishMessage: (msg: string) => void
  setTempPreviews: (previews: any) => void
}

export function useProductsPublish() {
  const constructionMessages = CONSTRUCTION_MESSAGES

  const handlePublish = async (options: PublishOptions) => {
    const {
      products,
      cropSettings,
      pageName,
      categoryId,
      saveProductsPageItems,
      saveCropSettings,
      showSaveMessage,
      setSaveMessage,
      setShowPublishLoadingOverlay,
      setPublishMessage,
      setTempPreviews
    } = options

    try {
      showSaveMessage("🚀 Publishing to live site...", 30000)
      
      // GitHub API configuration
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
      const OWNER = 'lakotafox'
      const REPO = 'FOXSITE'
      const PATH = categoryId ? `public/products-${categoryId}.json` : 'public/products.json'
      
      // Get current file SHA
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
        console.error('Error fetching current products.json:', e)
      }
      
      // Prepare products with crop settings
      const convertedProducts = JSON.parse(JSON.stringify(products))
      Object.keys(convertedProducts).forEach(category => {
        convertedProducts[category].forEach((product: any) => {
          if (cropSettings[product.image]) {
            product.imageCrop = cropSettings[product.image]
          }
        })
      })
      
      // Create content
      const content = {
        products: convertedProducts,
        productsCrops: cropSettings,
        pageName: pageName || 'Executive Desks',
        lastUpdated: new Date().toISOString(),
        updatedBy: "Kyle"
      }
      
      // Encode to base64
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))))
      
      // Update file on GitHub
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
            message: `Update products via products editor - ${new Date().toLocaleString()}`,
            content: contentBase64,
            sha: sha,
            branch: 'main'
          })
        }
      )
      
      if (updateResponse.ok) {
        // Save to localStorage as backup
        saveProductsPageItems(convertedProducts)
        saveCropSettings(cropSettings)
        
        showSaveMessage("✅ Published successfully!")
        
        // Show publish loading overlay for 3 minutes
        setTimeout(() => {
          setSaveMessage("")
          setShowPublishLoadingOverlay(true)
          
          // Start rotating messages
          let messageIndex = 0
          setPublishMessage(constructionMessages[0])
          
          const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % constructionMessages.length
            setPublishMessage(constructionMessages[messageIndex])
          }, 4000)
          
          // Hide overlay after 180 seconds
          setTimeout(() => {
            clearInterval(messageInterval)
            setShowPublishLoadingOverlay(false)
            setPublishMessage("")
          }, 180000) // 3 minutes
        }, 2000)
        
        // Clear temp previews
        setTempPreviews({})
      } else {
        const error = await updateResponse.json()
        console.error('GitHub update error:', error)
        
        // Keep animation playing forever on error
        setShowPublishLoadingOverlay(true)
        
        // Start with "That's okay because..." then rotate other messages
        setPublishMessage("That's okay because...")
        
        const errorMessages = [
          "No worry, mon just a little error jam.",
          "We be dancin' through the bug, brother.",
          "Fox still vibin', cause peoples still buyin'.",
          "Don't ya know da music fix what code can't bro.",
          "Island time, slow down enjoy the chime.",
          "Good vibes always override when system offline",
          "Brotheration mend this code with time"
        ]
        
        let messageIndex = 0
        
        // After 4 seconds, start rotating the other messages
        setTimeout(() => {
          const messageInterval = setInterval(() => {
            setPublishMessage(errorMessages[messageIndex])
            messageIndex = (messageIndex + 1) % errorMessages.length
          }, 8000) // Rotate every 8 seconds (twice as slow)
        }, 4000)
        
        // Don't hide overlay on error - let it loop forever
      }
    } catch (error) {
      console.error('Error publishing:', error)
      
      // Keep animation playing forever on error
      setShowPublishLoadingOverlay(true)
      
      // Start with "That's okay because..." then rotate other messages
      setPublishMessage("That's okay because...")
      
      const errorMessages = [
        "No worry, mon just a little error jam.",
        "We be dancin' through the bug, brother.",
        "Fox still vibin', cause peoples still buyin'.",
        "Don't ya know da music fix what code can't bro.",
        "Island time, slow down enjoy the chime.",
        "Good vibes always override when system offline",
        "Brotheration mend this code with time"
      ]
      
      let messageIndex = 0
      
      // After 4 seconds, start rotating the other messages
      setTimeout(() => {
        const messageInterval = setInterval(() => {
          setPublishMessage(errorMessages[messageIndex])
          messageIndex = (messageIndex + 1) % errorMessages.length
        }, 8000) // Rotate every 8 seconds (twice as slow)
      }, 4000)
      
      // Don't hide overlay on error - let it loop forever
    }
  }

  return {
    constructionMessages,
    handlePublish
  }
}