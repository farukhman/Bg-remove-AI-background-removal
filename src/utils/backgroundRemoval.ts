import * as ort from 'onnxruntime-web';

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

// Small helper to yield a frame to the browser so progress bar & animations stay 60fps smooth
const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 25));

const LOCAL_MODEL_URL = './models/u2netp.onnx';
const CDN_MODEL_URL = 'https://huggingface.co/tomjackson2023/rembg/resolve/main/u2netp.onnx';
const JSDELIVR_WASM_CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/';

let cachedSession: ort.InferenceSession | null = null;

/**
 * Fetches model ArrayBuffer with real-time download progress
 */
async function fetchModelWithProgress(
  onProgress?: (ratio: number) => void
): Promise<ArrayBuffer> {
  const urls = [LOCAL_MODEL_URL, CDN_MODEL_URL];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) continue;

      const contentLength = Number(response.headers.get('content-length')) || 4574861;
      if (!response.body) {
        const buf = await response.arrayBuffer();
        if (buf.byteLength > 100000) {
          onProgress?.(1);
          return buf;
        }
        continue;
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedLength += value.byteLength;
          onProgress?.(Math.min(1, receivedLength / contentLength));
        }
      }

      if (receivedLength < 100000) continue;

      const combined = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        combined.set(chunk, position);
        position += chunk.byteLength;
      }

      return combined.buffer;
    } catch (e) {
      console.warn(`Model fetch fallback from ${url}:`, e);
    }
  }

  throw new Error('Could not load AI segmentation model');
}

/**
 * Gets or initializes the ultra-low-memory U2-NetP ONNX session (only 4.36 MB!)
 */
async function getOrCreateSession(
  onDownloadProgress?: (ratio: number) => void
): Promise<ort.InferenceSession> {
  if (cachedSession) {
    onDownloadProgress?.(1);
    return cachedSession;
  }

  ort.env.wasm.numThreads = 1;
  ort.env.wasm.proxy = false;
  ort.env.wasm.wasmPaths = JSDELIVR_WASM_CDN;

  const modelBuffer = await fetchModelWithProgress(onDownloadProgress);
  await yieldToMain();

  try {
    cachedSession = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ['wasm'],
      enableCpuMemArena: false,
      enableMemPattern: false,
      graphOptimizationLevel: 'basic',
    });
    return cachedSession;
  } catch (firstErr) {
    // Fallback to local ./wasm/ directory if CDN wasm fails
    ort.env.wasm.wasmPaths = new URL('./wasm/', window.location.href).href;
    cachedSession = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ['wasm'],
      enableCpuMemArena: false,
      enableMemPattern: false,
      graphOptimizationLevel: 'basic',
    });
    return cachedSession;
  }
}

/**
 * Refines 320x320 neural saliency map to full resolution using edge-guided contrast matting
 */
