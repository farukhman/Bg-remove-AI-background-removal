import React, { useState } from 'react';
import { Globe, ChevronDown, Check, Sparkles, Menu, X } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import bgRemoveLogo from '../assets/images/bg_remove_circular_logo.png';

interface NavbarProps {
  currentLang: Language;
  activePage?: string;
  onLanguageChange: (lang: Language) => void;
  onSelectUpload: () => void;
  onNavClick: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  activePage = 'home',
  onLanguageChange,
  onSelectUpload,
  onNavClick,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[currentLang];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo with Perfectly Circular BG Remove Emblem */}
        <div 
          onClick={() => onNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-blue-600 to-sky-400 ring-2 ring-blue-500/20 group-hover:scale-105 transition-all duration-200 shadow-xs flex items-center justify-center">
            <img
              src={bgRemoveLogo}
              alt="BG Remove Logo"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex items-baseline gap-1 text-2xl font-extrabold tracking-tight">
            <span className="text-blue-600">BG</span>
            <span className="text-slate-900">Remove</span>
          </div>
        </div>

        {/* Center Navigation Links matching screenshot */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => onNavClick('home')}
            className={`font-semibold text-sm relative py-2 transition-colors cursor-pointer ${
              activePage === 'home' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            {t.nav.home}
            {activePage === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => onNavClick('how-it-works')}
            className={`font-semibold text-sm relative py-2 transition-colors cursor-pointer ${
              activePage === 'how-it-works' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            {t.nav.howItWorks}
            {activePage === 'how-it-works' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => onNavClick('features')}
            className={`font-semibold text-sm relative py-2 transition-colors cursor-pointer ${
              activePage === 'features' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            {t.nav.features}
            {activePage === 'features' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => onNavClick('faq')}
            className={`font-semibold text-sm relative py-2 transition-colors cursor-pointer ${
              activePage === 'faq' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            {t.nav.faq}
            {activePage === 'faq' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </nav>

        {/* Right Section: Language Dropdown + CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-950 font-medium text-sm px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{currentLang === 'en' ? 'English' : 'اردو (Urdu)'}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    onLanguageChange('en');
                    setLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-blue-50/60 ${
                    currentLang === 'en' ? 'text-blue-600 font-semibold bg-blue-50/40' : 'text-slate-700'
                  }`}
                >
                  <span>English</span>
                  {currentLang === 'en' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    onLanguageChange('ur');
                    setLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-blue-50/60 ${
                    currentLang === 'ur' ? 'text-blue-600 font-semibold bg-blue-50/40' : 'text-slate-700'
                  }`}
                >
                  <span>اردو (Urdu)</span>
                  {currentLang === 'ur' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Remove Background CTA */}
          <button
            onClick={onSelectUpload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.nav.removeBackground}</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => onLanguageChange(currentLang === 'en' ? 'ur' : 'en')}
            className="p-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
          >
            {currentLang === 'en' ? 'اردو' : 'EN'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => {
              onNavClick('home');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left font-semibold py-2.5 px-3 rounded-xl transition-colors ${
              activePage === 'home'
                ? 'text-blue-600 bg-blue-50 font-bold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.nav.home}
          </button>
          <button
            onClick={() => {
              onNavClick('how-it-works');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left font-semibold py-2.5 px-3 rounded-xl transition-colors ${
              activePage === 'how-it-works'
                ? 'text-blue-600 bg-blue-50 font-bold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.nav.howItWorks}
          </button>
          <button
            onClick={() => {
              onNavClick('features');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left font-semibold py-2.5 px-3 rounded-xl transition-colors ${
              activePage === 'features'
                ? 'text-blue-600 bg-blue-50 font-bold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.nav.features}
          </button>
          <button
            onClick={() => {
              onNavClick('faq');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left font-semibold py-2.5 px-3 rounded-xl transition-colors ${
              activePage === 'faq'
                ? 'text-blue-600 bg-blue-50 font-bold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.nav.faq}
          </button>
          <button
            onClick={() => {
              onSelectUpload();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.nav.removeBackground}</span>
          </button>
        </div>
      )}
    </header>
  );
};
