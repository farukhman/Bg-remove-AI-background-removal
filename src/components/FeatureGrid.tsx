import React from 'react';
import { Zap, Image as ImageIcon, ShieldCheck, Smartphone, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface FeatureGridProps {
  currentLang: Language;
  onBackToHome?: () => void;
  onUploadClick?: () => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ currentLang, onBackToHome, onUploadClick }) => {
  const t = translations[currentLang];

  const features = [
    {
      icon: Zap,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      title: t.features.superFastTitle,
      description: t.features.superFastDesc,
      benefits: ['Instant 1-second processing', 'Zero waiting in queues', 'Optimized neural edge model'],
    },
    {
      icon: ImageIcon,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: t.features.highQualityTitle,
      description: t.features.highQualityDesc,
      benefits: ['Preserves fine hair strands', 'Crisp transparent edges', 'Full HD resolution export'],
    },
    {
      icon: ShieldCheck,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: t.features.freeTitle,
      description: t.features.freeDesc,
      benefits: ['100% Free forever', 'No hidden watermark', 'Unlimited image conversions'],
    },
    {
      icon: Smartphone,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-500',
      title: t.features.anyDeviceTitle,
      description: t.features.anyDeviceDesc,
      benefits: ['Works on mobile & tablet', 'No app install required', 'Private & secure in browser'],
    },
  ];

  return (
    <div className="py-12 sm:py-16 bg-white min-h-[75vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb / Back button */}
        {onBackToHome && (
          <div className="mb-8">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        )}

        {/* Dedicated Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powerful AI Features</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t.nav.features}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Everything you need to cut out transparent PNGs and create professional product photos in seconds.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="flex flex-col p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-200 group"
              >
                {/* Circular Icon Container */}
                <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform`}>
                  <Icon className={`w-7 h-7 ${item.iconColor} stroke-[2.2]`} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">
                  {item.description}
                </p>

                {/* Micro benefits */}
                <ul className="space-y-1.5 pt-3 border-t border-slate-200/60">
                  {item.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA to remove background */}
        {onUploadClick && (
          <div className="mt-14 text-center p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
            <h3 className="text-2xl font-bold mb-2">Ready to remove background from your photo?</h3>
            <p className="text-blue-100 text-sm max-w-lg mx-auto mb-6">
              Experience the lightning-fast AI cutout tool right now with zero sign-up required.
            </p>
            <button
              onClick={onUploadClick}
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.nav.removeBackground} Now</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

