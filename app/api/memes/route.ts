import { NextResponse } from 'next/server';

interface MemegenTemplate {
  id: string;
  name: string;
  lines: number;
  overlays: number;
  blank: string;
}

export async function GET() {
  try {
    const response = await fetch('https://api.memegen.link/templates', {
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Failed to fetch memegen templates:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 502 });
    }

    const templates: MemegenTemplate[] = await response.json();

    const normalized = templates.map(template => ({
      id: template.id,
      name: template.name,
      url: template.blank,
      width: 600,
      height: 450,
      lines: template.lines ?? 2
    }));

    return NextResponse.json({
      success: true,
      data: {
        memes: normalized
      }
    }, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
  } catch (error) {
    console.error('Error fetching memegen templates:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}