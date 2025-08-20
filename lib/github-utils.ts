// Utility to check for recent commits to avoid build conflicts
export async function checkRecentCommits(token: string): Promise<{hasRecent: boolean, message: string}> {
  try {
    const OWNER = 'lakotafox'
    const REPO = 'FOXSITE'
    
    // Get commits from last 2 minutes
    const since = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/commits?since=${since}&per_page=5`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )
    
    if (response.ok) {
      const commits = await response.json()
      if (commits.length > 0) {
        const lastCommit = commits[0]
        const secondsAgo = Math.floor((Date.now() - new Date(lastCommit.commit.author.date).getTime()) / 1000)
        
        if (secondsAgo < 30) {
          return {
            hasRecent: true,
            message: `A commit was made ${secondsAgo} seconds ago. Waiting to avoid conflicts...`
          }
        }
      }
    }
    
    return {hasRecent: false, message: ''}
  } catch (error) {
    console.error('Error checking recent commits:', error)
    return {hasRecent: false, message: ''}
  }
}

// Add delay to avoid conflicts
export async function waitForClearWindow(token: string, showMessage: (msg: string) => void): Promise<void> {
  const check = await checkRecentCommits(token)
  
  if (check.hasRecent) {
    showMessage(check.message)
    // Wait 35 seconds to ensure previous build has started
    await new Promise(resolve => setTimeout(resolve, 35000))
    showMessage('Proceeding with publish...')
  }
}