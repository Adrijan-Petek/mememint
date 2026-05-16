import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequestBody {
  templateId: string;
  texts: string[];
  font?: string;
  background?: string;
  extension?: 'png' | 'jpg' | 'gif';
  style?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequestBody;

    console.log('Received request body:', JSON.stringify(body, null, 2));

    if (!body.templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    if (typeof body.templateId !== 'string' || body.templateId.trim() === '') {
      console.error('Invalid templateId:', body.templateId);
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    // Build payload conditionally to avoid sending undefined or empty values
    const payload: Record<string, string | string[]> = {
      template_id: body.templateId.trim(),
      text: body.texts?.length ? body.texts : ['',''],
      extension: body.extension ?? 'png'
    };

    // Only add optional parameters if they have values
    if (body.font) {
      payload.font = body.font;
    }
    
    if (body.background) {
      payload.background = body.background;
    }

    if (body.style) {
      // Memegen API expects style as an array
      payload.style = [body.style];
    }

    console.log('Sending to Memegen API:', JSON.stringify(payload, null, 2));

    // Use the template-specific endpoint for better compatibility
    const apiUrl = `https://api.memegen.link/templates/${body.templateId.trim()}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text: payload.text,
        font: payload.font,
        extension: payload.extension,
        ...(payload.style && { style: payload.style })
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Memegen API error:', response.status, response.statusText, errorText);
      console.error('Request URL:', apiUrl);
      console.error('Request body:', JSON.stringify({
        text: payload.text,
        font: payload.font,
        extension: payload.extension,
        ...(payload.style && { style: payload.style })
      }, null, 2));
      return NextResponse.json({ error: 'Failed to generate meme' }, { status: 502 });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error generating meme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}