import React, { useRef, useState } from 'react';
import { UploadCloud, ArrowRight, Sliders, CheckCircle2, Sparkles } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import heroPortraitOriginal from '../assets/images/young_man_portrait_1790881396538.jpg';
import heroPortraitCutout from '../assets/images/young_man_cutout.png';
import sampleSneaker from '../assets/images/sneaker_product_1790881416163.jpg';
import userLogoAvatar from '../assets/images/user_logo_avatar.jpg';
import userCutoutClean from '../assets/images/user_cutout_clean.png';

interface HeroProps {
  currentLang: Language;
  onImageSelected: (fileOrUrl: File | string, name?: string, preCutoutUrl?: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const Hero: React.FC<HeroProps> = ({
  currentLang,
  onImageSelected,
  fileInputRef,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isInteractiveSliderActive, setIsInteractiveSliderActive] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const t = translations[currentLang];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file, file.name);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onImageSelected(file, file.name);
    }
  };

  // Split slider mouse/touch drag handler
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleSliderMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-16 bg-gradient-to-b from-blue-50/30 via-white to-slate-50/50">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Headings + Dropzone + Samples */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pill Badge matching screenshot */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-semibold text-xs tracking-wide shadow-xs">
              <span>{t.hero.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              {t.hero.titleStart}
              <span className="text-blue-600 inline-block">{t.hero.titleHighlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
              {t.hero.subtitle}
            </p>

            {/* Upload Card / Dropzone matching screenshot */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 select-none ${
                isDragging
                  ? 'border-blue-600 bg-blue-100/50 scale-[1.01]'
                  : 'border-blue-300/80 bg-blue-50/40 hover:bg-blue-50/70 hover:border-blue-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                {/* Cloud icon in blue circle matching screenshot */}
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 transform transition-transform hover:scale-105">
                  <UploadCloud className="w-7 h-7 stroke-[2.2]" />
                </div>

                {/* Choose Image primary button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-medium text-base px-8 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  {t.hero.chooseImage}
                </button>

                {/* Drag and drop helper text */}
                <p className="text-slate-600 font-medium text-sm">
                  {t.hero.dragDrop}
                </p>

                {/* File format info */}
                <p className="text-slate-400 text-xs tracking-wide">
                  {t.hero.supports}
                </p>
              </div>
            </div>

            {/* Quick Sample Selector */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                {t.hero.trySample}
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => onImageSelected(userLogoAvatar, 'profile-avatar.jpg', userCutoutClean)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-700 hover:border-blue-600 hover:text-blue-600 text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
                >
                  <img
                    src={userLogoAvatar}
                    alt="Logo Avatar"
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-blue-500"
                  />
                  <span>Logo Profile</span>
                </button>

                <button
                  onClick={() => onImageSelected(heroPortraitOriginal, 'handsome-portrait.jpg', heroPortraitCutout)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
                >
                  <img
                    src={heroPortraitOriginal}
                    alt="Sample Man"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>{t.hero.sampleMan}</span>
                </button>

                <button
                  onClick={() => onImageSelected(sampleSneaker, 'sneaker-shoe.jpg')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
                >
                  <img
                    src={sampleSneaker}
                    alt="Sample Sneaker"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>{t.hero.sampleSneaker}</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Visual Showcase Matching Screenshot */}
          <div className="lg:col-span-6 flex flex-col items-center">
            
            {/* Toggle bar between Side-by-Side and Interactive Split Slider */}
            <div className="w-full flex justify-end mb-3">
              <button
                onClick={() => setIsInteractiveSliderActive(!isInteractiveSliderActive)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-2xs transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>{isInteractiveSliderActive ? 'Show Side-by-Side Cards' : 'Test Interactive Split Slider'}</span>
              </button>
            </div>

            {/* Showcase Container */}
            {!isInteractiveSliderActive ? (
              /* EXACT SIDE-BY-SIDE CARDS AS IN SCREENSHOT */
              <div className="w-full bg-slate-50/60 p-4 sm:p-6 rounded-3xl border border-slate-100 flex items-center justify-center gap-3 sm:gap-6 shadow-sm">
                
                {/* Left Card: Original Image */}
                <div className="flex-1 max-w-[270px] bg-white rounded-2xl p-2.5 shadow-sm border border-slate-200/80 transition-transform hover:-translate-y-1 duration-200">
                  <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-slate-100">
                    {/* Badge: Original Image */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="bg-slate-200/90 backdrop-blur-xs text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
                        {t.hero.originalImage}
                      </span>
                    </div>

                    <img
                      src={heroPortraitOriginal}
                      alt="Original Subject"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>

                {/* Center Transition Blue Arrow */}
                <div className="flex-shrink-0 text-blue-600">
                  <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.8]" />
                </div>

                {/* Right Card: Background Removed with checkerboard transparency */}
                <div className="flex-1 max-w-[270px] bg-white rounded-2xl p-2.5 shadow-sm border border-slate-200/80 transition-transform hover:-translate-y-1 duration-200">
                  <div className="relative rounded-xl overflow-hidden aspect-[3/4] checkerboard-pattern">
                    {/* Badge: Background Removed matching screenshot */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
                        {t.hero.backgroundRemoved}
                      </span>
                    </div>

                    <img
                      src={heroPortraitCutout}
                      alt="Background Removed Subject"
                      className="w-full h-full object-cover object-center relative z-1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* INTERACTIVE SPLIT SLIDER VIEW */
              <div className="w-full max-w-[460px] bg-white p-3 rounded-3xl border border-slate-200 shadow-md">
                <div
                  ref={sliderContainerRef}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  onClick={(e) => handleSliderMove(e.clientX)}
                  className="relative rounded-2xl overflow-hidden aspect-[3/4] select-none cursor-ew-resize checkerboard-pattern shadow-inner"
                >
                  {/* Background Removed Image (Bottom layer) */}
                  <img
                    src={heroPortraitCutout}
                    alt="Cutout layer"
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                  />

                  {/* Original Image (Top layer clipped to slider position) */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img
                      src={heroPortraitOriginal}
                      alt="Original layer"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Vertical Divider Line with handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-20"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white">
                      <Sliders className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Badges on slider */}
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span className="bg-slate-900/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                      {t.hero.originalImage}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                      {t.hero.backgroundRemoved}
                    </span>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-500 font-medium mt-2.5">
                  {t.hero.interactiveNotice}
                </p>
              </div>
            )}

            {/* Quick Action under showcase */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => onImageSelected(heroPortraitOriginal, 'hero-portrait.jpg')}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Customize & Download this sample in Studio</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