function applyNeuralMaskToCanvas(
  img: HTMLImageElement,
  mask320: Float32Array,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  // 1. Normalize 320x320 mask to [0, 255] with crisp contrast curve
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < mask320.length; i++) {
    const v = mask320[i];
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }
  const range = maxVal - minVal || 1;

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = 320;
  maskCanvas.height = 320;
  const maskCtx = maskCanvas.getContext('2d')!;
  const maskImgData = maskCtx.createImageData(320, 320);
  const mData = maskImgData.data;

  for (let i = 0; i < mask320.length; i++) {
    let norm = (mask320[i] - minVal) / range;
    // Crisp smoothstep thresholding to eliminate faint background ghosting while preserving soft hair/clothes edges
    const low = 0.14;
    const high = 0.86;
    norm = Math.max(0, Math.min(1, (norm - low) / (high - low)));
    norm = norm * norm * (3 - 2 * norm);
    const alphaByte = Math.round(norm * 255);
    const idx = i * 4;
    mData[idx] = alphaByte;
    mData[idx + 1] = alphaByte;
    mData[idx + 2] = alphaByte;
    mData[idx + 3] = 255;
  }
  maskCtx.putImageData(maskImgData, 0, 0);

  // 2. Upscale mask smoothly to target resolution with slight edge feathering
  const fullMaskCanvas = document.createElement('canvas');
  fullMaskCanvas.width = targetWidth;
  fullMaskCanvas.height = targetHeight;
  const fullMaskCtx = fullMaskCanvas.getContext('2d')!;
  fullMaskCtx.imageSmoothingEnabled = true;
  fullMaskCtx.imageSmoothingQuality = 'high';
  fullMaskCtx.filter = 'blur(1px)';
  fullMaskCtx.drawImage(maskCanvas, 0, 0, targetWidth, targetHeight);
  fullMaskCtx.filter = 'none';

  // 3. Draw original image and apply refined alpha channel
  const outCanvas = document.createElement('canvas');
  outCanvas.width = targetWidth;
  outCanvas.height = targetHeight;
  const outCtx = outCanvas.getContext('2d')!;
  outCtx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const imgPixels = outCtx.getImageData(0, 0, targetWidth, targetHeight);
  const maskPixels = fullMaskCtx.getImageData(0, 0, targetWidth, targetHeight);
  const outData = imgPixels.data;
  const upscaledMask = maskPixels.data;

  // Sample corner/border background colors to clean up boundary transition pixels (0 < alpha < 245)
  const bgSamples: [number, number, number][] = [];
  const stepX = Math.max(1, Math.floor(targetWidth / 16));
  const stepY = Math.max(1, Math.floor(targetHeight / 16));
  for (let x = 0; x < targetWidth; x += stepX) {
    const topIdx = x * 4;
    if (upscaledMask[topIdx] < 30) {
      bgSamples.push([outData[topIdx], outData[topIdx + 1], outData[topIdx + 2]]);
    }
  }
  for (let y = 0; y < targetHeight; y += stepY) {
    const leftIdx = (y * targetWidth) * 4;
    const rightIdx = (y * targetWidth + (targetWidth - 1)) * 4;
    if (upscaledMask[leftIdx] < 30) {
      bgSamples.push([outData[leftIdx], outData[leftIdx + 1], outData[leftIdx + 2]]);
    }
    if (upscaledMask[rightIdx] < 30) {
      bgSamples.push([outData[rightIdx], outData[rightIdx + 1], outData[rightIdx + 2]]);
    }
  }

  for (let i = 0; i < outData.length; i += 4) {
    let a = upscaledMask[i];

    // Edge-guided refinement in transition zone
    if (a > 12 && a < 242 && bgSamples.length > 0) {
      const r = outData[i];
      const g = outData[i + 1];
      const b = outData[i + 2];
      let minDistSq = Infinity;
      for (let s = 0; s < bgSamples.length; s++) {
        const dr = r - bgSamples[s][0];
        const dg = g - bgSamples[s][1];
        const db = b - bgSamples[s][2];
        const dSq = dr * dr + dg * dg + db * db;
        if (dSq < minDistSq) minDistSq = dSq;
      }
      // If boundary pixel strongly matches outer background color, suppress halo
      if (minDistSq < 900) {
        a = Math.max(0, Math.round(a * 0.35));
      } else if (minDistSq > 3600 && a > 110) {
        a = Math.min(255, Math.round(a * 1.18));
      }
    } else if (a <= 12) {
      a = 0;
    } else if (a >= 242) {
      a = 255;
    }

    outData[i + 3] = a;
  }

  outCtx.putImageData(imgPixels, 0, 0);
  return outCanvas;
}

/**
 * Pure-Canvas Emergency Fallback if WebAssembly is ever unavailable on an ultra-low-RAM device
 */
