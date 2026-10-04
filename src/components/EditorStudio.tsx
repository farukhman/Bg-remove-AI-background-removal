import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  ArrowLeft,
  Sliders,
  Columns,
  Image as ImageIcon,
  Copy,
  Check,
  RotateCcw,
  Paintbrush,
  Eraser,
  RefreshCw,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Upload,
  CheckCircle2,
  Wand2,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { Language, translations } from '../utils/translations';
import {
  ProcessedResult,
  BackgroundSettings,
  downloadImage,
  copyImageToClipboard,
  loadImage,
} from '../utils/backgroundRemoval';
import { ProcessingAdBanner, DownloadVideoAdModal } from './AdComponents';

interface EditorStudioProps {
  currentLang: Language;
  result: ProcessedResult | null;
  isProcessing: boolean;
  progressPercent: number;
  progressStatus: string;
  uploadingImageUrl?: string;
  onBackToHome: () => void;
  onUploadAnother: () => void;
}

export const EditorStudio: React.FC<EditorStudioProps> = ({
  currentLang,
  result,
  isProcessing,
  progressPercent,
  progressStatus,
  uploadingImageUrl,
  onBackToHome,
  onUploadAnother,
}) => {
  const t = translations[currentLang];
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'single'>('slider');
  const [sliderPos, setSliderPos] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadAdModal, setShowDownloadAdModal] = useState(false);
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState<'png' | 'jpg'>('png');

  // Background settings
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>({
    mode: 'transparent',
    color: '#ffffff',
    gradient: 'studio',
    blurAmount: 15,
  });

  // Refine brush state
  const [isBrushMode, setIsBrushMode] = useState(false);
  const [brushTool, setBrushTool] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState(25);
  const [customBgInput, setCustomBgInput] = useState<string | null>(null);

  // Canvas ref for touch-up
  const brushCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);
  const bgUploadInputRef = useRef<HTMLInputElement | null>(null);

  // Copy toast handler
  const handleCopy = async () => {
    if (!result) return;
    const success = await copyImageToClipboard(result.cutoutUrl);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Download button trigger -> Opens the 10-second YouTube-style Video Ad popup first
  const handleDownload = (format: 'png' | 'jpg') => {
    if (!result) return;
    setPendingDownloadFormat(format);
    setShowDownloadAdModal(true);
  };

  // Actual download after user clicks "Skip Ad" (after 10 seconds)
  const executeActualDownload = async () => {
    if (!result) return;
    setShowDownloadAdModal(false);
    setIsDownloading(true);
    try {
      await downloadImage(
        result.cutoutUrl,
        result.originalUrl,
        bgSettings,
        result.originalName,
        pendingDownloadFormat
      );
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Split slider mouse/touch drag handler
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  // Custom background file handler
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCustomBgInput(url);
      setBgSettings((prev) => ({
        ...prev,
        mode: 'custom',
        customImageUrl: url,
      }));
    }
  };

  // Solid color presets
  const colorPresets = [
    { label: 'Pure White (Passport/E-com)', value: '#ffffff' },
    { label: 'Deep Black', value: '#0f172a' },
    { label: 'Cloud Gray', value: '#e2e8f0' },
    { label: 'Royal Blue', value: '#2563eb' },
    { label: 'Pastel Sky', value: '#dbeafe' },
    { label: 'Mint Green', value: '#d1fae5' },
    { label: 'Warm Peach', value: '#fee2e2' },
    { label: 'Lavender', value: '#ede9fe' },
    { label: 'Vibrant Coral', value: '#f97316' },
  ];

  // Gradient presets
  const gradientPresets = [
    { id: 'studio', label: 'Studio Silver', class: 'from-slate-100 to-slate-300' },
    { id: 'sunset', label: 'Sunset Glow', class: 'from-orange-400 to-rose-400' },
    { id: 'cyber', label: 'Cyber Blue', class: 'from-slate-900 via-blue-600 to-purple-600' },
    { id: 'mint', label: 'Mint Breeze', class: 'from-sky-100 to-teal-100' },
    { id: 'peach', label: 'Warm Peach', class: 'from-rose-100 to-amber-100' },
  ];

  if (isProcessing) {
    // Calculate SVG circle progress
    const radius = 38;
    const circumference = 2 * Math.PI * radius; // ~238.76
    const strokeDashoffset = circumference - (circumference * Math.min(100, Math.max(0, progressPercent))) / 100;

    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-white via-blue-50/30 to-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
        {/* Soft light glow backdrop aura */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-lg bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_rgba(37,99,235,0.08)] space-y-6 text-center">
          {/* Interactive Scanning Picture HUD */}
          {uploadingImageUrl ? (
            <div className="relative mx-auto max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden border-2 border-blue-100 shadow-lg group bg-slate-50 checkerboard-pattern">
              {/* Corner HUD brackets */}
              <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-blue-600 z-20 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-blue-600 z-20 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-blue-600 z-20 pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-blue-600 z-20 pointer-events-none" />

              {/* Uploaded Image */}
              <img
                src={uploadingImageUrl}
                alt="Scanning..."
                className="w-full h-auto max-h-[260px] object-contain mx-auto"
              />

              {/* Laser Scanning Beam Sweeper */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent shadow-[0_0_16px_#2563eb] animate-laser-scan z-10 pointer-events-none" />

              {/* Subtle Tech Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-10" />

              {/* Status pill over image */}
              <div className="absolute bottom-2.5 inset-x-3 z-20 bg-white/95 backdrop-blur-md py-1.5 px-3 rounded-xl border border-blue-100 shadow-md text-[11px] font-mono text-blue-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Cpu className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span>Scanning Pixels...</span>
                </span>
                <span className="font-bold text-blue-600">{progressPercent}%</span>
              </div>
            </div>
          ) : (
            /* Fallback Circular Ring Icon if image not yet loaded */
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse-ring" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Wand2 className="w-8 h-8 text-white animate-bounce" />
              </div>
            </div>
          )}

          {/* Circular SVG Gauge & Percentage */}
          <div className="flex items-center justify-center gap-4 py-1">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Dynamic Gradient Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-75 ease-linear"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="50%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black tracking-tight text-blue-600 font-mono">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Title & Status */}
            <div className="text-left space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{progressPercent >= 100 ? 'Transparent PNG Ready!' : 'Analyzing Image...'}</span>
                {progressPercent >= 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" />
                ) : (
                  <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                )}
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm font-medium leading-snug">
                {progressStatus || 'Preserving clothes, hair & fine edges...'}
              </p>
            </div>
          </div>

          {/* Real-time 3-Step Milestones */}
          <div className="space-y-2.5 text-left bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80">
            {/* Step 1 */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    progressPercent >= 30
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-blue-100 text-blue-700 border border-blue-300 animate-pulse'
                  }`}
                >
                  {progressPercent >= 30 ? '✓' : '1'}
                </div>
                <span className={progressPercent >= 30 ? 'text-slate-800 font-semibold' : 'text-slate-600'}>
                  Contour & Edge Detection
                </span>
              </div>
              <span className={`text-[11px] font-mono font-semibold ${progressPercent >= 30 ? 'text-emerald-600' : 'text-blue-600'}`}>
                {progressPercent >= 30 ? 'Done' : 'Active'}
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    progressPercent >= 85
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : progressPercent >= 30
                      ? 'bg-blue-100 text-blue-700 border border-blue-300 animate-pulse'
                      : 'bg-slate-200/70 text-slate-500'
                  }`}
                >
                  {progressPercent >= 85 ? '✓' : '2'}
                </div>
                <span className={progressPercent >= 85 ? 'text-slate-800 font-semibold' : progressPercent >= 30 ? 'text-blue-700 font-semibold' : 'text-slate-400'}>
                  AI Clothes & Hair Segmentation
                </span>
              </div>
              <span className={`text-[11px] font-mono font-semibold ${progressPercent >= 85 ? 'text-emerald-600' : progressPercent >= 30 ? 'text-blue-600' : 'text-slate-400'}`}>
                {progressPercent >= 85 ? 'Done' : progressPercent >= 30 ? 'Processing' : 'Waiting'}
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    progressPercent >= 100
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : progressPercent >= 85
                      ? 'bg-blue-100 text-blue-700 border border-blue-300 animate-pulse'
                      : 'bg-slate-200/70 text-slate-500'
                  }`}
                >
                  {progressPercent >= 100 ? '✓' : '3'}
                </div>
                <span className={progressPercent >= 100 ? 'text-emerald-700 font-bold' : progressPercent >= 85 ? 'text-blue-700 font-semibold' : 'text-slate-400'}>
                  Transparent PNG Extraction
                </span>
              </div>
              <span className={`text-[11px] font-mono font-semibold ${progressPercent >= 100 ? 'text-emerald-600' : progressPercent >= 85 ? 'text-blue-600' : 'text-slate-400'}`}>
                {progressPercent >= 100 ? 'Complete' : progressPercent >= 85 ? 'Extracting' : 'Waiting'}
              </span>
            </div>
          </div>

          {/* Celebratory Completion Alert */}
          {progressPercent >= 100 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Complete! Opening in Transparent Editor...</span>
            </div>
          )}

          {/* Ad Placement #1: Runs while picture is uploading & processing */}
          <ProcessingAdBanner />

          {/* Bottom Cancel / Back Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={onBackToHome}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 underline transition-colors cursor-pointer"
            >
              Cancel & Upload Another Image
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Workspace Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Back button & file info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold text-sm px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.editor.backToHome}</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="font-semibold text-slate-700 truncate max-w-[140px]">
              {result.originalName}
            </span>
            <span>•</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
              {result.width} × {result.height}px
            </span>
          </div>
        </div>

        {/* Right: Actions (Copy + Download HD PNG + Download JPG) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onUploadAnother}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
          >
            {t.editor.uploadAnother}
          </button>

          <button
            onClick={handleCopy}
            disabled={isCopied}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-all shadow-2xs"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">{t.editor.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.editor.copyClipboard}</span>
              </>
            )}
          </button>

          {/* Download JPG with selected background */}
          {bgSettings.mode !== 'transparent' && (
            <button
              onClick={() => handleDownload('jpg')}
              disabled={isDownloading}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.editor.downloadJpg}</span>
            </button>
          )}

          {/* Primary Download HD PNG */}
          <button
            onClick={() => handleDownload('png')}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold px-5 py-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t.editor.downloadHd}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Canvas Stage + Controls Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PREVIEW STAGE (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          
          {/* View Mode Switcher */}
          <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('slider')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'slider'
                    ? 'bg-blue-50 text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{t.editor.splitSlider}</span>
              </button>

              <button
                onClick={() => setViewMode('side-by-side')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'side-by-side'
                    ? 'bg-blue-50 text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{t.editor.sideBySide}</span>
              </button>

              <button
                onClick={() => setViewMode('single')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'single'
                    ? 'bg-blue-50 text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{t.editor.onlyCutout}</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-semibold text-slate-500 w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="text-[11px] font-semibold text-slate-500 px-2 py-1 hover:bg-slate-100 rounded"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Canvas Preview Container */}
          <div className="w-full bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm overflow-hidden flex items-center justify-center min-h-[460px]">
            
            {/* 1. SLIDER MODE */}
            {viewMode === 'slider' && (
              <div
                ref={sliderContainerRef}
                onMouseMove={(e) => e.buttons === 1 && handleSliderMove(e.clientX)}
                onTouchMove={(e) => e.touches[0] && handleSliderMove(e.touches[0].clientX)}
                onClick={(e) => handleSliderMove(e.clientX)}
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                className="relative max-w-full max-h-[580px] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-md checkerboard-pattern transition-transform duration-100"
              >
                {/* Background Layer with chosen settings */}
                <div
                  className="w-full h-full relative"
                  style={{
                    backgroundColor: bgSettings.mode === 'color' ? bgSettings.color : undefined,
                  }}
                >
                  {/* If blur mode */}
                  {bgSettings.mode === 'blur' && (
                    <img
                      src={result.originalUrl}
                      alt="Blurred original"
                      className="absolute inset-0 w-full h-full object-contain scale-110 filter pointer-events-none"
                      style={{ filter: `blur(${bgSettings.blurAmount}px)` }}
                    />
                  )}

                  {/* Cutout foreground */}
                  <img
                    src={result.cutoutUrl}
                    alt="Foreground Cutout"
                    className="block max-h-[560px] w-auto object-contain mx-auto pointer-events-none relative z-10"
                  />
                </div>

                {/* Original Layer overlay clipped to slider position */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none z-20"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={result.originalUrl}
                    alt="Original"
                    className="block max-h-[560px] w-auto object-contain mx-auto"
                  />
                </div>

                {/* Divider Line & Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-xl pointer-events-none z-30"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                    <Sliders className="w-4 h-4" />
                  </div>
                </div>

                {/* Tags */}
                <div className="absolute top-3 left-3 z-30 pointer-events-none">
                  <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {t.hero.originalImage}
                  </span>
                </div>
                <div className="absolute top-3 right-3 z-30 pointer-events-none">
                  <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {t.hero.backgroundRemoved}
                  </span>
                </div>
              </div>
            )}

            {/* 2. SIDE-BY-SIDE MODE */}
            {viewMode === 'side-by-side' && (
              <div 
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                className="w-full flex flex-col md:flex-row items-center justify-center gap-6"
              >
                {/* Original */}
                <div className="flex-1 max-w-[340px] bg-slate-100 rounded-2xl p-2.5 shadow-sm border border-slate-200">
                  <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-slate-200">
                    <span className="absolute top-2 left-2 z-10 bg-slate-900/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {t.hero.originalImage}
                    </span>
                    <img
                      src={result.originalUrl}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Cutout */}
                <div className="flex-1 max-w-[340px] bg-slate-100 rounded-2xl p-2.5 shadow-sm border border-slate-200">
                  <div
                    className="relative rounded-xl overflow-hidden aspect-[3/4] checkerboard-pattern"
                    style={{
                      backgroundColor: bgSettings.mode === 'color' ? bgSettings.color : undefined,
                    }}
                  >
                    <span className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {t.hero.backgroundRemoved}
                    </span>
                    <img
                      src={result.cutoutUrl}
                      alt="Cutout"
                      className="w-full h-full object-contain relative z-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. SINGLE CUTOUT MODE */}
            {viewMode === 'single' && (
              <div
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                className="relative max-h-[580px] rounded-2xl overflow-hidden checkerboard-pattern shadow-md"
              >
                <div
                  className="w-full h-full relative"
                  style={{
                    backgroundColor: bgSettings.mode === 'color' ? bgSettings.color : undefined,
                  }}
                >
                  {bgSettings.mode === 'blur' && (
                    <img
                      src={result.originalUrl}
                      alt="Blurred original"
                      className="absolute inset-0 w-full h-full object-contain scale-110 filter pointer-events-none"
                      style={{ filter: `blur(${bgSettings.blurAmount}px)` }}
                    />
                  )}
                  <img
                    src={result.cutoutUrl}
                    alt="Cutout Preview"
                    className="block max-h-[560px] w-auto object-contain mx-auto relative z-1"
                  />
                </div>
              </div>
            )}

          </div>

          <p className="text-center text-xs text-slate-400">
            {viewMode === 'slider' ? t.hero.interactiveNotice : '100% transparent alpha channel preserved'}
          </p>
        </div>

        {/* CONTROLS SIDEBAR (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Background Customizer Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
              <span>{t.editor.backgroundPresets}</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {bgSettings.mode.toUpperCase()}
              </span>
            </h3>

            {/* Mode selection buttons */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setBgSettings((s) => ({ ...s, mode: 'transparent' }))}
                className={`py-2 px-1 rounded-xl transition-all text-center ${
                  bgSettings.mode === 'transparent'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Clear
              </button>
              <button
                onClick={() => setBgSettings((s) => ({ ...s, mode: 'color' }))}
                className={`py-2 px-1 rounded-xl transition-all text-center ${
                  bgSettings.mode === 'color'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Color
              </button>
              <button
                onClick={() => setBgSettings((s) => ({ ...s, mode: 'gradient' }))}
                className={`py-2 px-1 rounded-xl transition-all text-center ${
                  bgSettings.mode === 'gradient'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gradient
              </button>
              <button
                onClick={() => setBgSettings((s) => ({ ...s, mode: 'blur' }))}
                className={`py-2 px-1 rounded-xl transition-all text-center ${
                  bgSettings.mode === 'blur'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Blur
              </button>
            </div>

            {/* TAB CONTENT: 1. TRANSPARENT */}
            {bgSettings.mode === 'transparent' && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl checkerboard-pattern border border-slate-300 mx-auto shadow-2xs" />
                <p className="text-xs font-semibold text-slate-800">
                  {t.editor.transparent} PNG
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Best for design in Photoshop, Canva, website banners, and e-commerce listings.
                </p>
              </div>
            )}

            {/* TAB CONTENT: 2. SOLID COLOR */}
            {bgSettings.mode === 'color' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  {t.editor.colors}
                </label>

                <div className="grid grid-cols-5 gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setBgSettings((s) => ({ ...s, color: preset.value }))}
                      title={preset.label}
                      style={{ backgroundColor: preset.value }}
                      className={`w-full aspect-square rounded-xl border-2 transition-all transform hover:scale-105 ${
                        bgSettings.color === preset.value
                          ? 'border-blue-600 shadow-sm scale-105'
                          : 'border-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Custom HEX picker */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="color"
                    value={bgSettings.color}
                    onChange={(e) => setBgSettings((s) => ({ ...s, color: e.target.value }))}
                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={bgSettings.color}
                      onChange={(e) => setBgSettings((s) => ({ ...s, color: e.target.value }))}
                      className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. GRADIENTS */}
            {bgSettings.mode === 'gradient' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  {t.editor.gradients}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {gradientPresets.map((grad) => (
                    <button
                      key={grad.id}
                      onClick={() => setBgSettings((s) => ({ ...s, gradient: grad.id }))}
                      className={`h-12 rounded-xl bg-gradient-to-r ${grad.class} flex items-center justify-center text-xs font-bold transition-all border ${
                        bgSettings.gradient === grad.id
                          ? 'border-blue-600 shadow-sm ring-2 ring-blue-500/20 text-slate-900'
                          : 'border-slate-200 text-slate-800'
                      }`}
                    >
                      {grad.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. PORTRAIT BOKEH BLUR */}
            {bgSettings.mode === 'blur' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{t.editor.blurAmount}</span>
                  <span className="font-mono text-blue-600">{bgSettings.blurAmount}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="35"
                  value={bgSettings.blurAmount}
                  onChange={(e) =>
                    setBgSettings((s) => ({ ...s, blurAmount: parseInt(e.target.value) }))
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Blurs the original background while keeping the subject crisp, creating a DSLR portrait camera look!
                </p>
              </div>
            )}

            {/* Custom image background upload */}
            <div className="pt-3 border-t border-slate-100">
              <input
                type="file"
                ref={bgUploadInputRef}
                onChange={handleCustomBgUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => bgUploadInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 hover:border-blue-400 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload Custom Backdrop Photo</span>
              </button>
            </div>

          </div>

          {/* Quick Download Summary Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-md shadow-blue-500/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Full Resolution Ready</h4>
                <p className="text-blue-100 text-xs">{result.width} × {result.height} pixels</p>
              </div>
            </div>

            <button
              onClick={() => handleDownload('png')}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-blue-50 active:scale-98 text-blue-600 font-bold text-sm py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t.editor.downloadHd}</span>
            </button>

            <p className="text-center text-[11px] text-blue-100/90">
              Free instant download • No watermarks • No limits
            </p>
          </div>

        </div>

      </div>

      {/* Ad Placement #2: Compact Video Ad Modal ("Choti Screen") with 10s YouTube-Style Skip Ad */}
      <DownloadVideoAdModal
        isOpen={showDownloadAdModal}
        format={pendingDownloadFormat}
        onCompleteDownload={executeActualDownload}
        onClose={() => setShowDownloadAdModal(false)}
      />
    </div>
  );
};
