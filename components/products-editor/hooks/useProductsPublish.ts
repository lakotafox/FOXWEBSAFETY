'use client'

import { CONSTRUCTION_MESSAGES } from '@/components/products-editor/constants/default-products'
import { updateGitHubFile } from '@/lib/github-api-client'

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
  setShowSuccessScreen: (show: boolean) => void
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
      setShowSuccessScreen,
      setTempPreviews
    } = options

    try {
      showSaveMessage("🚀 Publishing to live site...", 30000)
      
      const PATH = categoryId ? `products-${categoryId}.json` : 'products.json'
      
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
      
      // Use our API route instead of direct GitHub calls
      const result = await updateGitHubFile(
        PATH,
        content,
        `Update products via products editor - ${new Date().toLocaleString()}`
      )
      
      if (result.success) {
        // Save to localStorage as backup
        saveProductsPageItems(convertedProducts)
        saveCropSettings(cropSettings)
        
        showSaveMessage("✅ Published successfully!")
        
        // Show publish loading overlay for 3 minutes
        setTimeout(() => {
          setSaveMessage("")
          setShowPublishLoadingOverlay(true)
          console.log('Starting publish animation')
          
          // Start rotating messages
          let messageIndex = 0
          setPublishMessage(constructionMessages[0])
          
          const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % constructionMessages.length
            setPublishMessage(constructionMessages[messageIndex])
          }, 4000)
          
          // Show success screen after 10 seconds (for testing - change back to 180000 for 3 minutes)
          setTimeout(() => {
            console.log('Switching to success screen...')
            clearInterval(messageInterval)
            // Hide the publish overlay and show success screen
            setShowPublishLoadingOverlay(false)
            setShowSuccessScreen(true)
            setPublishMessage("success")
            console.log('Success screen should now be visible')
          }, 10000) // 10 seconds for testing
        }, 2000)
        
        // Clear temp previews
        setTempPreviews({})
      } else {
        console.error('GitHub update error:', result.error)
        
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