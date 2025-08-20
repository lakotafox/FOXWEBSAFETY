interface PublishOptions {
  products: any
  gallery: string[]
  mobileGallery?: string[]
  cropSettings: {[key: string]: {scale: number, x: number, y: number}}
  showMessage: (message: string, duration?: number) => void
}

export async function publishToGitHub({ 
  products, 
  gallery,
  mobileGallery, 
  cropSettings, 
  showMessage 
}: PublishOptions) {
  // Use same gallery for both mobile and desktop
  const galleryToUse = gallery || mobileGallery || []
  showMessage("🚀 Publishing live site...", 30000) // 30 seconds for publish
  
  try {
    // GitHub API configuration
    const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'SET_IN_NETLIFY_ENV'
    const OWNER = 'lakotafox'
    const REPO = 'FOXSITE'
    const PRODUCTS_PATH = 'public/main-products.json'
    const CONTENT_PATH = 'public/content.json'
    
    // First, get the current content.json file to get its SHA
    const currentContentResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CONTENT_PATH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )
    
    let contentSha = ''
    if (currentContentResponse.ok) {
      const currentFile = await currentContentResponse.json()
      contentSha = currentFile.sha
    }

    // Get current main-products.json file SHA
    const currentProductsResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PRODUCTS_PATH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )
    
    let productsSha = ''
    if (currentProductsResponse.ok) {
      const currentFile = await currentProductsResponse.json()
      productsSha = currentFile.sha
    }
    
    // Add crop settings to products
    const convertedProducts = JSON.parse(JSON.stringify(products))
    Object.keys(convertedProducts).forEach(category => {
      convertedProducts[category].forEach((product: any) => {
        if (cropSettings[product.image]) {
          product.imageCrop = cropSettings[product.image]
        }
      })
    })
    
    // Prepare the content for content.json (includes gallery)
    const content = {
      products: convertedProducts,
      gallery: galleryToUse,
      mobileGallery: galleryToUse, // Same gallery for both
      galleryCrops: cropSettings,
      lastUpdated: new Date().toISOString(),
      updatedBy: "Kyle"
    }

    // Prepare main-products.json content (just products with embedded crops)
    const productsContent = {
      products: convertedProducts,
      productsCrops: cropSettings
    }
    
    // Encode content to base64
    const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))))
    const productsBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(productsContent, null, 2))))
    
    // Update content.json file on GitHub (for gallery data)
    const updateContentResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CONTENT_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Update content via main editor - ${new Date().toLocaleString()}`,
          content: contentBase64,
          sha: contentSha,
          branch: 'main'
        })
      }
    )

    // Update main-products.json file on GitHub (for main page products data)
    const updateProductsResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PRODUCTS_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Update main page products via carrie editor - ${new Date().toLocaleString()}`,
          content: productsBase64,
          sha: productsSha,
          branch: 'main'
        })
      }
    )
    
    if (updateContentResponse.ok && updateProductsResponse.ok) {
      return { success: true }
    } else {
      const contentError = !updateContentResponse.ok ? await updateContentResponse.json() : null
      const productsError = !updateProductsResponse.ok ? await updateProductsResponse.json() : null
      const error = contentError || productsError
      console.error('GitHub API error:', error)
      return { 
        success: false, 
        error: error?.message || `Error updating files` 
      }
    }
  } catch (error: any) {
    console.error('Error publishing to GitHub:', error)
    return { 
      success: false, 
      error: error.message || 'Unknown error' 
    }
  }
}