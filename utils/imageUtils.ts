export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

export const createCombinedImage = async (
  images: string[],
  layout: '2x2' | 'horizontal' | 'vertical',
  panels: any[]
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get canvas context");

  const loadedImages = await Promise.all(
    images.map((src) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    })
  );

  // Define dimensions (assuming generic 1024x1024 per panel for calculation, but scaling)
  // We'll use the width of the first image as base
  const baseWidth = loadedImages[0].width;
  const baseHeight = loadedImages[0].height;
  
  // Extra space for text below image
  const textHeight = 250; 
  const panelTotalHeight = baseHeight + textHeight;

  if (layout === '2x2') {
    canvas.width = baseWidth * 2;
    canvas.height = panelTotalHeight * 2;
  } else if (layout === 'horizontal') {
    canvas.width = baseWidth * 4;
    canvas.height = panelTotalHeight;
  } else {
    // Vertical
    canvas.width = baseWidth;
    canvas.height = panelTotalHeight * 4;
  }

  // Draw background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  loadedImages.forEach((img, i) => {
    let x = 0;
    let y = 0;

    if (layout === '2x2') {
      x = (i % 2) * baseWidth;
      y = Math.floor(i / 2) * panelTotalHeight;
    } else if (layout === 'horizontal') {
      x = i * baseWidth;
      y = 0;
    } else {
      x = 0;
      y = i * panelTotalHeight;
    }

    // Draw Image
    ctx.drawImage(img, x, y, baseWidth, baseHeight);

    // Draw Dialogue
    ctx.fillStyle = '#333';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    
    const panelData = panels[i];
    const textYStart = y + baseHeight + 40;
    
    // Simple text wrapping logic could go here, but for now simple line printing
    let currentTextY = textYStart;
    
    panelData.dialogues.forEach((d: any) => {
      const line = `${d.speaker}: ${d.text}`;
      ctx.fillText(line, x + (baseWidth / 2), currentTextY);
      currentTextY += 35;
    });
  });

  return canvas;
};