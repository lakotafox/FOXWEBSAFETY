exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { path, content, message } = JSON.parse(event.body);
    
    console.log('GitHub update request for path:', path);

    if (!path || !content || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: path, content, or message' })
      };
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER || 'lakotafox';
    const GITHUB_REPO = process.env.GITHUB_REPO || 'FOXSITE';

    if (!GITHUB_TOKEN) {
      console.error('GITHUB_TOKEN not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false,
          error: 'GitHub token not configured' 
        })
      };
    }

    // Get current file SHA if it exists
    let sha;
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/public/${path}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
      }
    } catch (error) {
      console.log('File does not exist yet, will create new');
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
          sha: sha,
          branch: 'main'
        }),
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.error('GitHub API error:', error);
      return {
        statusCode: updateResponse.status,
        body: JSON.stringify({ 
          success: false,
          error: 'Failed to update file on GitHub' 
        })
      };
    }

    const result = await updateResponse.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true, result })
    };

  } catch (error) {
    console.error('Error in GitHub function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error' 
      })
    };
  }
};