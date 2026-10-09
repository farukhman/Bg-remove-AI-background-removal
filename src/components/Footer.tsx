import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface FooterProps {
  currentLang: Language;
  onNavClick: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLang, onNavClick }) => {
  const t = translations[currentLang];

  return (
    <footer className="bg-[#1e2337] text-white pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top footer row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          
          {/* Logo & Tagline - Clean modern brand header without website image logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-1 text-xl font-extrabold tracking-tight">
              <span className="text-blue-400">BG</span>
              <span className="text-white">Remove</span>
            </div>
            <span className="text-slate-500 hidden sm:inline">—</span>
            <span className="text-slate-400 text-sm hidden sm:inline font-medium">
              {t.footer.brandTagline}
            </span>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <button
              onClick={() => onNavClick('home')}
              className="hover:text-white transition-colors"
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => onNavClick('how-it-works')}
              className="hover:text-white transition-colors"
            >
              {t.nav.howItWorks}
            </button>
            <button
              onClick={() => onNavClick('features')}
              className="hover:text-white transition-colors"
            >
              {t.nav.features}
            </button>
            <button
              onClick={() => onNavClick('faq')}
              className="hover:text-white transition-colors"
            >
              {t.nav.faq}
            </button>
          </div>
        </div>

        {/* Bottom banner matching screenshot exact text */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="font-medium text-slate-300">
            BG Remove — {t.footer.brandTagline}
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-Side Privacy Guaranteed</span>
            </span>
            <span>•</span>
            <span>Free & Unlimited</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
