import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeatureGrid } from './components/FeatureGrid';
import { HowItWorks } from './components/HowItWorks';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { EditorStudio } from './components/EditorStudio';
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

    let processedData: ProcessedResult | null = null;
    let processingError: Error | null = null;

    // Start actual background removal task in parallel while counter smoothly increments 1, 2, 3...
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
          return;
        } catch (e) {
          console.warn('Pre-cutout load failed, running neural model:', e);
        }
      }

      processedData = await processBackgroundRemoval(fileOrUrl, name || 'image');
    })().catch((err: any) => {
      processingError = err instanceof Error ? err : new Error(String(err));
    });

    try {
      let currentPct = 1;

      while (currentPct < 100) {
        if (processingError) {
          throw processingError;
        }

        // Determine delay before advancing +1% so it counts 1, 2, 3, 4, 5, 6, 7, 8, 9... smoothly
        let stepDelayMs = 20;
        if (processedData) {
          // Cutout is ready! Smoothly count every remaining number (+1) quickly to 100%
          stepDelayMs = 10;
        } else if (currentPct < 60) {
          stepDelayMs = 22;
        } else if (currentPct < 85) {
          stepDelayMs = 38;
        } else if (currentPct < 98) {
          stepDelayMs = 95;
        } else {
          // Wait at 98% until workPromise finishes, then step 99% -> 100%
          await workPromise;
          if (processingError) throw processingError;
          stepDelayMs = 12;
        }

        await new Promise((resolve) => setTimeout(resolve, stepDelayMs));
        currentPct += 1;
        setProgressPercent(currentPct);
        setProgressStatus(getStatusForPercent(currentPct));
      }

      // Ensure workPromise is completely settled when reaching 100%
      if (!processedData && !processingError) {
        await workPromise;
      }
      if (processingError) {
        throw processingError;
      }

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

  // Scroll to section
  const handleNavClick = (sectionId: string) => {
    if (showEditor) {
      setShowEditor(false);
    }
    setTimeout(() => {
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <div
      dir={currentLang === 'ur' ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900"
    >
      {/* Top Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onSelectUpload={handleOpenUpload}
        onNavClick={handleNavClick}
      />

      {/* Main Content: Either the Landing Page or the Editor Studio */}
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
        ) : (
          <>
            {/* Hero Section matching screenshot */}
            <Hero
              currentLang={currentLang}
              onImageSelected={handleImageSelected}
              fileInputRef={fileInputRef}
            />

            {/* Feature Grid: 4 circular icons matching screenshot */}
            <FeatureGrid currentLang={currentLang} />

            {/* How It Works */}
            <HowItWorks
              currentLang={currentLang}
              onUploadClick={handleOpenUpload}
            />

            {/* FAQ Accordion */}
            <FaqSection currentLang={currentLang} />
          </>
        )}
      </main>

      {/* Bottom Footer */}
      <Footer currentLang={currentLang} onNavClick={handleNavClick} />

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
