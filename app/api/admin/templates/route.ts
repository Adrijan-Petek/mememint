import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readdir } from 'fs/promises';
import path from 'path';

// GET - List all templates
export async function GET(_request: NextRequest) {
  try {
    const imagePath = path.join(process.cwd(), 'templets', 'image');

    const templates: { images: string[] } = {
      images: []
    };

    try {
      const imageFiles = await readdir(imagePath);
      templates.images = imageFiles.filter(file => 
        /\.(jpg|jpeg|png|webp)$/i.test(file)
      );
    } catch (error) {
      console.error('Error reading image templates:', error);
    }

    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error listing templates:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to list templates'
    }, { status: 500 });
  }
}

// POST - Upload new template
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Validate file type
    const fileName = file.name;
    const isImage = /\.(jpg|jpeg|png|webp)$/i.test(fileName);

    if (!isImage) {
      return NextResponse.json({
        success: false,
        error: 'Invalid image file. Allowed: jpg, jpeg, png, webp'
      }, { status: 400 });
    }

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    const uploadPath = path.join(process.cwd(), 'templets', 'image', fileName);
    await writeFile(uploadPath, buffer);

    return NextResponse.json({
      success: true,
      message: `Template uploaded successfully`,
      fileName
    });
  } catch (error) {
    console.error('Error uploading template:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload template'
    }, { status: 500 });
  }
}

// DELETE - Delete template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json({
        success: false,
        error: 'fileName is required'
      }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'templets', 'image', fileName);
    await unlink(filePath);

    return NextResponse.json({
      success: true,
      message: `Template deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete template'
    }, { status: 500 });
  }
}
