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

  // Quietly warm up @imgly Web Worker in the background
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadBackgroundRemovalEngine();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Trigger file selection dialog
  const handleOpenUpload = () => {
    fileInputRef.current?.click();
  };

  // Main background removal processing trigger using pure @imgly/background-removal
  const handleImageSelected = async (
    fileOrUrl: File | string,
    name?: string,
    preCutoutUrl?: string
  ) => {
    const previewUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
    setUploadingImageUrl(previewUrl);
    setShowEditor(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If pre-computed pristine cutout is available (e.g. for demo samples)
    if (preCutoutUrl) {
      setIsProcessing(true);
      setProgressPercent(40);
      setProgressStatus('Loading pristine cutout...');
      try {
        const originalUrl = previewUrl;
        const img = await loadImage(originalUrl);
        const res = await fetch(preCutoutUrl);
        const blob = await res.blob();
        setResult({
          cutoutBlob: blob,
          cutoutUrl: preCutoutUrl,
          originalUrl,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          originalName: (name || 'sample').replace(/\.[^/.]+$/, ''),
        });
        setProgressPercent(100);
        setProgressStatus('100% Complete! Transparent PNG Ready');
        setTimeout(() => {
          setIsProcessing(false);
        }, 200);
        return;
      } catch (e) {
        console.warn('Pre-cutout load failed, running neural model:', e);
      }
    }

    setIsProcessing(true);
    setProgressPercent(15);
    setProgressStatus('AI neural network analyzing image & clothes...');

    try {
      const processed = await processBackgroundRemoval(
        fileOrUrl,
        name || 'image',
        (percent, status) => {
          setProgressPercent(percent);
          setProgressStatus(status);
        }
      );
      setProgressPercent(100);
      setProgressStatus('100% Done! Converting to Transparent PNG...');
      setResult(processed);
      // Fori Tor (Instantly) show transparent PNG cutout!
      setTimeout(() => {
        setIsProcessing(false);
      }, 350);
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
