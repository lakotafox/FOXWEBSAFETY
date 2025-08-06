export async function publishToGitHub(
  products: any[],
  token: string,
  onProgress: (message: string, isError?: boolean) => void
) {
  const owner = 'lakotafox'
  const repo = 'FOXSITE'
  const path = 'public/products.json'
  
  try {
    onProgress('Connecting to GitHub...')
    
    // Get current file to obtain SHA
    const currentFileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      }
    )
    
    let sha = ''
    if (currentFileResponse.ok) {
      const currentFile = await currentFileResponse.json()
      sha = currentFile.sha
      onProgress('Found existing products file...')
    } else {
      onProgress('Creating new products file...')
    }
    
    // Prepare content
    const content = JSON.stringify({ products }, null, 2)
    const encodedContent = btoa(unescape(encodeURIComponent(content)))
    
    // Update or create file
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update products catalog - ${new Date().toLocaleString()}`,
          content: encodedContent,
          sha: sha || undefined,
        })
      }
    )
    
    if (response.ok) {
      onProgress('✅ Products published successfully!')
      
      // Trigger Netlify rebuild
      const netlifyResponse = await fetch('https://api.netlify.com/build_hooks/YOUR_BUILD_HOOK_URL', {
        method: 'POST'
      })
      
      if (netlifyResponse.ok) {
        onProgress('🚀 Website rebuild triggered!')
      }
      
      setTimeout(() => {
        onProgress('Your changes will be live in 2-3 minutes.')
      }, 1000)
      
      return true
    } else {
      const error = await response.json()
      throw new Error(error.message || 'Failed to publish')
    }
  } catch (error) {
    onProgress(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, true)
    return false
  }
}