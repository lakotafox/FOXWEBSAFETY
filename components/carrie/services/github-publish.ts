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
  showMessage("🚀 Publishing live site...", 30000) // 30 seconds for publish
  
  try {
    // GitHub API configuration
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
    
    // Add crop settings to products
    const convertedProducts = JSON.parse(JSON.stringify(products))
    Object.keys(convertedProducts).forEach(category => {
      convertedProducts[category].forEach((product: any) => {
        if (cropSettings[product.image]) {
          product.imageCrop = cropSettings[product.image]
        }
      })
    })
    
    // Prepare the content
    const content = {
      products: convertedProducts,
      gallery: gallery,
      mobileGallery: mobileGallery || gallery, // fallback to desktop gallery if no mobile gallery
      galleryCrops: cropSettings,
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
          sha: sha,
          branch: 'main'
        })
      }
    )
    
    if (updateResponse.ok) {
      return { success: true }
    } else {
      const error = await updateResponse.json()
      console.error('GitHub API error:', error)
      return { 
        success: false, 
        error: error.message || `Error ${updateResponse.status}` 
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