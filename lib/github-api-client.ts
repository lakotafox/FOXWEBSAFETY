/**
 * Client-side GitHub API wrapper that calls our server-side API route
 * This prevents exposing the GitHub token in client-side code
 */

interface GitHubApiResponse {
  success: boolean
  result?: any
  error?: string
}

export async function updateGitHubFile(
  path: string,
  content: any,
  message: string
): Promise<GitHubApiResponse> {
  try {
    // Convert content to base64 if it's not already
    let contentBase64: string
    
    if (typeof content === 'string') {
      // For image uploads, the content is already base64
      if (path.includes('/images/') && (path.endsWith('.jpg') || path.endsWith('.jpeg') || 
          path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp'))) {
        // Image content is already base64, use as-is
        contentBase64 = content
      } else {
        // For non-image files, check if it's already base64 encoded
        try {
          // Try to decode it to check if it's valid base64
          const decoded = atob(content)
          // If decode succeeded and it looks like JSON, it's already base64
          if (decoded.startsWith('{') || decoded.startsWith('[')) {
            contentBase64 = content
          } else {
            // It's a raw string, encode it
            contentBase64 = btoa(content)
          }
        } catch {
          // Not valid base64, encode it
          contentBase64 = btoa(content)
        }
      }
    } else {
      // It's an object, stringify and encode
      contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))))
    }
    
    // Always use Netlify Function endpoint (works both locally and in production)
    const response = await fetch('/.netlify/functions/github-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        content: contentBase64,
        message,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update file')
    }
    
    return data
  } catch (error) {
    console.error('Error calling GitHub API:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get the current SHA of a file (needed for updates)
 * This should also be done server-side eventually
 */
export async function getFileSHA(path: string): Promise<string | null> {
  // For now, return null - the API will handle getting the SHA
  // In the future, we might want to add a GET endpoint to our API
  return null
}