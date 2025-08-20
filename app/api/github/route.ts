import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'lakotafox'
const GITHUB_REPO = process.env.GITHUB_REPO || 'FOXSITE'

// Also export OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, content, message } = body

    console.log('GitHub API request for path:', path)

    if (!path || !content || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: path, content, or message' },
        { status: 400 }
      )
    }

    // If no GitHub token, save to public folder directly (for local development)
    if (!GITHUB_TOKEN) {
      console.error('GITHUB_TOKEN not configured in environment variables')
      return NextResponse.json({ 
        success: false, 
        error: 'GitHub token not configured. Please set GITHUB_TOKEN environment variable.' 
      }, { status: 500 })
    }

    // Get the current file (if it exists) to get its SHA
    let sha: string | undefined
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/public/${path}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      )

      if (getResponse.ok) {
        const fileData = await getResponse.json()
        sha = fileData.sha
      }
    } catch (error) {
      // File doesn't exist, that's ok for new files
      console.log('File does not exist yet, will create new')
    }

    // Create or update the file
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/public/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content,
          sha: sha, // Include SHA if updating existing file
          branch: 'main'
        }),
      }
    )

    if (!updateResponse.ok) {
      const error = await updateResponse.text()
      console.error('GitHub API error:', error)
      return NextResponse.json(
        { error: 'Failed to update file on GitHub' },
        { status: updateResponse.status }
      )
    }

    const result = await updateResponse.json()
    return NextResponse.json({ success: true, result })

  } catch (error) {
    console.error('Error updating GitHub file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}