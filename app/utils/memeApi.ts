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
    const response = await fetch('/api/memes');
    const data = await response.json();
    if (data.success && data.data && data.data.memes) {
      return data.data.memes;
    } else {
      console.error('Invalid API response structure:', data);
      return []; // Set empty array as fallback
    }
  } catch (error) {
    console.error('Error fetching memes:', error);
    return []; // Set empty array as fallback
  }
};