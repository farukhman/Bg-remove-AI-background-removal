import React, { useEffect, useState, useRef } from 'react';
import { SkipForward, Volume2, VolumeX, ExternalLink, Download, Smartphone, Globe } from 'lucide-react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

const ADSENSE_CLIENT_ID = 'ca-pub-4877310265134435';

interface VideoAdCampaign {
  id: string;
  type: 'app' | 'website';
  videoUrl: string;
  name: string;
  subtitle: string;
  ctaLabel: string;
  targetUrl: string;
  accentColor: string;
}

/**
 * Video Ads matched with their exact App or Website destination
 * - If the video is for an App -> shows App Download / Install option below the video
 * - If the video is for a Website -> shows Visit Website option below the video
 */
const VIDEO_AD_CAMPAIGNS: VideoAdCampaign[] = [
  {
    id: 'chromecast-app',
    type: 'app',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    name: 'Google TV & Cast App',
    subtitle: '4.7 ★ • Free on Google Play',
    ctaLabel: 'Install App',
    targetUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.chromecast.app',
    accentColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    id: 'explore-website',
    type: 'website',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    name: 'Google Travel & Explore',
    subtitle: 'www.google.com/travel',
    ctaLabel: 'Visit Site',
    targetUrl: 'https://www.google.com/travel',
    accentColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    id: 'fun-stream-app',
    type: 'app',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    name: 'YouTube Create Studio',
    subtitle: '4.6 ★ • Video & Photo App',
    ctaLabel: 'Download App',
    targetUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.youtube.adas',
    accentColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    id: 'joyrides-website',
    type: 'website',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    name: 'AutoDrive Official Store',
    subtitle: 'store.google.com',
    ctaLabel: 'Visit Site',
    targetUrl: 'https://store.google.com',
    accentColor: 'bg-blue-600 hover:bg-blue-700',
  },
];

let adRotationIndex = 0;
function getNextVideoAd(): VideoAdCampaign {
  const campaign = VIDEO_AD_CAMPAIGNS[adRotationIndex % VIDEO_AD_CAMPAIGNS.length];
  adRotationIndex += 1;
  return campaign;
}

/**
 * 1. Compact White Video Card (Shown while image is uploading & processing)
 * Automatically slides open the matching App Download or Website Visit bar right below the video.
 */
