import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowLeft, Sparkles, MessageCircle } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface FaqSectionProps {
  currentLang: Language;
  onBackToHome?: () => void;
  onUploadClick?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ currentLang, onBackToHome, onUploadClick }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = translations[currentLang];

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    {
      q: 'Can I upload custom background photos?',
      a: 'Yes! In the BG Remove editor studio, you can upload any custom background photo from your device or choose from beautiful pre-made studio and nature backdrops.',
    },
    {
      q: 'Are my photos private and secure?',
      a: 'Absolutely. Background removal processes quickly in your session. Your photos are never shared, sold, or used for training.',
    },
  ];

  return (
    <div className="py-12 sm:py-20 bg-white min-h-[75vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
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

        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.faq.title}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 bg-white hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left bg-white hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-slate-900 text-base sm:text-lg pr-4">
                    {faq.q}
                  </span>
                  <div className={`p-1.5 rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 bg-slate-50/40 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        {onUploadClick && (
          <div className="mt-14 text-center p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Still have questions?</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Test it out yourself! BG Remove is 100% free with unlimited conversions.
            </p>
            <button
              onClick={onUploadClick}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
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

