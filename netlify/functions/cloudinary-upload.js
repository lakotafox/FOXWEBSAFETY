exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { image, cloudName, uploadPreset } = JSON.parse(event.body);
    
    console.log('Cloudinary upload request');
    console.log('Cloud name:', cloudName);
    console.log('Upload preset:', uploadPreset);
    console.log('Image data length:', image ? image.length : 0);
    
    if (!image || !cloudName || !uploadPreset) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        })
      };
    }

    // Simple approach: Use fetch with form-encoded data
    // Cloudinary accepts base64 data URIs directly
    const params = new URLSearchParams();
    params.append('file', image);
    params.append('upload_preset', uploadPreset);
    
    console.log('Sending to Cloudinary...');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: params
      }
    );

    const responseText = await response.text();
    console.log('Cloudinary response status:', response.status);
    
    if (!response.ok) {
      console.error('Cloudinary API error:', responseText);
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          error: 'Cloudinary upload failed',
          details: responseText
        })
      };
    }

    const data = JSON.parse(responseText);
    console.log('Cloudinary upload successful:', data.secure_url);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        url: data.secure_url,
        publicId: data.public_id
      })
    };

  } catch (error) {
    console.error('Error in Cloudinary function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      })
    };
  }
};