export const ProcessingAdBanner: React.FC = () => {
  const [campaign] = useState<VideoAdCampaign>(() => getNextVideoAd());
  const [isSkipped, setIsSkipped] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showActionDrawer, setShowActionDrawer] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!pushedRef.current) {
      pushedRef.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Ignore
      }
    }

    // Immediately slide open the bottom App/Website option as the ad starts playing (like YouTube)
    const drawerTimer = setTimeout(() => {
      setShowActionDrawer(true);
    }, 150);

    const startTime = Date.now();
    const totalMs = 5000;
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rem = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));
      setSecondsLeft(rem);
      setProgress(Math.min(100, (elapsed / totalMs) * 100));
      if (elapsed >= totalMs) {
        setCanSkip(true);
        clearInterval(timer);
      }
    }, 100);

    return () => {
      clearTimeout(drawerTimer);
      clearInterval(timer);
    };
  }, []);

  if (isSkipped) return null;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full max-w-[300px] mx-auto bg-white rounded-2xl p-2 border border-slate-200 shadow-md overflow-hidden">
      {/* Hidden AdSense hook */}
      <ins
        className="adsbygoogle hidden"
        style={{ display: 'none' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-format="auto"
      />

      {/* Video Player Box */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
        <video
          ref={videoRef}
          src={campaign.videoUrl}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={isMuted}
          loop
        />

        {/* Top-Right Sound Toggle */}
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-sm cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Bottom-Right Simple YouTube-Style Skip Option inside the card */}
        <div className="absolute bottom-3 right-0 z-20">
          {!canSkip ? (
            <div className="bg-white/95 text-slate-900 px-3 py-1.5 rounded-l-lg border-y border-l border-slate-200 text-xs font-bold shadow-md select-none">
              Skip in {secondsLeft}s
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSkipped(true)}
              className="bg-white hover:bg-slate-50 text-slate-900 px-3.5 py-1.5 rounded-l-lg border-y border-l border-slate-300 font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer"
            >
              <span>Skip</span>
              <SkipForward className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
        </div>

        {/* Bottom Progress Line */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-200/60 z-20">
          <div
            className="h-full bg-amber-400 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* YouTube-Style Bottom Option Bar (Matches App or Website in the Ad) */}
      {showActionDrawer && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 px-1 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 min-w-0 text-left">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              {campaign.type === 'app' ? (
                <Smartphone className="w-4 h-4" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                {campaign.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                {campaign.subtitle}
              </p>
            </div>
          </div>

          <a
            href={campaign.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1 shrink-0 shadow-xs transition-colors ${campaign.accentColor}`}
          >
            <span>{campaign.ctaLabel}</span>
            {campaign.type === 'app' ? (
              <Download className="w-3 h-3" />
            ) : (
              <ExternalLink className="w-3 h-3" />
            )}
          </a>
        </div>
      )}
    </div>
  );
};

interface DownloadVideoAdModalProps {
  isOpen: boolean;
  format: 'png' | 'jpg';
  onCompleteDownload: () => void;
  onClose: () => void;
}

/**
 * 2. Small, Simple White Video Card Popup ("Choti Screen") on Download
 * Plays video with 10s YouTube-style Skip button inside + automatic bottom App/Website option bar.
 */
export const DownloadVideoAdModal: React.FC<DownloadVideoAdModalProps> = ({
  isOpen,
  onCompleteDownload,
}) => {
  const [campaign, setCampaign] = useState<VideoAdCampaign>(() => VIDEO_AD_CAMPAIGNS[0]);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [elapsedProgress, setElapsedProgress] = useState(0);
  const [showActionDrawer, setShowActionDrawer] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const adPushedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(10);
      setCanSkip(false);
      setElapsedProgress(0);
      setShowActionDrawer(false);
      adPushedRef.current = false;
      return;
    }

    setCampaign(getNextVideoAd());

    if (!adPushedRef.current) {
      adPushedRef.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Ignore
      }
    }

    setSecondsLeft(10);
    setCanSkip(false);
    setElapsedProgress(0);

    // Slide open the matching App or Website option right below the video as soon as it starts
    const drawerTimer = setTimeout(() => {
      setShowActionDrawer(true);
    }, 150);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    const startTime = Date.now();
    const totalSkipMs = 10000; // 10 seconds countdown

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((totalSkipMs - elapsed) / 1000));
      setSecondsLeft(remaining);
      setElapsedProgress(Math.min(100, (elapsed / totalSkipMs) * 100));

      if (elapsed >= totalSkipMs) {
        setCanSkip(true);
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearTimeout(drawerTimer);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Small White Video Card ("Choti Screen") */}
      <div className="relative w-full max-w-[310px] bg-white rounded-2xl p-2.5 border border-slate-200 shadow-2xl overflow-hidden">
        {/* Hidden AdSense hook */}
        <ins
          className="adsbygoogle hidden"
          style={{ display: 'none' }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-format="auto"
        />

        {/* Video Player Area */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
          <video
            ref={videoRef}
            src={campaign.videoUrl}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted={isMuted}
            loop
          />

          {/* Top-Right Sound Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-sm cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Bottom-Right Simple YouTube-Style Skip Option inside the Video Card */}
          <div className="absolute bottom-3 right-0 z-20">
            {!canSkip ? (
              <div className="bg-white/95 text-slate-900 px-3.5 py-1.5 rounded-l-lg border-y border-l border-slate-200 text-xs font-bold shadow-md select-none">
                Skip in {secondsLeft}s
              </div>
            ) : (
              <button
                type="button"
                onClick={onCompleteDownload}
                className="bg-white hover:bg-slate-50 text-slate-900 px-4 py-1.5 rounded-l-lg border-y border-l border-slate-300 font-extrabold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <span>Skip</span>
                <SkipForward className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>

          {/* Bottom Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-200/60 z-20">
            <div
              className="h-full bg-amber-400 transition-all duration-100 ease-linear"
              style={{ width: `${elapsedProgress}%` }}
            />
          </div>
        </div>

        {/* YouTube-Style Bottom Option Bar (Opens immediately for the specific App or Website in the Ad) */}
        {showActionDrawer && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 px-1 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 min-w-0 text-left">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                {campaign.type === 'app' ? (
                  <Smartphone className="w-4 h-4" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {campaign.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                  {campaign.subtitle}
                </p>
              </div>
            </div>

            <a
              href={campaign.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1 shrink-0 shadow-xs transition-colors ${campaign.accentColor}`}
            >
              <span>{campaign.ctaLabel}</span>
              {campaign.type === 'app' ? (
                <Download className="w-3 h-3" />
              ) : (
                <ExternalLink className="w-3 h-3" />
              )}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
