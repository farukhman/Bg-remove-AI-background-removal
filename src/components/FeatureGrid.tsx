import React from 'react';
import { Zap, Image as ImageIcon, ShieldCheck, Smartphone } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface FeatureGridProps {
  currentLang: Language;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  const features = [
    {
      icon: Zap,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      title: t.features.superFastTitle,
      description: t.features.superFastDesc,
    },
    {
      icon: ImageIcon,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: t.features.highQualityTitle,
      description: t.features.highQualityDesc,
    },
    {
      icon: ShieldCheck,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: t.features.freeTitle,
      description: t.features.freeDesc,
    },
    {
      icon: Smartphone,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-500',
      title: t.features.anyDeviceTitle,
      description: t.features.anyDeviceDesc,
    },
  ];

  return (
    <section id="features" className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 text-center">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="flex flex-col items-center p-6 rounded-2xl transition-all duration-200 hover:bg-slate-50/70"
              >
                {/* Circular Icon Container matching screenshot */}
                <div className={`w-16 h-16 rounded-full ${item.iconBg} flex items-center justify-center mb-5 shadow-xs`}>
                  <Icon className={`w-8 h-8 ${item.iconColor} stroke-[2.2]`} />
                </div>

                {/* Title matching screenshot */}
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>

                {/* Description matching screenshot */}
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
