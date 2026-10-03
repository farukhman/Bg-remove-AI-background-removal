import React from 'react';
import { Upload, Cpu, Download, ArrowRight } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface HowItWorksProps {
  currentLang: Language;
  onUploadClick: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ currentLang, onUploadClick }) => {
  const t = translations[currentLang];

  const steps = [
    {
      step: '01',
      icon: Upload,
      title: t.howItWorks.step1Title,
      description: t.howItWorks.step1Desc,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      step: '02',
      icon: Cpu,
      title: t.howItWorks.step2Title,
      description: t.howItWorks.step2Desc,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      step: '03',
      icon: Download,
      title: t.howItWorks.step3Title,
      description: t.howItWorks.step3Desc,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold tracking-wide">
            {t.howItWorks.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.howItWorks.title}
          </h2>
          <p className="text-slate-600 text-base">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Step number badge & icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${item.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <span className="text-3xl font-black text-slate-200">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </h3>

                  <p className="text-slate-500 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Step {index + 1} of 3</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA underneath */}
        <div className="text-center mt-12">
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Your Photo Now</span>
          </button>
        </div>

      </div>
    </section>
  );
};
