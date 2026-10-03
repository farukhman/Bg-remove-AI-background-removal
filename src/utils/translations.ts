export type Language = 'en' | 'ur';

export interface Translations {
  nav: {
    home: string;
    howItWorks: string;
    features: string;
    faq: string;
    removeBackground: string;
  };
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    subtitle: string;
    chooseImage: string;
    dragDrop: string;
    supports: string;
    trySample: string;
    sampleMan: string;
    sampleSneaker: string;
    originalImage: string;
    backgroundRemoved: string;
    interactiveNotice: string;
  };
  features: {
    superFastTitle: string;
    superFastDesc: string;
    highQualityTitle: string;
    highQualityDesc: string;
    freeTitle: string;
    freeDesc: string;
    anyDeviceTitle: string;
    anyDeviceDesc: string;
  };
  howItWorks: {
    badge: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  editor: {
    backToHome: string;
    downloadHd: string;
    downloadJpg: string;
    copyClipboard: string;
    copied: string;
    splitSlider: string;
    sideBySide: string;
    onlyCutout: string;
    backgroundPresets: string;
    transparent: string;
    colors: string;
    gradients: string;
    blurEffect: string;
    blurAmount: string;
    aiBackdrop: string;
    aiPromptPlaceholder: string;
    generateAiBtn: string;
    refineBrush: string;
    erase: string;
    restore: string;
    brushSize: string;
    resetBrush: string;
    processing: string;
    processingSub: string;
    errorTitle: string;
    retry: string;
    uploadAnother: string;
  };
  faq: {
    title: string;
    subtitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
  };
  footer: {
    brandTagline: string;
    rights: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: 'Home',
      howItWorks: 'How It Works',
      features: 'Features',
      faq: 'FAQ',
      removeBackground: 'Remove Background',
    },
    hero: {
      badge: '⚡ Free • Fast • Easy',
      titleStart: 'Remove Image ',
      titleHighlight: 'Background',
      subtitle: 'Upload your image and get a clean, transparent background in seconds. No software, no sign up, just results!',
      chooseImage: 'Choose Image',
      dragDrop: 'or drag and drop your image here',
      supports: 'Supports: JPG, PNG, WEBP | Max size: 10MB',
      trySample: 'No image? Try with a sample photo:',
      sampleMan: 'Portrait Person',
      sampleSneaker: 'Product Sneaker',
      originalImage: 'Original Image',
      backgroundRemoved: 'Background Removed',
      interactiveNotice: 'Drag slider to compare Before / After',
    },
    features: {
      superFastTitle: 'Super Fast',
      superFastDesc: 'Get your background removed in just a few seconds.',
      highQualityTitle: 'High Quality',
      highQualityDesc: 'Keep your image sharp and clear.',
      freeTitle: '100% Free',
      freeDesc: 'No hidden charges, completely free to use.',
      anyDeviceTitle: 'Works on Any Device',
      anyDeviceDesc: 'Use it on your computer, tablet or mobile.',
    },
    howItWorks: {
      badge: 'Simple 3-Step Process',
      title: 'How BG Remover Works',
      subtitle: 'Powerful state-of-the-art AI cuts out the background automatically in high resolution.',
      step1Title: '1. Select or Drop Your Image',
      step1Desc: 'Upload any portrait, product, animal, or car photo. Up to 10MB supported.',
      step2Title: '2. Deep Neural Net Segmenting',
      step2Desc: 'Our AI model identifies the foreground subject and creates an exact alpha transparency mask.',
      step3Title: '3. Preview, Refine & Download',
      step3Desc: 'Download crystal-clear transparent PNG, add custom colors, or use portrait bokeh blur.',
    },
    editor: {
      backToHome: 'Back to Home',
      downloadHd: 'Download HD PNG',
      downloadJpg: 'Download JPG',
      copyClipboard: 'Copy to Clipboard',
      copied: 'Copied to Clipboard!',
      splitSlider: 'Split Slider',
      sideBySide: 'Side by Side',
      onlyCutout: 'Cutout Only',
      backgroundPresets: 'Background Style',
      transparent: 'Transparent',
      colors: 'Solid Colors',
      gradients: 'Gradients',
      blurEffect: 'Portrait Blur',
      blurAmount: 'Blur Intensity',
      aiBackdrop: 'AI Scene Backdrop',
      aiPromptPlaceholder: 'e.g. Modern minimalist studio with soft lights...',
      generateAiBtn: 'Generate AI Background',
      refineBrush: 'Touch-Up Brush',
      erase: 'Erase',
      restore: 'Restore',
      brushSize: 'Brush Size',
      resetBrush: 'Reset Edits',
      processing: 'Removing Background with AI...',
      processingSub: 'Analyzing edges, hair strands and contours...',
      errorTitle: 'Background Removal Failed',
      retry: 'Try Again',
      uploadAnother: 'Upload Another Image',
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about our free AI background remover.',
      q1: 'Is BG Remover completely free to use?',
      a1: 'Yes, 100% free! You can upload images and download transparent PNGs without signing up, entering credit cards, or facing hidden watermarks.',
      q2: 'What image formats and sizes are supported?',
      a2: 'We support all major image formats including JPG, JPEG, PNG, WEBP and BMP up to 10MB in file size.',
      q3: 'Will the resolution or quality of my photo be degraded?',
      a3: 'No! The output PNG preserves your original photo resolution so you get razor-sharp cutouts suitable for professional design, Amazon e-commerce, IDs, or print.',
      q4: 'Can I change the background to solid white or custom colors?',
      a4: 'Absolutely! Our built-in studio lets you choose pure white (ideal for passports or online stores), aesthetic gradients, portrait bokeh blur, or custom colors before downloading.',
    },
    footer: {
      brandTagline: 'Make Your Images Stand Out',
      rights: 'All rights reserved. Fast, private and AI-powered background matting in your browser.',
    },
  },
  ur: {
    nav: {
      home: 'ہوم',
      howItWorks: 'یہ کیسے کام کرتا ہے',
      features: 'خصوصیات',
      faq: 'عام سوالات',
      removeBackground: 'بیک گراؤنڈ ہٹائیں',
    },
    hero: {
      badge: '⚡ مفت • تیز ترین • آسان',
      titleStart: 'تصویر کا ',
      titleHighlight: 'بیک گراؤنڈ ہٹائیں',
      subtitle: 'اپنی تصویر اپ لوڈ کریں اور چند سیکنڈوں میں صاف شفاف بیک گراؤنڈ حاصل کریں۔ بغیر کسی سافٹ ویئر اور سائن اپ کے!',
      chooseImage: 'تصویر منتخب کریں',
      dragDrop: 'یا اپنی تصویر یہاں کھینچ کر لائیں',
      supports: 'سپورٹ: JPG, PNG, WEBP | زیادہ سے زیادہ سائز: 10MB',
      trySample: 'تصویر نہیں ہے؟ نمونہ تصویر آزمائیں:',
      sampleMan: 'پورٹریٹ تصویر',
      sampleSneaker: 'پروڈکٹ جوتا',
      originalImage: 'اصلی تصویر',
      backgroundRemoved: 'بیک گراؤنڈ ہٹا دیا گیا',
      interactiveNotice: 'موازنہ کرنے کے لیے سلائیڈر کو ہلائیں',
    },
    features: {
      superFastTitle: 'انتہائی تیز',
      superFastDesc: 'صرف چند سیکنڈوں میں بیک گراؤنڈ ہٹائیں۔',
      highQualityTitle: 'اعلیٰ کوالٹی',
      highQualityDesc: 'اپنی تصویر کو ہمیشہ واضح اور شفاف رکھیں۔',
      freeTitle: '100% مفت',
      freeDesc: 'کوئی پوشیدہ فیس نہیں، بالکل مفت استعمال کریں۔',
      anyDeviceTitle: 'ہر ڈیوائس پر چلے',
      anyDeviceDesc: 'کمپیوٹر، ٹیبلیٹ یا موبائل پر آسانی سے استعمال کریں۔',
    },
    howItWorks: {
      badge: '3 آسان مراحل',
      title: 'یہ ٹول کیسے کام کرتا ہے؟',
      subtitle: 'جدید ترین آرٹیفیشل انٹیلیجنس خودکار طریقے سے بیک گراؤنڈ ختم کرتی ہے۔',
      step1Title: '1. تصویر اپ لوڈ کریں',
      step1Desc: 'کوئی بھی تصویر منتخب کریں یا ڈراپ کریں۔',
      step2Title: '2. AI سے خودکار کٹنگ',
      step2Desc: 'ہماری نیورل نیٹ ورک ٹیکنالوجی بال اور کناروں کو باریکی سے الگ کرتی ہے۔',
      step3Title: '3. دیکھ کر ڈاؤنلوڈ کریں',
      step3Desc: 'شفاف PNG ڈاؤنلوڈ کریں یا اپنی مرضی کا نیا بیک گراؤنڈ لگائیں۔',
    },
    editor: {
      backToHome: 'ہوم پر واپس جائیں',
      downloadHd: 'HD PNG ڈاؤنلوڈ کریں',
      downloadJpg: 'JPG ڈاؤنلوڈ کریں',
      copyClipboard: 'کلپ بورڈ پر کاپی کریں',
      copied: 'کلپ بورڈ پر کاپی ہو گیا!',
      splitSlider: 'سلائیڈر ویو',
      sideBySide: 'ساتھ ساتھ ویو',
      onlyCutout: 'صرف کٹ آؤٹ',
      backgroundPresets: 'بیک گراؤنڈ اسٹائل',
      transparent: 'شفاف (Transparent)',
      colors: 'سادہ رنگ',
      gradients: 'گریڈینٹ',
      blurEffect: 'بلر ایفیکٹ',
      blurAmount: 'بلر کی مقدار',
      aiBackdrop: 'AI بیک گراؤنڈ سین',
      aiPromptPlaceholder: 'مثال: جدید اسٹوڈیو نرم روشنی کے ساتھ...',
      generateAiBtn: 'AI بیک گراؤنڈ بنائیں',
      refineBrush: 'ٹچ اپ برش',
      erase: 'مٹائیں (Erase)',
      restore: 'بحال کریں (Restore)',
      brushSize: 'برش کا سائز',
      resetBrush: 'ری سیٹ کریں',
      processing: 'AI بیک گراؤنڈ ہٹا رہا ہے...',
      processingSub: 'کناروں اور بالوں کا تجزیہ جاری ہے...',
      errorTitle: 'پروسیسنگ میں مسئلہ پیش آیا',
      retry: 'دوبارہ کوشش کریں',
      uploadAnother: 'نئی تصویر لگائیں',
    },
    faq: {
      title: 'اکثر پوچھے جانے والے سوالات',
      subtitle: 'ہمارے مفت AI بیک گراؤنڈ ریموور کے بارے میں مکمل معلومات۔',
      q1: 'کیا یہ مکمل طور پر مفت ہے؟',
      a1: 'جی ہاں، یہ 100 فیصد مفت ہے! آپ بنا اکاؤنٹ بنائے اور بنا کسی واٹر مارک کے تصاویر ڈاؤنلوڈ کر سکتے ہیں۔',
      q2: 'کون کون سے فارمیٹ سپورٹ ہوتے ہیں؟',
      a2: 'تمام مشہور فارمیٹس جیسے JPG, PNG, WEBP اور BMP سپورٹڈ ہیں (10MB تک)۔',
      q3: 'کیا تصویر کی کوالٹی کم ہوتی ہے؟',
      a3: 'بالکل نہیں! ڈاؤنلوڈ ہونے والی تصویر آپ کی اصل کوالٹی اور ہائی ریزولوشن میں رہتی ہے۔',
      q4: 'کیا میں سفید یا دوسرا بیک گراؤنڈ لگا سکتا ہوں؟',
      a4: 'جی ہاں! آپ پاسپورٹ سائز کے لیے سفید رنگ، دلکش گریڈینٹ یا بلر بیک گراؤنڈ منتخب کر سکتے ہیں۔',
    },
    footer: {
      brandTagline: 'اپنی تصاویر کو مزید شاندار بنائیں',
      rights: 'تمام جملہ حقوق محفوظ ہیں۔ براؤزر میں تیز ترین اور محفوظ AI پروسیسنگ۔',
    },
  },
};
