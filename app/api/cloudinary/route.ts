import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image, cloudName, uploadPreset } = await request.json()
    
    if (!image || !cloudName || !uploadPreset) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const formData = new FormData()
    formData.append('file', image)
    formData.append('upload_preset', uploadPreset)
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error('Cloudinary upload failed')
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      url: data.secure_url,
      publicId: data.public_id
    })
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    )
  }
}