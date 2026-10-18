import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeatureGrid } from './components/FeatureGrid';
import { HowItWorks } from './components/HowItWorks';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { EditorStudio } from './components/EditorStudio';
import { OfflineIndicator } from './components/PWAInstallButton';
import { Language } from './utils/translations';
import {
  ProcessedResult,
  processBackgroundRemoval,
  preloadBackgroundRemovalEngine,
  loadImage,
} from './utils/backgroundRemoval';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [uploadingImageUrl, setUploadingImageUrl] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Warm up lightweight 4.36MB AI engine immediately on page load so uploads process in ~1 second
  useEffect(() => {
    preloadBackgroundRemovalEngine();
  }, []);

  // Trigger file selection dialog
  const handleOpenUpload = () => {
    fileInputRef.current?.click();
  };

  // Main background removal processing trigger with smooth 1% -> 2% -> 3% ... -> 100% counter
  const handleImageSelected = async (
    fileOrUrl: File | string,
    name?: string,
    preCutoutUrl?: string
  ) => {
    const previewUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
    setUploadingImageUrl(previewUrl);
    setShowEditor(true);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setIsProcessing(true);
    setProgressPercent(1);
    setProgressStatus('Scanning image & detecting contours: 1%');

    const getStatusForPercent = (pct: number) => {
      if (pct <= 28) return `Scanning image & detecting contours: ${pct}%`;
      if (pct <= 65) return `AI segmenting subject, clothes & hair: ${pct}%`;
      if (pct <= 92) return `Removing background & refining edges: ${pct}%`;
      if (pct < 100) return `Finalizing crisp transparent PNG: ${pct}%`;
      return '100% Complete! Transparent PNG Ready';
    };

    let targetPct = 15;
    let currentPct = 1;
    let isTaskDone = false;
    let processedData: ProcessedResult | null = null;
    let processingError: Error | null = null;

    // Start background removal worker in parallel
    const workPromise = (async () => {
      if (preCutoutUrl) {
        try {
          const originalUrl = previewUrl;
          const [img, res] = await Promise.all([
            loadImage(originalUrl),
            fetch(preCutoutUrl),
          ]);
          const blob = await res.blob();
          processedData = {
            cutoutBlob: blob,
            cutoutUrl: preCutoutUrl,
            originalUrl,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            originalName: (name || 'sample').replace(/\.[^/.]+$/, ''),
          };
          targetPct = 100;
          isTaskDone = true;
          return;
        } catch (e) {
          console.warn('Pre-cutout load failed, running local engine:', e);
        }
      }

      processedData = await processBackgroundRemoval(fileOrUrl, name || 'image', (pct, status) => {
        targetPct = Math.max(targetPct, pct);
        if (status) setProgressStatus(status);
      });
      targetPct = 100;
      isTaskDone = true;
    })().catch((err: any) => {
      isTaskDone = true;
      processingError = err instanceof Error ? err : new Error(String(err));
    });

    try {
      const startTime = Date.now();

      while (currentPct < 100) {
        if (processingError) throw processingError;

        // Safety timeout of 12s so it never stays stuck indefinitely
        if (Date.now() - startTime > 12000 && !isTaskDone) {
          throw new Error('Processing timed out. Please try again with another image.');
        }

        // Cap at 94% until the cutout task is 100% resolved
        const maxAllowed = isTaskDone ? 100 : 94;
        const effectiveTarget = Math.min(maxAllowed, targetPct);

        if (currentPct < effectiveTarget) {
          const delta = effectiveTarget - currentPct;
          const step = Math.max(1, Math.ceil(delta * (isTaskDone ? 0.35 : 0.16)));
          currentPct = Math.min(effectiveTarget, currentPct + step);
        } else if (!isTaskDone && currentPct < 93) {
          currentPct += 0.15;
        }

        const displayPct = Math.min(100, Math.floor(currentPct));
        setProgressPercent(displayPct);
        setProgressStatus(getStatusForPercent(displayPct));

        if (isTaskDone && currentPct >= 100) {
          break;
        }

        await new Promise((r) => setTimeout(r, 18));
      }

      if (!isTaskDone) {
        await workPromise;
      }
      if (processingError) throw processingError;

      setProgressPercent(100);
      setProgressStatus('100% Complete! Transparent PNG Ready');

      // Brief celebratory display of 100% checkmark before opening studio
      await new Promise((r) => setTimeout(r, 160));

      if (processedData) {
        setResult(processedData);
      }
      setIsProcessing(false);
    } catch (error: any) {
      console.warn('Background removal error notification:', error);
      setErrorMessage(error.message || 'Could not remove background. Please try another image.');
      setShowEditor(false);
      setIsProcessing(false);
    }
  };

  const [activePage, setActivePage] = useState<'home' | 'how-it-works' | 'features' | 'faq'>('home');

  // Navigate to separate page or home
  const handleNavClick = (sectionId: string) => {
    if (showEditor) {
      setShowEditor(false);
    }
    const target = ['home', 'how-it-works', 'features', 'faq'].includes(sectionId)
      ? (sectionId as 'home' | 'how-it-works' | 'features' | 'faq')
      : 'home';
    setActivePage(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      dir={currentLang === 'ur' ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900"
    >
      {/* Top Navbar */}
      <Navbar
        currentLang={currentLang}
        activePage={activePage}
        onLanguageChange={setCurrentLang}
        onSelectUpload={handleOpenUpload}
        onNavClick={handleNavClick}
      />

      {/* Main Content: Either the Editor Studio or Separate Pages */}
      <main className="flex-1">
        {showEditor ? (
          <EditorStudio
            currentLang={currentLang}
            result={result}
            isProcessing={isProcessing}
            progressPercent={progressPercent}
            progressStatus={progressStatus}
            uploadingImageUrl={uploadingImageUrl || undefined}
            onBackToHome={() => setShowEditor(false)}
            onUploadAnother={handleOpenUpload}
          />
        ) : activePage === 'how-it-works' ? (
          <HowItWorks
            currentLang={currentLang}
            onUploadClick={handleOpenUpload}
            onBackToHome={() => handleNavClick('home')}
          />
        ) : activePage === 'features' ? (
          <FeatureGrid
            currentLang={currentLang}
            onBackToHome={() => handleNavClick('home')}
            onUploadClick={handleOpenUpload}
          />
        ) : activePage === 'faq' ? (
          <FaqSection
            currentLang={currentLang}
            onBackToHome={() => handleNavClick('home')}
            onUploadClick={handleOpenUpload}
          />
        ) : (
          /* Home Page: Hero with Upload, Shoes Showcase, and Quick Samples */
          <Hero
            currentLang={currentLang}
            onImageSelected={handleImageSelected}
            fileInputRef={fileInputRef}
          />
        )}
      </main>

      {/* Bottom Footer */}
      <Footer currentLang={currentLang} onNavClick={handleNavClick} />

      {/* Offline PWA Status Indicator */}
      <OfflineIndicator />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md bg-red-600 text-white p-4 rounded-2xl shadow-xl flex items-start space-x-3 rtl:space-x-reverse animate-in fade-in slide-in-from-bottom-5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">
            <p>{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="mt-2 text-xs font-bold underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
