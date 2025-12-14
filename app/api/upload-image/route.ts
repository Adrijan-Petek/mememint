import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageData, fileName } = await request.json();

    if (!imageData) {
      return NextResponse.json({
        success: false,
        error: 'Image data is required'
      }, { status: 400 });
    }

    // Check if this is a video - if so, we can't upload to ImgBB (images only)
    if (imageData.startsWith('data:video/')) {
      console.log('Video detected - skipping ImgBB upload (videos not supported)');
      return NextResponse.json({
        success: true,
        shareUrl: imageData, // Return the data URL itself for now
        directUrl: imageData,
        deleteUrl: null,
        isVideo: true
      });
    }

    // Remove the data URL prefix to get just the base64 data (supports png, jpeg, jpg, gif, webp)
    const base64Data = imageData.replace(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/, '');

    // Check if we have an API key
    const apiKey = process.env.IMGBB_API_KEY || 'c36fe4e37ced31cd8339a5dfe61161de';
    if (!apiKey) {
      console.error('IMGBB_API_KEY not configured');
      return NextResponse.json({
        success: false,
        error: 'Image hosting service not configured'
      }, { status: 500 });
    }

    console.log('📤 Uploading to ImgBB...');
    console.log('  File name:', fileName || 'unnamed');
    console.log('  Base64 length:', base64Data.length);

    // Upload to ImgBB - API key must be in URL parameter, not form data
    const formData = new FormData();
    formData.append('image', base64Data);
    if (fileName) {
      formData.append('name', fileName);
    }

    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (!imgbbResponse.ok) {
      const errorText = await imgbbResponse.text();
      console.error('ImgBB upload failed:', errorText);
      return NextResponse.json({
        success: false,
        error: `Image hosting service error: ${imgbbResponse.status}`
      }, { status: 500 });
    }

    const imgbbData = await imgbbResponse.json();

    if (!imgbbData.success) {
      console.error('ImgBB upload error:', imgbbData);
      return NextResponse.json({
        success: false,
        error: imgbbData.error?.message || 'Image upload failed'
      }, { status: 500 });
    }

    // Return the ImgBB URLs
    return NextResponse.json({
      success: true,
      shareUrl: imgbbData.data.url, // Full URL for sharing
      directUrl: imgbbData.data.url, // Direct image URL
      deleteUrl: imgbbData.data.delete_url, // For potential cleanup
      isVideo: false
    });

  } catch (error) {
    console.error('Error uploading image:', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error during upload'
    }, { status: 500 });
  }
}