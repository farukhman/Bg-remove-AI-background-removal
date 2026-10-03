import { removeBackground } from '@imgly/background-removal';

export interface ProcessedResult {
  cutoutBlob: Blob;
  cutoutUrl: string;
  originalUrl: string;
  width: number;
  height: number;
  originalName: string;
}

export type BackgroundMode = 'transparent' | 'color' | 'gradient' | 'blur' | 'custom';

export interface BackgroundSettings {
  mode: BackgroundMode;
  color: string;
  gradient: string;
  blurAmount: number; // 0 to 30px
  customImageUrl?: string;
}

/**
 * Loads an image from a URL, Blob, or File and returns an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = src;
  });
}

/**
 * Public CDN Path for @imgly/background-removal-data (v1.7.0)
 * Contains the official isnet_quint8 neural model for high-precision segmentation.
 */
export const IMGLY_CDN_PATH = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/';

/**
 * Automatically optimizes and resizes image before processing
 * to 1024px to prevent browser memory exhaustion on mobile devices.
 */
async function optimizeImageForProcessing(
  fileOrUrl: File | Blob | string,
  maxDimension = 1024
): Promise<Blob> {
  const url = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
  const img = await loadImage(url);
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create optimized image blob'));
      },
      'image/jpeg',
      0.92
    );
  });
}

/**
 * Pure @imgly/background-removal Engine
 * High accuracy neural network segmentation for humans, clothes, objects, and animals.
 */
export async function processBackgroundRemoval(
  fileOrUrl: File | Blob | string,
  fileName: string = 'image',
  onProgress?: (percent: number, status: string) => void
): Promise<ProcessedResult> {
  const originalUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
  
  onProgress?.(10, 'Loading image...');
  const img = await loadImage(originalUrl);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  let currentMaxPercent = 15;
  const updateProgress = (targetPercent: number, statusText: string) => {
    if (targetPercent > currentMaxPercent) {
      currentMaxPercent = Math.min(95, targetPercent);
    }
    onProgress?.(currentMaxPercent, statusText);
  };

  updateProgress(25, 'Preparing image for @imgly neural processing...');
  const optimizedBlob = await optimizeImageForProcessing(fileOrUrl, 1024);

  // Convert blob to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(optimizedBlob);
  });

  updateProgress(45, 'Processing with @imgly AI engine...');
  let cutoutBlob: Blob | null = null;
  let cutoutUrl: string | null = null;

  // 1. Primary path: Call @imgly/background-removal-node backend (100% reliable on mobile, no browser WASM limits)
  try {
    updateProgress(55, 'Analyzing subject & clothes with @imgly...');
    const response = await fetch('/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data }),
    });

    if (response.ok) {
      updateProgress(85, 'Finalizing crisp transparent PNG...');
      const data = await response.json();
      if (data.cutoutUrl) {
        cutoutUrl = data.cutoutUrl;
        const res = await fetch(data.cutoutUrl);
        cutoutBlob = await res.blob();
      }
    } else {
      const errJson = await response.json().catch(() => ({}));
      console.warn('Backend @imgly returned non-OK status:', errJson);
    }
  } catch (apiErr) {
    console.warn('Backend @imgly request error, checking client engine fallback:', apiErr);
  }

  // 2. Client fallback if server route not reachable
  if (!cutoutBlob || !cutoutUrl) {
    updateProgress(65, 'Running client-side @imgly model...');
    cutoutBlob = await removeBackground(optimizedBlob, {
      publicPath: IMGLY_CDN_PATH,
      model: 'isnet_quint8',
      device: 'cpu',
      output: {
        format: 'image/png',
        quality: 1.0,
      },
      progress: (key: string, current: number, total: number) => {
        if (total > 0) {
          const ratio = Math.min(1, Math.max(0, current / total));
          const mapped = Math.round(65 + ratio * 28);
          updateProgress(mapped, `Processing @imgly: ${mapped}%`);
        }
      },
    });
    cutoutUrl = URL.createObjectURL(cutoutBlob);
  }

  onProgress?.(100, 'Background removed cleanly with @imgly!');

  return {
    cutoutBlob,
    cutoutUrl,
    originalUrl,
    width,
    height,
    originalName: fileName.replace(/\.[^/.]+$/, ''),
  };
}

/**
 * Composite the cutout onto new background options (transparent, color, gradient, blur)
 */
export async function renderFinalCanvas(
  cutoutUrl: string,
  originalUrl: string,
  settings: BackgroundSettings,
  targetWidth?: number,
  targetHeight?: number
): Promise<HTMLCanvasElement> {
  const cutoutImg = await loadImage(cutoutUrl);
  const width = targetWidth || cutoutImg.naturalWidth || cutoutImg.width;
  const height = targetHeight || cutoutImg.naturalHeight || cutoutImg.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Draw Background
  if (settings.mode === 'color') {
    ctx.fillStyle = settings.color;
    ctx.fillRect(0, 0, width, height);
  } else if (settings.mode === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (settings.gradient === 'studio') {
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(1, '#cbd5e1');
    } else if (settings.gradient === 'sunset') {
      grad.addColorStop(0, '#ff7e5f');
      grad.addColorStop(1, '#feb47b');
    } else if (settings.gradient === 'cyber') {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#3b82f6');
      grad.addColorStop(1, '#8b5cf6');
    } else if (settings.gradient === 'mint') {
      grad.addColorStop(0, '#e0f2fe');
      grad.addColorStop(1, '#ccfbf1');
    } else if (settings.gradient === 'peach') {
      grad.addColorStop(0, '#fff1f2');
      grad.addColorStop(1, '#fde68a');
    } else {
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(1, '#1d4ed8');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (settings.mode === 'blur') {
    const originalImg = await loadImage(originalUrl);
    ctx.save();
    ctx.filter = `blur(${settings.blurAmount || 15}px)`;
    ctx.drawImage(originalImg, -20, -20, width + 40, height + 40);
    ctx.restore();
  } else if (settings.mode === 'custom' && settings.customImageUrl) {
    try {
      const bgImg = await loadImage(settings.customImageUrl);
      ctx.drawImage(bgImg, 0, 0, width, height);
    } catch {
      // fallback
    }
  }

  // 2. Draw the foreground cutout on top
  ctx.drawImage(cutoutImg, 0, 0, width, height);

  return canvas;
}

/**
 * Downloads image directly to user's computer/phone
 */
export async function downloadImage(
  cutoutUrl: string,
  originalUrl: string,
  settings: BackgroundSettings,
  fileName: string,
  format: 'png' | 'jpg'
) {
  const canvas = await renderFinalCanvas(cutoutUrl, originalUrl, settings);
  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = 1.0;

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}-bg-removed.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, mime, quality);
}

/**
 * Copies the transparent PNG image directly to clipboard
 */
export async function copyImageToClipboard(cutoutUrl: string): Promise<boolean> {
  try {
    const img = await loadImage(cutoutUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob || !navigator.clipboard) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}
