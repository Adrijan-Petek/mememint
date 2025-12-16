interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  lines?: number;
  isAnimated?: boolean;
}

export const fetchMemes = async (): Promise<MemeTemplate[]> => {
  try {
    // Use the templates route which returns memegen templates
    const response = await fetch('/api/memes/templates');
    const data = await response.json();
    // Normalize both possible shapes:
    // - { success: true, data: { memes: [...] } }
    // - { data: [...] }
    let memes: any[] = [];
    if (data?.success && Array.isArray(data?.data?.memes)) {
      memes = data.data.memes;
    } else if (Array.isArray(data?.data)) {
      memes = data.data;
    }

    // Map fields to MemeTemplate shape (templates endpoint returns { id, name, url, width, height, lines })
    return memes.map((m: any) => ({
      id: m.id,
      name: m.name || m.title || m.id,
      url: m.url || m.blank || m.image_url,
      width: m.width || 600,
      height: m.height || 450,
      lines: m.lines || m.lines_count || 2,
      isAnimated: !!m.isAnimated
    })) as MemeTemplate[];
  } catch (error) {
    console.error('Error fetching memes:', error);
    return []; // Set empty array as fallback
  }
};