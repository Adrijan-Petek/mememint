import { getRandomRecastText } from '../hooks/useRecastText';

export const shareToImgbb = async (permanentMemeUrl: string | null) => {
  if (!permanentMemeUrl) return;

  try {
    // Get a random recast message
    const shareText = getRandomRecastText();

    // Try to use native Farcaster SDK composer first
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      console.log('🎭 Attempting native Farcaster composer...');
      console.log('📝 Using message:', shareText);
      
      const result = await sdk.actions.composeCast({
        text: shareText,
        embeds: [permanentMemeUrl]
      });
      
      console.log('✅ Compose result:', result);
      if (result?.cast) {
        alert('Cast created successfully! 🎉');
      } else if (result) {
        alert('Composer opened!');
      }
      return;
    } catch {
      console.log('⚠️ Native composer not available, using clipboard fallback');
    }

    // Web browser fallback - copy to clipboard
    console.log('📋 Copying to clipboard');
    const fullText = `${shareText}\n\n${permanentMemeUrl}`;
    await navigator.clipboard.writeText(fullText);
    alert('Meme link copied to clipboard! Share it on Farcaster.');
  } catch (error) {
    console.error('Error sharing meme:', error);
    alert('Failed to share meme. Please try again.');
  }
};

export const downloadMeme = async (generatedMeme: string | null) => {
  if (!generatedMeme) return;

  try {
    // Detect extension from URL first
    const urlExtension = generatedMeme.match(/\.(png|jpg|jpeg|gif|webp)(\?|$)/i)?.[1]?.toLowerCase();
    
    const response = await fetch(generatedMeme);
    const blob = await response.blob();
    
    // Determine extension from blob type or URL
    let extension = 'png';
    if (blob.type === 'image/jpeg') {
      extension = 'jpg';
    } else if (blob.type === 'image/gif') {
      extension = 'gif';
    } else if (blob.type === 'image/webp') {
      extension = 'webp';
    } else if (urlExtension) {
      // Fallback to URL extension if blob type is generic
      extension = urlExtension;
    }
    
    console.log('💾 Downloading meme as:', extension, 'type:', blob.type, 'size:', blob.size);
    
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `mememint-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error('Error downloading meme:', error);
    
    // Fallback: try direct download with detected extension
    const urlExtension = generatedMeme.match(/\.(png|jpg|jpeg|gif|webp)(\?|$)/i)?.[1]?.toLowerCase() || 'png';
    const a = document.createElement('a');
    a.href = generatedMeme;
    a.download = `mememint-${Date.now()}.${urlExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