function fallbackCanvasSubjectCutout(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const outCanvas = document.createElement('canvas');
  outCanvas.width = targetWidth;
  outCanvas.height = targetHeight;
  const ctx = outCanvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imgData.data;

  // Collect border color palette
  const samples: [number, number, number][] = [];
  const step = Math.max(2, Math.floor(Math.min(targetWidth, targetHeight) / 25));
  for (let x = 0; x < targetWidth; x += step) {
    const iTop = x * 4;
    const iBot = ((targetHeight - 1) * targetWidth + x) * 4;
    samples.push([data[iTop], data[iTop + 1], data[iTop + 2]]);
    samples.push([data[iBot], data[iBot + 1], data[iBot + 2]]);
  }
  for (let y = 0; y < targetHeight; y += step) {
    const iLeft = (y * targetWidth) * 4;
    const iRight = (y * targetWidth + (targetWidth - 1)) * 4;
    samples.push([data[iLeft], data[iLeft + 1], data[iLeft + 2]]);
    samples.push([data[iRight], data[iRight + 1], data[iRight + 2]]);
  }

  const cx = targetWidth * 0.5;
  const cy = targetHeight * 0.52;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const idx = (y * targetWidth + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      let minDist = Infinity;
      for (let s = 0; s < samples.length; s++) {
        const dr = r - samples[s][0];
        const dg = g - samples[s][1];
        const db = b - samples[s][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < minDist) minDist = d;
      }

      const dist = Math.sqrt(minDist);
      const nx = (x - cx) / (targetWidth * 0.48);
      const ny = (y - cy) / (targetHeight * 0.48);
      const centerWeight = Math.max(0, 1 - (nx * nx + ny * ny) * 0.45);

      const score = dist + centerWeight * 28;
      const alpha = Math.max(0, Math.min(255, Math.round(((score - 32) / 30) * 255)));
      data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return outCanvas;
}

/**
 * No-op export kept for compatibility
 */
export function preloadBackgroundRemovalEngine(): void {
  // Intentionally lazy-loaded on demand to keep initial mobile RAM usage at 0 MB
}

/**
 * Fast, Low-Memory Neural Background Removal Engine (U2-NetP + Edge-Guided Matting)
 * Uses only 4.36 MB model memory so it never crashes mobile browsers or gets stuck at 87%.
 */
export async function processBackgroundRemoval(
  fileOrUrl: File | Blob | string,
  fileName: string = 'image',
  onProgress?: (percent: number, status: string) => void
): Promise<ProcessedResult> {
  const originalUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);

  onProgress?.(10, 'Loading image...');
  await yieldToMain();

  const img = await loadImage(originalUrl);
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  // Cap output canvas dimension at 1400px for crisp HD quality + safe mobile memory
  const maxOutDim = 1400;
  let targetWidth = origWidth;
  let targetHeight = origHeight;
  if (targetWidth > maxOutDim || targetHeight > maxOutDim) {
    if (targetWidth > targetHeight) {
      targetHeight = Math.round((targetHeight * maxOutDim) / targetWidth);
      targetWidth = maxOutDim;
    } else {
      targetWidth = Math.round((targetWidth * maxOutDim) / targetHeight);
      targetHeight = maxOutDim;
    }
  }

  onProgress?.(22, 'Preparing 320x320 neural input tensor...');
  await yieldToMain();

  // Prepare 320x320 RGB input tensor with standard ImageNet normalization
  const prepCanvas = document.createElement('canvas');
  prepCanvas.width = 320;
  prepCanvas.height = 320;
  const prepCtx = prepCanvas.getContext('2d')!;
  prepCtx.drawImage(img, 0, 0, 320, 320);
  const prepData = prepCtx.getImageData(0, 0, 320, 320).data;

  const stride = 320 * 320;
  const float32Data = new Float32Array(3 * stride);
  let maxPix = 0;
  for (let i = 0; i < prepData.length; i += 4) {
    if (prepData[i] > maxPix) maxPix = prepData[i];
    if (prepData[i + 1] > maxPix) maxPix = prepData[i + 1];
    if (prepData[i + 2] > maxPix) maxPix = prepData[i + 2];
  }
  if (maxPix === 0) maxPix = 255;

  for (let i = 0; i < stride; i++) {
    const idx = i * 4;
    const r = prepData[idx] / maxPix;
    const g = prepData[idx + 1] / maxPix;
    const b = prepData[idx + 2] / maxPix;
    float32Data[i] = (r - 0.485) / 0.229;
    float32Data[stride + i] = (g - 0.456) / 0.224;
    float32Data[2 * stride + i] = (b - 0.406) / 0.225;
  }

  let outCanvas: HTMLCanvasElement;

  try {
    onProgress?.(32, 'Loading lightweight AI segmentation model...');
    await yieldToMain();

    const session = await getOrCreateSession((ratio) => {
      const mapped = Math.round(32 + ratio * 30); // 32% -> 62%
      onProgress?.(mapped, `Loading AI model: ${mapped}%`);
    });

    onProgress?.(68, 'Analyzing subject, clothes & hair...');
    await yieldToMain();

    // Smoothly tick from 68% -> 88% if inference takes a moment
    let currentTick = 68;
    const ticker = setInterval(() => {
      if (currentTick < 88) {
        currentTick += 3;
        onProgress?.(currentTick, `AI segmenting subject & edges: ${currentTick}%`);
      }
    }, 180);

    let outputMap: ort.InferenceSession.OnnxValueMapType;
    try {
      const inputTensor = new ort.Tensor('float32', float32Data, [1, 3, 320, 320]);
      const inputName = session.inputNames[0] || 'input.1';
      outputMap = await session.run({ [inputName]: inputTensor });
    } finally {
      clearInterval(ticker);
    }

    onProgress?.(92, 'Refining high-resolution transparent edges...');
    await yieldToMain();

    const firstOutputName = session.outputNames[0];
    const maskTensor = outputMap[firstOutputName];
    const maskData = maskTensor.data as Float32Array;

    outCanvas = applyNeuralMaskToCanvas(img, maskData, targetWidth, targetHeight);
  } catch (wasmErr) {
    console.warn('WASM neural session fallback triggered:', wasmErr);
    onProgress?.(85, 'Applying smart edge segmentation...');
    await yieldToMain();
    outCanvas = fallbackCanvasSubjectCutout(img, targetWidth, targetHeight);
  }

  onProgress?.(97, 'Encoding crisp transparent PNG...');
  await yieldToMain();

  const cutoutBlob = await new Promise<Blob>((resolve, reject) => {
    outCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode transparent PNG'));
      },
      'image/png',
      1.0
    );
  });

  const cutoutUrl = URL.createObjectURL(cutoutBlob);
  onProgress?.(100, '100% Complete! Transparent PNG Ready');

  return {
    cutoutBlob,
    cutoutUrl,
    originalUrl,
    width: origWidth,
    height: origHeight,
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

  ctx.clearRect(0, 0, width, height);

  if (settings.mode === 'color') {
    ctx.fillStyle = settings.color || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else if (settings.mode === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    switch (settings.gradient) {
      case 'sunset':
        grad.addColorStop(0, '#f97316');
        grad.addColorStop(0.5, '#ec4899');
        grad.addColorStop(1, '#8b5cf6');
        break;
      case 'ocean':
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(0.5, '#3b82f6');
        grad.addColorStop(1, '#1d4ed8');
        break;
      case 'emerald':
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(0.5, '#059669');
        grad.addColorStop(1, '#047857');
        break;
      case 'royal':
        grad.addColorStop(0, '#6366f1');
        grad.addColorStop(0.5, '#8b5cf6');
        grad.addColorStop(1, '#d946ef');
        break;
      case 'gold':
        grad.addColorStop(0, '#fbbf24');
        grad.addColorStop(0.5, '#f59e0b');
        grad.addColorStop(1, '#b45309');
        break;
      case 'midnight':
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#1e293b');
        grad.addColorStop(1, '#334155');
        break;
      case 'peach':
        grad.addColorStop(0, '#fda4af');
        grad.addColorStop(1, '#fde68a');
        break;
      case 'sky':
      default:
        grad.addColorStop(0, '#e0f2fe');
        grad.addColorStop(0.5, '#bae6fd');
        grad.addColorStop(1, '#7dd3fc');
        break;
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (settings.mode === 'blur') {
    const origImg = await loadImage(originalUrl);
    ctx.save();
    const blurPx = settings.blurAmount ?? 12;
    ctx.filter = `blur(${blurPx}px)`;
    const expand = blurPx * 2;
    ctx.drawImage(origImg, -expand, -expand, width + expand * 2, height + expand * 2);
    ctx.restore();
  } else if (settings.mode === 'custom' && settings.customImageUrl) {
    const customBg = await loadImage(settings.customImageUrl);
    const bgRatio = customBg.width / customBg.height;
    const canvasRatio = width / height;
    let drawW = width;
    let drawH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (bgRatio > canvasRatio) {
      drawW = height * bgRatio;
      offsetX = -(drawW - width) / 2;
    } else {
      drawH = width / bgRatio;
      offsetY = -(drawH - height) / 2;
    }
    ctx.drawImage(customBg, offsetX, offsetY, drawW, drawH);
  }

  ctx.drawImage(cutoutImg, 0, 0, width, height);
  return canvas;
}

/**
 * Trigger high-resolution PNG download of a canvas
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename || 'image'}-bg-removed.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, 'image/png', 1.0);
}

/**
 * Downloads final composited image as PNG or JPG
 */
export async function downloadImage(
  cutoutUrl: string,
  originalUrl: string,
  settings: BackgroundSettings,
  originalName: string = 'image',
  format: 'png' | 'jpg' = 'png'
): Promise<void> {
  const effectiveSettings: BackgroundSettings =
    format === 'jpg' && settings.mode === 'transparent'
      ? { ...settings, mode: 'color', color: '#ffffff' }
      : settings;

  const canvas = await renderFinalCanvas(cutoutUrl, originalUrl, effectiveSettings);
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpg' ? 0.94 : 1.0;

  return new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${originalName || 'cutout'}-bg-removed.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        resolve();
      },
      mimeType,
      quality
    );
  });
}

/**
 * Copies transparent cutout PNG to clipboard
 */
export async function copyImageToClipboard(cutoutUrl: string): Promise<boolean> {
  try {
    const res = await fetch(cutoutUrl);
    const blob = await res.blob();
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Clipboard copy failed:', e);
    return false;
  }
}

