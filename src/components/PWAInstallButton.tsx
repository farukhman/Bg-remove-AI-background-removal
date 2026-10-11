import React, { useState } from 'react';
import { Download, Smartphone, X, Share2, MoreVertical } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { Language } from '../utils/translations';

interface PWAInstallButtonProps {
  currentLang?: Language;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  currentLang = 'en',
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Hide when already running as an installed standalone Android/iOS app
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  const label =
    currentLang === 'ur'
      ? compact
        ? 'ایپ انسٹال کریں'
        : 'Android ایپ انسٹال کریں'
      : compact
      ? 'Install App'
      : 'Install Android App';

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100/90 active:scale-98 text-blue-700 font-semibold transition-all cursor-pointer ${
          compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm shadow-2xs'
        }`}
        title="Install BG Remove App on your phone"
      >
        <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
        <span>{label}</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {currentLang === 'ur'
                    ? 'موبائل میں ایپ انسٹال کرنے کا طریقہ'
                    : 'Install BG Remove App'}
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p className="font-medium text-slate-800">
                  {currentLang === 'ur'
                    ? 'اپنے iPhone یا iPad پر ایپ انسٹال کرنے کے لیے:'
                    : 'To install this app on your iPhone or iPad:'}
                </p>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                  <Share2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    {currentLang === 'ur'
                      ? '1. سفاری (Safari) میں نیچے Share بٹن پر کلک کریں۔'
                      : '1. Tap the Share button in your Safari toolbar.'}
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                  <Smartphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    {currentLang === 'ur'
                      ? '2. نیچے جا کر "Add to Home Screen" پر کلک کریں۔'
                      : '2. Scroll down and tap "Add to Home Screen".'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p className="font-medium text-slate-800">
                  {currentLang === 'ur'
                    ? 'اپنے Android موبائل میں ایپ انسٹال کرنے کے لیے:'
                    : 'To install BG Remove as an Android App on your phone:'}
                </p>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                  <MoreVertical className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    {currentLang === 'ur'
                      ? '1. کروم (Chrome) براؤزر کے اوپر کونے میں 3 نقطوں (⋮) والے مینو پر کلک کریں۔'
                      : '1. Tap the 3-dots menu (⋮) in the top-right corner of Chrome.'}
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                  <Download className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    {currentLang === 'ur'
                      ? '2. مینو میں "Install app" یا "Add to Home screen" پر کلک کریں۔ ایپ آپ کے موبائل میں انسٹال ہو جائے گی!'
                      : '2. Tap "Install app" or "Add to Home screen" — the app will install directly on your phone!'}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-6 w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              {currentLang === 'ur' ? 'ٹھیک ہے' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>Offline Mode — Smart Local AI Cutout Active</span>
    </div>
  );
};
