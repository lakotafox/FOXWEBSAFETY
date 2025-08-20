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
    const contentBase64 = typeof content === 'string' 
      ? content 
      : btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))))
    
    const response = await fetch('/api/github', {
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