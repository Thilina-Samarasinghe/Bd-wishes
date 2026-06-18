'use client';

import React, { useState, useEffect } from 'react';
import { encodeConfig, DEFAULT_CONFIG, CardConfig } from '@/utils/encoder';
import CakeCandles from '@/components/wishes/CakeCandles';
import GiftBox from '@/components/wishes/GiftBox';
import BalloonPop from '@/components/wishes/BalloonPop';
import ConfettiEffect from '@/components/wishes/ConfettiEffect';
import AudioPlayer from '@/components/wishes/AudioPlayer';

interface SavedWishCard {
  id: string;
  name: string;
  age?: number | null;
  wishes: string;
  theme: 'gold' | 'pink' | 'neon' | 'space' | 'sunset' | 'forest' | 'violet' | 'ocean';
  music: 'music-box' | 'lofi' | 'piano' | 'none';
  effects: ('balloons' | 'candles' | 'confetti')[];
  images: string[];
  createdAt: string;
}

const TRANSLATIONS = {
  en: {
    brandTitle: "BD Wishes Studio",
    brandSubtitle: "Design & Share Magical Interactive Birthday Greetings",
    hidePreview: "Hide Preview",
    showPreview: "Show Preview",
    signOut: "Sign Out",
    guestMode: "Guest Mode",
    enterCreativeStudio: "Enter Creative Studio",
    loginDescription: "Sign in securely with email. We will generate a passwordless magic link to save cards and upload memories.",
    emailAddress: "Email Address",
    sendMagicLink: "Send Magic Link",
    sendingMagicLink: "Sending Magic Link...",
    magicLinkAutoLogin: "DEVELOPMENT AUTO-LOGIN CUE",
    magicLinkAutoLoginDesc: "An email has been simulated. Click below to login immediately:",
    clickToLoginDirectly: "Click to Login Directly",
    studioConfigurator: "Studio Configurator",
    configuratorDescription: "Customize the recipient details, select interactive sound tracks, choose visual themes, and upload memory pictures to save in the database.",
    quickThemePresets: "Quick Theme Presets",
    recipientName: "Recipient Name",
    enterRecipientName: "Enter recipient's name",
    recipientAge: "Recipient Age (Optional)",
    enterRecipientAge: "Enter age (e.g. 25)",
    visualThemeSelect: "Visual Theme Select",
    themeGold: "Midnight Gold",
    themeGoldDesc: "Serif fonts, gold details",
    themePink: "Cherry Blossom",
    themePinkDesc: "Pastel pink, falling sakura",
    themeNeon: "Retro Neon",
    themeNeonDesc: "Cyberpunk grids, neon glows",
    themeSpace: "Nebula Voyage",
    themeSpaceDesc: "Cosmic stars, nebulae",
    themeSunset: "Sunset Glow",
    themeSunsetDesc: "Warm gradients, sunset dust",
    themeForest: "Mystic Forest",
    themeForestDesc: "Deep greens, natural fireflies",
    themeViolet: "Amethyst Cyber",
    themeVioletDesc: "Futuristic purples, cyber glow",
    themeOcean: "Abyss Blue",
    themeOceanDesc: "Azure waves, water ripples",
    personalizedWishesLetter: "Personalized Wishes Letter",
    wishesPlaceholder: "Write a sweet, customized birthday message...",
    soundSignature: "Sound Signature",
    uploadMemoryPhotos: "Upload Memory Photos (Up to 5 images)",
    uploaderTip: "Tip: Images will render as a dynamic stack of Polaroids in the letter stage.",
    maxImagesError: "You can upload a maximum of 5 images in total.",
    activeEffects: "Active Interactive Effects",
    effectBalloons: "Floating Popping Balloons",
    effectCandles: "Virtual Blowable Candles",
    effectConfetti: "Explosive Confetti Shower",
    saveToDbCollection: "Save to DB Collection",
    saveToDbDesc: "Saves your uploaded images and card configuration to your cloud dashboard.",
    saveCardGetLink: "Save Card & Get Link",
    savingCard: "Saving Card...",
    savedMessage: "Saved! Share this persistent ID link.",
    standaloneUrlLink: "Standalone URL Code Link",
    standaloneUrlDesc: "Generate an instant serverless URL. (Does not save uploaded memory images).",
    copy: "Copy",
    copied: "Copied",
    myCollectionHistory: "My Collection History",
    loadingCards: "Loading cards list...",
    noCardsCreated: "No cards created yet. Fill out the configurator and click \"Save Card\" to start your collection!",
    historyTo: "To: ",
    historyTheme: "theme",
    historyOpen: "Open",
    historyDelete: "Delete",
    livePreviewScreen: "Live Preview Screen",
    resetFlow: "Reset Flow",
    hide: "Hide",
    developedBy: "Developed by ",
    deleteConfirm: "Are you sure you want to delete this greeting card? This will also permanently remove its images from Cloudinary.",
    loginNotification: "Please log in to save your customized greeting card.",
    simulatedInbox: "Magic link has been simulated in your email inbox! (Check console logs).",
  },
  si: {
    brandTitle: "BD සුභපැතුම් ස්ටුඩියෝව",
    brandSubtitle: "මැජික් අන්තර්ක්‍රියාකාරී උපන්දින සුභපැතුම් සැලසුම් කර බෙදා ගන්න",
    hidePreview: "පෙරදසුන සඟවන්න",
    showPreview: "පෙරදසුන පෙන්වන්න",
    signOut: "පිටවෙන්න",
    guestMode: "අමුත්තන්ගේ ප්‍රකාරය",
    enterCreativeStudio: "නිර්මාණාත්මක ස්ටුඩියෝවට ඇතුළු වන්න",
    loginDescription: "විද්‍යුත් තැපෑලෙන් ආරක්ෂිතව ඇතුළු වන්න. කාඩ්පත් සුරැකීමට සහ මතකයන් උඩුගත කිරීමට අපි මුරපද රහිත මැජික් සබැඳියක් සාදන්නෙමු.",
    emailAddress: "විද්‍යුත් තැපැල් ලිපිනය",
    sendMagicLink: "මැජික් සබැඳිය එවන්න",
    sendingMagicLink: "සබැඳිය යවමින් පවතී...",
    magicLinkAutoLogin: "සංවර්ධන ස්වයංක්‍රීය ඇතුළුවීමේ ඉඟිය",
    magicLinkAutoLoginDesc: "විද්‍යුත් තැපෑලක් අනුකරණය කර ඇත. වහාම ඇතුළු වීමට පහත ක්ලික් කරන්න:",
    clickToLoginDirectly: "කෙලින්ම ඇතුළු වීමට ක්ලික් කරන්න",
    studioConfigurator: "ස්ටුඩියෝ සැකසුම්කරණය",
    configuratorDescription: "ලබන්නාගේ තොරතුරු සකසන්න, අන්තර්ක්‍රියාකාරී ශබ්ද පීලි තෝරන්න, දෘශ්‍ය තේමා තෝරන්න, සහ මතක පින්තූර උඩුගත කරන්න.",
    quickThemePresets: "ඉක්මන් තේමා පෙරසිටුවීම්",
    recipientName: "ලබන්නාගේ නම",
    enterRecipientName: "ලබන්නාගේ නම ඇතුළත් කරන්න",
    recipientAge: "ලබන්නාගේ වයස (විකල්ප)",
    enterRecipientAge: "වයස ඇතුළත් කරන්න (උදා. 25)",
    visualThemeSelect: "දෘශ්‍ය තේමාව තෝරන්න",
    themeGold: "මධ්‍යම රාත්‍රී රන්",
    themeGoldDesc: "සෙරිෆ් අකුරු, රන් විස්තර",
    themePink: "චෙරි මල්",
    themePinkDesc: "පැස්ටල් රෝස, වැටෙන සකුරා",
    themeNeon: "රෙට්රෝ නියෝන්",
    themeNeonDesc: "සයිබර්පන්ක් ජාලක, නියෝන් දිලිසුම්",
    themeSpace: "නෙබියුලා චාරිකාව",
    themeSpaceDesc: "විශ්ව තරු, නෙබියුලාවන්",
    themeSunset: "ඉර බැස යන රන්වන් පැහැය",
    themeSunsetDesc: "උණුසුම් වර්ණ සංයෝජන, සන්සෙට් ඩස්ට්",
    themeForest: "ගුප්ත වනාන්තරය",
    themeForestDesc: "ගැඹුරු කොළ, ස්වභාවික කදෝකිමියන්",
    themeViolet: "ඇමතීස්ට් සයිබර්",
    themeVioletDesc: "අනාගතවාදී දම් පැහැය, සයිබර් දිලිසුම",
    themeOcean: "අගාධ නිල්",
    themeOceanDesc: "නිල් රළ, ජල රැළි",
    personalizedWishesLetter: "පුද්ගලීකරණය කළ සුභපැතුම් ලිපිය",
    wishesPlaceholder: "මිහිරි, පුද්ගලීකරණය කළ උපන්දින පණිවිඩයක් ලියන්න...",
    soundSignature: "ශබ්ද සංයෝජනය",
    uploadMemoryPhotos: "මතක පින්තූර උඩුගත කරන්න (උපරිම 5)",
    uploaderTip: "ඉඟිය: පින්තූර ලිපි පියවරේදී පෝලරොයිඩ් තට්ටුවක් ලෙස දර්ශනය වේ.",
    maxImagesError: "ඔබට උඩුගත කළ හැක්කේ උපරිම පින්තූර 5 ක් පමණි.",
    activeEffects: "ක්‍රියාකාරී අන්තර්ක්‍රියාකාරී බලපෑම්",
    effectBalloons: "පාවෙන පිපිරෙන බැලූන්",
    effectCandles: "පිඹ නිවා දැමිය හැකි ඉටිපන්දම්",
    effectConfetti: "කොන්ෆෙට්ටි වර්ෂාව",
    saveToDbCollection: "දත්ත සමුදායට සුරකින්න",
    saveToDbDesc: "ඔබ උඩුගත කළ පින්තූර සහ කාඩ්පත් සැකසුම ඔබගේ වලාකුළු උපකරණ පුවරුවේ සුරකියි.",
    saveCardGetLink: "සුරැකලා සබැඳිය ලබා ගන්න",
    savingCard: "සුරකිමින් පවතී...",
    savedMessage: "සුරැකුණි! මෙම සබැඳිය බෙදා ගන්න.",
    standaloneUrlLink: "ස්වාධීන URL කේත සබැඳිය",
    standaloneUrlDesc: "නොමිලේ ක්ෂණික සබැඳියක් සාදන්න. (පින්තූර සුරැකෙන්නේ නැත).",
    copy: "පිටපත් කරන්න",
    copied: "පිටපත් කලා",
    myCollectionHistory: "මගේ එකතු කිරීම් ඉතිහාසය",
    loadingCards: "කාඩ්පත් පූරණය වෙමින් පවතී...",
    noCardsCreated: "තවම කාඩ්පත් සාදා නැත. සැකසුම්කරණය පුරවා 'සුරකින්න' ක්ලික් කරන්න!",
    historyTo: "ලබන්නා: ",
    historyTheme: "තේමාව",
    historyOpen: "විවෘත",
    historyDelete: "මකන්න",
    livePreviewScreen: "සජීවී පෙරදසුන් තිරය",
    resetFlow: "නැවත මුල සිට",
    hide: "සඟවන්න",
    developedBy: "නිර්මාණය කළේ ",
    deleteConfirm: "මෙම කාඩ්පත මකා දැමීමට ඔබට විශ්වාසද? මෙමගින් එහි ඇති සියලුම පින්තූරද ස්ථිරවම මැකී යනු ඇත.",
    loginNotification: "කාඩ්පත සුරැකීමට කරුණාකර පළමුව ඇතුළු වන්න.",
    simulatedInbox: "මැජික් සබැඳිය සාර්ථකව යවන ලදී (කන්සෝල් ලොග පරීක්ෂා කරන්න).",
  }
};

const PRESETS = {
  en: [
    {
      label: "✨ Midnight Gold (Classic)",
      wishes: "Wishing you a day filled with laughter, love, and all your favorite things. May this year bring you endless joy and success!",
      theme: "gold" as const,
      music: "music-box" as const,
    },
    {
      label: "🌸 Cherry Blossom (Sweet)",
      wishes: "Happy birthday! Hope your day is as sweet, beautiful, and wonderful as you are. Enjoy every single moment! 💕🧁",
      theme: "pink" as const,
      music: "piano" as const,
    },
    {
      label: "👾 Retro Synth (Cyberpunk)",
      wishes: "HAPPY BIRTHDAY! 🚀 Level up, unlock new achievements, and keep dominating. Time to boot up a legendary year! 🕹️⚡",
      theme: "neon" as const,
      music: "lofi" as const,
    },
    {
      label: "🌌 Nebula Voyage (Cosmic)",
      wishes: "Wishing you an astronomical birthday! May your next orbit around the sun be filled with stellar discoveries and magic! 🌟🛰️",
      theme: "space" as const,
      music: "lofi" as const,
    }
  ],
  si: [
    {
      label: "✨ මධ්‍යම රාත්‍රී රන් (සම්භාව්‍ය)",
      wishes: "සිනහව, ආදරය සහ ඔබ කැමතිම දේවලින් පිරුණු දවසක් ඔබට ප්‍රාර්ථනා කරමි. මෙම වසර ඔබට නිමක් නැති සතුටක් සහ සාර්ථකත්වයක් ගෙනදේවා!",
      theme: "gold" as const,
      music: "music-box" as const,
    },
    {
      label: "🌸 චෙරි මල් (මිහිරි)",
      wishes: "සුභ උපන්දිනයක්! ඔබේ දවස ඔබ වගේම මිහිරි, ලස්සන සහ අපූරු එකක් වේවා කියා ප්‍රාර්ථනා කරමි. සෑම මොහොතක්ම සතුටින් ගත කරන්න! 💕🧁",
      theme: "pink" as const,
      music: "piano" as const,
    },
    {
      label: "👾 රෙට්රෝ සින්ත් (සයිබර්පන්ක්)",
      wishes: "සුභ උපන්දිනයක්! 🚀 නව ජයග්‍රහණ අත්කර ගනිමින් ඉදිරියටම යන්න. සුපිරි වසරක් ආරම්භ කිරීමට කාලයයි! 🕹️⚡",
      theme: "neon" as const,
      music: "lofi" as const,
    },
    {
      label: "🌌 නෙබියුලා චාරිකාව (විශ්වීය)",
      wishes: "තරු පිරුණු විශ්වීය උපන්දිනයක් ඔබට ප්‍රාර්ථනා කරමි! සූර්යයා වටා යන ඔබේ මීළඟ ගමන තරු පිරුණු සොයාගැනීම් වලින් සහ මැජික් වලින් පිරේවා! 🌟🛰️",
      theme: "space" as const,
      music: "lofi" as const,
    }
  ]
};

export default function CustomizerPage() {
  const [config, setConfig] = useState<CardConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'box' | 'cake' | 'letter'>('box');
  const [previewMusic, setPreviewMusic] = useState(false);
  const [previewConfetti, setPreviewConfetti] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);

  // Auth & Database States
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [magicLinkUrl, setMagicLinkUrl] = useState<string | null>(null);
  const [historyCards, setHistoryCards] = useState<SavedWishCard[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Uploads States
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Db share state
  const [dbShareLink, setDbShareLink] = useState<string | null>(null);
  const [savingCard, setSavingCard] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Custom Alert Notification state
  const [notification, setNotification] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);
  
  const triggerNotification = (text: string, type: 'error' | 'success' | 'info' = 'info') => {
    setNotification({ text, type });
  };

  const [lang, setLang] = useState<'en' | 'si'>('en');

  const toggleTheme = () => {
    setIsLightTheme(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('studio-theme', next ? 'light' : 'dark');
      }
      return next;
    });
  };

  const toggleLanguage = () => {
    setLang(prev => {
      const next = prev === 'en' ? 'si' : 'en';
      if (typeof window !== 'undefined') {
        localStorage.setItem('studio-lang', next);
      }
      return next;
    });
  };

  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key];
  };
  
  // Custom font loader & Client mount session validation
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Pacifico&family=Orbitron:wght@400..900&family=Space+Grotesk:wght@300..700&family=Outfit:wght@300..900&family=Quicksand:wght@300..700&family=Fira+Code:wght@300..700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Load theme from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studio-theme');
      if (saved === 'light') {
        setTimeout(() => {
          setIsLightTheme(true);
        }, 0);
      }
    }

    // Load language from localStorage
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('studio-lang');
      if (savedLang === 'si' || savedLang === 'en') {
        setTimeout(() => {
          setLang(savedLang as 'si' | 'en');
        }, 0);
      }
    }

    // Validate active session
    checkUserSession();

    return () => {
      clearTimeout(timer);
      document.head.removeChild(link);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss notification effect
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);



  async function checkUserSession() {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        fetchUserHistory();
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  async function fetchUserHistory() {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/card');
      const data = await res.json();
      if (data.success && data.cards) {
        setHistoryCards(data.cards);
      }
    } catch (err) {
      console.error('Failed to fetch cards history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginEmail.includes('@')) return;

    setLoginLoading(true);
    setMagicLinkUrl(null);
    try {
      const res = await fetch('/api/auth/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail })
      });
      const data = await res.json();
      if (data.success) {
        if (data.link) {
          // Dev mode: link returned in API response
          setMagicLinkUrl(data.link);
        } else {
          triggerNotification('Magic link has been simulated in your email inbox! (Check console logs).', 'success');
        }
      } else {
        triggerNotification(data.error || 'Failed to authenticate.', 'error');
      }
    } catch {
      triggerNotification('An authentication error occurred.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setHistoryCards([]);
      setUploadedImages([]);
      setConfig(prev => ({ ...prev, imageUrl: '' }));
      setDbShareLink(null);
      setActivePreviewTab('box');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      setUploadError('You can upload a maximum of 5 images in total.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Upload each file sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setUploadedImages(prev => {
            const next = [...prev, data.url];
            setConfig(c => ({ ...c, imageUrl: next[0] || '' }));
            return next;
          });
        } else {
          setUploadError(data.error || 'Failed to upload image.');
          break;
        }
      }
    } catch {
      setUploadError('Network upload failed.');
    } finally {
      setUploading(false);
      // Clear file input
      e.target.value = '';
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => {
      const next = prev.filter((_, idx) => idx !== index);
      setConfig(c => ({ ...c, imageUrl: next[0] || '' }));
      return next;
    });
    setDbShareLink(null);
  };

  const saveBirthdayCard = async () => {
    if (!user) {
      triggerNotification('Please log in to save your customized greeting card.', 'info');
      return;
    }

    setSavingCard(true);
    setSaveError(null);

    try {
      const res = await fetch('/api/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          age: config.age,
          wishes: config.wishes,
          theme: config.theme,
          music: config.music,
          effects: config.effects,
          images: uploadedImages
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDbShareLink(data.shareLink);
        fetchUserHistory(); // Refresh card history list
        
        // Play success chime
        try {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          }
        } catch {}
      } else {
        setSaveError(data.error || 'Failed to save card config.');
      }
    } catch {
      setSaveError('Network error occurred while saving.');
    } finally {
      setSavingCard(false);
    }
  };

  const deleteBirthdayCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this greeting card? This will also permanently remove its images from Cloudinary.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/card?id=${cardId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerNotification('Card deleted successfully.', 'success');
        fetchUserHistory(); // Refresh card history list
      } else {
        triggerNotification(data.error || 'Failed to delete card.', 'error');
      }
    } catch {
      triggerNotification('An error occurred while deleting the card.', 'error');
    }
  };

  // Derive shareable link in real-time
  const shareUrl = mounted && typeof window !== 'undefined'
    ? `${window.location.origin}/wish?card=${encodeConfig(config)}&lang=${lang}`
    : '';

  // Handle preset application
  const applyPreset = (preset: typeof PRESETS.en[0]) => {
    setConfig(prev => ({
      ...prev,
      wishes: preset.wishes,
      theme: preset.theme,
      music: preset.music
    }));
    setActivePreviewTab('box');
    setPreviewConfetti(false);
    setCopied(false);
    setDbShareLink(null);
  };

  // Type-safe field updater that automatically resets copying visual feedback
  const updateConfig = <K extends keyof CardConfig>(key: K, value: CardConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setCopied(false);
    setDbShareLink(null); // invalidate db link when fields change
  };

  const copyToClipboard = async (urlToCopy: string) => {
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      
      // Play a tiny synthetic bell sound for success!
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
          
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      } catch {}

      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };


  // Live preview styling helpers matching the wish page
  const getPreviewThemeStyles = () => {
    switch (config.theme) {
      case 'gold':
        return {
          bgClass: 'bg-[#0f0f11] text-[#e5e5e7]',
          fontClass: 'font-["Outfit",sans-serif]',
          headerFont: 'font-["Playfair_Display",serif]',
          glassClass: 'bg-white/[0.03] border-amber-500/10 shadow-lg',
          textColor: 'text-amber-400',
          wishesFont: 'font-["Playfair_Display",serif] italic text-neutral-200',
          btnClass: 'bg-amber-500 text-neutral-950 hover:bg-amber-600',
        };
      case 'pink':
        return {
          bgClass: 'bg-gradient-to-tr from-[#ffeef2] to-[#fffbfd] text-neutral-800',
          fontClass: 'font-["Quicksand",sans-serif]',
          headerFont: 'font-["Pacifico",cursive]',
          glassClass: 'bg-white/80 border-pink-200 shadow-md',
          textColor: 'text-pink-500',
          wishesFont: 'font-["Quicksand",sans-serif] font-medium text-neutral-700',
          btnClass: 'bg-pink-500 text-white hover:bg-pink-600',
        };
      case 'neon':
        return {
          bgClass: 'bg-[#060010] text-[#00f0ff] border border-cyan-500/10',
          fontClass: 'font-["Fira_Code",monospace]',
          headerFont: 'font-["Orbitron",sans-serif]',
          glassClass: 'bg-black/80 border-fuchsia-500 shadow-[0_0_10px_rgba(247,21,133,0.15)]',
          textColor: 'text-fuchsia-500',
          wishesFont: 'font-["Fira_Code",monospace] text-[#00f0ff]',
          btnClass: 'bg-[#ff007f] text-white hover:bg-fuchsia-600',
        };
      case 'space':
        return {
          bgClass: 'bg-gradient-to-b from-[#020512] to-[#010207] text-[#e0e7ff]',
          fontClass: 'font-["Outfit",sans-serif]',
          headerFont: 'font-["Space_Grotesk",sans-serif]',
          glassClass: 'bg-indigo-950/20 border-indigo-500/10 shadow-lg backdrop-blur-xl',
          textColor: 'text-indigo-400',
          wishesFont: 'font-["Outfit",sans-serif] text-indigo-100 font-light leading-relaxed',
          btnClass: 'bg-indigo-600 text-white hover:bg-indigo-700',
        };
      case 'sunset':
        return {
          bgClass: 'bg-gradient-to-br from-[#1c0a00] via-[#120500] to-[#050100] text-[#ffeedd]',
          fontClass: 'font-["Outfit",sans-serif]',
          headerFont: 'font-["Playfair_Display",serif] font-bold',
          glassClass: 'bg-white/[0.02] border-orange-500/10 shadow-lg backdrop-blur-md',
          textColor: 'text-orange-500',
          wishesFont: 'font-["Playfair_Display",serif] italic text-neutral-300 leading-relaxed',
          btnClass: 'bg-orange-500 text-neutral-950 hover:bg-orange-600',
        };
      case 'forest':
        return {
          bgClass: 'bg-gradient-to-tr from-[#020d06] via-[#04140b] to-[#010603] text-[#e2f0e5]',
          fontClass: 'font-["Quicksand",sans-serif]',
          headerFont: 'font-["Playfair_Display",serif]',
          glassClass: 'bg-emerald-950/10 border-emerald-500/10 shadow-lg backdrop-blur-md',
          textColor: 'text-emerald-400',
          wishesFont: 'font-["Quicksand",sans-serif] font-medium text-emerald-100/90 leading-relaxed',
          btnClass: 'bg-emerald-600 text-white hover:bg-emerald-700',
        };
      case 'violet':
        return {
          bgClass: 'bg-gradient-to-tr from-[#0b0214] via-[#06010d] to-[#020005] text-[#f5f0fa]',
          fontClass: 'font-["Outfit",sans-serif]',
          headerFont: 'font-["Orbitron",sans-serif]',
          glassClass: 'bg-purple-950/15 border-purple-500/15 shadow-lg backdrop-blur-md',
          textColor: 'text-purple-400',
          wishesFont: 'font-["Outfit",sans-serif] text-purple-100/95 font-light leading-relaxed',
          btnClass: 'bg-purple-600 text-white hover:bg-purple-700',
        };
      case 'ocean':
        return {
          bgClass: 'bg-gradient-to-b from-[#010817] via-[#031533] to-[#00050f] text-[#e0f2fe]',
          fontClass: 'font-["Quicksand",sans-serif]',
          headerFont: 'font-["Pacifico",cursive]',
          glassClass: 'bg-sky-950/10 border-sky-500/10 shadow-lg backdrop-blur-md',
          textColor: 'text-sky-400',
          wishesFont: 'font-["Quicksand",sans-serif] text-sky-100 font-medium leading-relaxed',
          btnClass: 'bg-sky-500 text-white hover:bg-sky-600',
        };
    }
  };

  const previewTheme = getPreviewThemeStyles();

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans flex flex-col relative overflow-hidden ${
      isLightTheme ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* Background Ambient Glow Orbs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[45%] aspect-square rounded-full bg-gradient-to-tr to-transparent filter blur-[120px] pointer-events-none transition-colors duration-300 ${
        isLightTheme ? 'from-amber-500/5' : 'from-amber-500/10'
      }`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[45%] aspect-square rounded-full bg-gradient-to-tr to-transparent filter blur-[120px] pointer-events-none transition-colors duration-300 ${
        isLightTheme ? 'from-indigo-500/5' : 'from-indigo-500/10'
      }`} />

      {/* Header Bar */}
      <header className={`border-b backdrop-blur-xl px-4 md:px-8 py-3.5 md:py-5 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-colors duration-300 ${
        isLightTheme ? 'border-slate-200/80 bg-white/70 text-slate-850' : 'border-white/[0.05] bg-slate-950/60 text-slate-100'
      }`}>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 text-lg md:text-xl select-none animate-[pulse_3s_infinite] shrink-0">
            🎂
          </div>
          <div>
            <h1 className={`text-xs md:text-base font-extrabold tracking-wide bg-clip-text text-transparent transition-all duration-300 ${
              isLightTheme 
                ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600' 
                : 'bg-gradient-to-r from-white via-slate-100 to-slate-400'
            }`}>{t('brandTitle')}</h1>
            <p className={`hidden md:block text-[10px] md:text-xs font-medium transition-colors duration-300 ${
              isLightTheme ? 'text-slate-500' : 'text-slate-400'
            }`}>{t('brandSubtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className={`px-2 py-1.5 rounded-xl border transition-all cursor-pointer select-none text-[10px] sm:text-xs font-bold shadow-sm flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 ${
              isLightTheme 
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                : 'bg-slate-900 border-white/[0.08] text-slate-200 hover:bg-slate-850'
            }`}
          >
            {lang === 'en' ? '🇱🇰 සිංහල' : '🇬🇧 EN'}
          </button>

          {/* Light/Dark mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer select-none text-xs sm:text-sm md:text-base shadow-sm flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 ${
              isLightTheme 
                ? 'bg-white border-slate-200 text-amber-500 hover:bg-slate-50 shadow-slate-100' 
                : 'bg-slate-900 border-white/[0.08] text-amber-400 hover:bg-slate-850'
            }`}
            aria-label="Toggle theme"
            title={isLightTheme ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {isLightTheme ? '☀️' : '🌙'}
          </button>

          {user && (
            <button
              onClick={() => setShowPreview(prev => !prev)}
              className={`text-[10px] sm:text-xs font-bold px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer select-none hover:-translate-y-0.5 active:translate-y-0 ${
                showPreview
                  ? isLightTheme
                    ? 'bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-900 border border-white/[0.08] hover:bg-slate-850 text-slate-300'
                  : 'bg-amber-500 text-neutral-950 hover:bg-amber-600 shadow-amber-500/10'
              }`}
            >
              <span>👁️</span>
              <span className="hidden sm:inline-block ml-0.5">{showPreview ? t('hidePreview') : t('showPreview')}</span>
            </button>
          )}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <span className={`hidden md:inline-block text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-inner border transition-all duration-300 ${
                isLightTheme 
                  ? 'text-slate-750 bg-white border-slate-200/80 shadow-slate-100' 
                  : 'text-slate-300 bg-slate-950/60 border-white/[0.05]'
              }`}>
                👤 {user.email}
              </span>
              <button
                onClick={handleLogout}
                className={`text-[10px] sm:text-xs font-bold px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all select-none cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
                  isLightTheme
                    ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200'
                    : 'text-rose-400 hover:text-rose-350 hover:bg-rose-950/25 border-rose-500/20'
                }`}
              >
                <span className="hidden sm:inline-block">{t('signOut')}</span>
                <span className="inline-block sm:hidden">🚪</span>
              </button>
            </div>
          ) : (
            <span className={`text-[10px] sm:text-xs font-bold select-none uppercase tracking-wider px-2 py-1 border rounded-full transition-all duration-300 ${
              isLightTheme 
                ? 'text-slate-500 bg-slate-200/40 border-slate-250' 
                : 'text-slate-500 bg-slate-950/40 border-white/[0.03]'
            }`}>
              {t('guestMode')}
            </span>
          )}
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left pane: Customizer / Login Panel (scrollable) */}
        <div className={`${showPreview ? 'hidden lg:block lg:col-span-7' : 'col-span-12 lg:col-span-12'} p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-81px)] transition-all duration-300 border-r space-y-8 scrollbar-thin ${
          isLightTheme ? 'border-slate-200/80 shadow-inner bg-slate-50/50' : 'border-white/[0.05]'
        }`}>
          
          {authLoading ? (
            /* Loading check */
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>{t('loadingCards')}</p>
            </div>
          ) : !user ? (
            /* PASSWORDLESS LOGIN PANEL */
            <div className="max-w-md mx-auto py-16 space-y-8 animate-fade-in">
              <div className="text-center space-y-3">
                <div className={`w-16 h-16 bg-gradient-to-tr border rounded-2xl flex items-center justify-center text-3xl mx-auto transition-all animate-[pulse_2.5s_infinite] ${
                  isLightTheme 
                    ? 'from-amber-500/5 to-amber-500/10 border-amber-500/15 shadow-sm shadow-amber-500/5' 
                    : 'from-amber-500/10 to-amber-500/20 border-amber-500/20 shadow-inner shadow-white/5'
                }`}>
                  🔑
                </div>
                <h2 className={`text-2xl font-extrabold tracking-tight font-sans transition-colors duration-300 ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>{t('enterCreativeStudio')}</h2>
                <p className={`text-xs leading-relaxed font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-650' : 'text-slate-400'}`}>
                  {t('loginDescription')}
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className={`space-y-5 backdrop-blur-md p-8 rounded-2xl border transition-all duration-300 ${
                isLightTheme 
                  ? 'bg-white/80 border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.04)]' 
                  : 'bg-slate-900/40 border-white/[0.05] shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
              }`}>
                <div className="space-y-2.5">
                  <label htmlFor="login-email" className={`text-[10px] font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
                    isLightTheme ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {t('emailAddress')}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 ${
                      isLightTheme 
                        ? 'bg-slate-50 border border-slate-250 text-slate-800 placeholder-slate-400 shadow-sm' 
                        : 'bg-slate-950/60 border border-white/[0.06] text-white placeholder-slate-600 shadow-inner'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className={`w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 select-none cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 ${
                    isLightTheme 
                      ? 'disabled:from-slate-100 disabled:to-slate-200 disabled:text-slate-400' 
                      : 'disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500'
                  }`}
                >
                  {loginLoading ? (
                    <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>🚀 {t('sendMagicLink')}</span>
                  )}
                </button>
              </form>

              {magicLinkUrl && (
                <div className={`p-5 rounded-2xl space-y-2.5 text-center animate-pulse shadow-sm border ${
                  isLightTheme 
                    ? 'bg-amber-500/5 border-amber-500/30' 
                    : 'bg-amber-500/5 border-amber-500/20'
                }`}>
                  <p className="text-xs text-amber-500 dark:text-amber-400 font-extrabold tracking-wider">✨ {t('magicLinkAutoLogin')}</p>
                  <p className={`text-[10px] font-medium ${isLightTheme ? 'text-slate-650' : 'text-slate-400'}`}>{t('magicLinkAutoLoginDesc')}</p>
                  <a
                    href={magicLinkUrl}
                    className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 font-bold rounded-xl text-xs transition-all shadow-md mt-1 cursor-pointer select-none"
                  >
                    🔑 {t('clickToLoginDirectly')}
                  </a>
                </div>
              )}
            </div>
          ) : (
            /* CUSTOMIZER FORM (AUTHENTICATED) */
            <div className={`space-y-8 animate-fade-in ${!showPreview ? 'max-w-4xl mx-auto w-full' : ''}`}>
              <div className={`p-5.5 rounded-2xl border transition-all duration-300 shadow-sm ${
                isLightTheme ? 'bg-white border-slate-200 shadow-slate-100/30' : 'bg-slate-950/40 border-white/[0.04]'
              }`}>
                <h2 className={`text-base font-extrabold flex items-center gap-2 transition-colors duration-300 ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>
                  <span>🛠️</span> {t('studioConfigurator')}
                </h2>
                <p className={`text-xs mt-1 leading-relaxed font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>
                  {t('configuratorDescription')}
                </p>
              </div>

              {/* Quick presets */}
              <div className="space-y-3">
                <label className={`text-[10px] font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
                  isLightTheme ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {t('quickThemePresets')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESETS[lang].map((p, idx) => {
                    const colors = 
                      p.theme === 'gold' ? 'hover:border-amber-500/30 hover:bg-amber-500/5' :
                      p.theme === 'pink' ? 'hover:border-pink-500/30 hover:bg-pink-500/5' :
                      p.theme === 'neon' ? 'hover:border-fuchsia-500/30 hover:bg-fuchsia-500/5' :
                      'hover:border-indigo-500/30 hover:bg-indigo-500/5';
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => applyPreset(p)}
                        className={`px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all select-none text-left cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-sm ${colors} ${
                          isLightTheme 
                            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-slate-100/30' 
                            : 'bg-slate-950/40 border border-white/[0.04] text-slate-200 hover:bg-slate-950/60'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Recipient Name Input */}
                <div className="space-y-2">
                  <label htmlFor="name-input" className={`text-[10px] font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
                    isLightTheme ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {t('recipientName')}
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    value={config.name}
                    onChange={(e) => updateConfig('name', e.target.value)}
                    placeholder={t('enterRecipientName')}
                    className={`w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 ${
                      isLightTheme 
                        ? 'bg-white border border-slate-200 text-slate-800 placeholder-slate-450 shadow-sm' 
                        : 'bg-slate-950/60 border border-white/[0.06] text-white placeholder-slate-600 shadow-inner'
                    }`}
                  />
                </div>

                {/* Recipient Age Input */}
                <div className="space-y-2">
                  <label htmlFor="age-input" className={`text-[10px] font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
                    isLightTheme ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {t('recipientAge')}
                  </label>
                  <input
                    id="age-input"
                    type="number"
                    min="1"
                    max="100"
                    value={config.age || ''}
                    onChange={(e) => updateConfig('age', e.target.value)}
                    placeholder={t('enterRecipientAge')}
                    className={`w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 ${
                      isLightTheme 
                        ? 'bg-white border border-slate-200 text-slate-800 placeholder-slate-450 shadow-sm' 
                        : 'bg-slate-950/60 border border-white/[0.06] text-white placeholder-slate-600 shadow-inner'
                    }`}
                  />
                </div>
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <label className={`text-[10px] font-bold uppercase tracking-wider block transition-colors duration-300 ${
                  isLightTheme ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {t('visualThemeSelect')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {[
                    { id: 'gold' as const, label: t('themeGold'), emoji: '✨', border: 'border-amber-500/80 shadow-amber-500/5 bg-amber-500/5', desc: t('themeGoldDesc') },
                    { id: 'pink' as const, label: t('themePink'), emoji: '🌸', border: 'border-pink-500/80 shadow-pink-500/5 bg-pink-500/5', desc: t('themePinkDesc') },
                    { id: 'neon' as const, label: t('themeNeon'), emoji: '🕹️', border: 'border-fuchsia-500/80 shadow-fuchsia-500/5 bg-fuchsia-500/5', desc: t('themeNeonDesc') },
                    { id: 'space' as const, label: t('themeSpace'), emoji: '🌌', border: 'border-indigo-400/80 shadow-indigo-400/5 bg-indigo-400/5', desc: t('themeSpaceDesc') },
                    { id: 'sunset' as const, label: t('themeSunset'), emoji: '🌇', border: 'border-orange-500/80 shadow-orange-500/5 bg-orange-500/5', desc: t('themeSunsetDesc') },
                    { id: 'forest' as const, label: t('themeForest'), emoji: '🌲', border: 'border-emerald-500/80 shadow-emerald-500/5 bg-emerald-500/5', desc: t('themeForestDesc') },
                    { id: 'violet' as const, label: t('themeViolet'), emoji: '🔮', border: 'border-purple-500/80 shadow-purple-500/5 bg-purple-500/5', desc: t('themeVioletDesc') },
                    { id: 'ocean' as const, label: t('themeOcean'), emoji: '🌊', border: 'border-sky-500/80 shadow-sky-500/5 bg-sky-500/5', desc: t('themeOceanDesc') },
                  ].map((themeItem) => {
                    const isActive = config.theme === themeItem.id;
                    return (
                      <button
                        key={themeItem.id}
                        onClick={() => {
                          updateConfig('theme', themeItem.id);
                          setActivePreviewTab('box');
                        }}
                        className={`flex flex-col p-4 text-left rounded-2xl border-2 transition-all select-none cursor-pointer hover:-translate-y-0.5 ${
                          isActive 
                            ? themeItem.border 
                            : isLightTheme 
                              ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm shadow-slate-100/50' 
                              : 'border-white/[0.04] bg-slate-950/30 hover:bg-slate-950/60 text-slate-200'
                        }`}
                      >
                        <span className="text-xl mb-1.5">{themeItem.emoji}</span>
                        <span className={`text-xs font-bold leading-tight ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>{themeItem.label}</span>
                        <span className={`text-[9px] mt-1.5 leading-relaxed font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>{themeItem.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <label htmlFor="wishes-input" className={`text-[10px] font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
                  isLightTheme ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {t('personalizedWishesLetter')}
                </label>
                <textarea
                  id="wishes-input"
                  rows={4}
                  value={config.wishes}
                  onChange={(e) => updateConfig('wishes', e.target.value)}
                  placeholder={t('wishesPlaceholder')}
                  className={`w-full rounded-xl px-4 py-3 text-sm transition-all resize-y leading-relaxed focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 ${
                    isLightTheme 
                      ? 'bg-white border border-slate-200 text-slate-800 placeholder-slate-450 shadow-sm' 
                      : 'bg-slate-950/60 border border-white/[0.06] text-white placeholder-slate-600 shadow-inner'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Audio Track Selector */}
                <div className="space-y-2">
                  <label htmlFor="music-input" className={`text-[10px] font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
                    isLightTheme ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {t('soundSignature')}
                  </label>
                  <select
                    id="music-input"
                    value={config.music}
                    onChange={(e) => updateConfig('music', e.target.value as CardConfig['music'])}
                    className={`w-full rounded-xl px-4 py-3 text-sm transition-all cursor-pointer focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 ${
                      isLightTheme 
                        ? 'bg-white border border-slate-200 text-slate-800 shadow-sm' 
                        : 'bg-slate-950/60 border border-white/[0.06] text-white'
                    }`}
                  >
                    <option value="music-box" className={isLightTheme ? "text-slate-800 bg-white" : "text-white bg-slate-900"}>{lang === 'en' ? '🎁 Classic Music Box (Nostalgic)' : '🎁 සම්භාව්‍ය සංගීත පෙට්ටිය (අතීත මතක)'}</option>
                    <option value="lofi" className={isLightTheme ? "text-slate-800 bg-white" : "text-white bg-slate-900"}>{lang === 'en' ? '☕ Cozy Lofi Birthday (Chill)' : '☕ සුවපහසු ලොෆයි උපන්දිනය (සන්සුන්)'}</option>
                    <option value="piano" className={isLightTheme ? "text-slate-800 bg-white" : "text-white bg-slate-900"}>{lang === 'en' ? '🎹 Elegant Piano (Emotional)' : '🎹 අලංකාර පියානෝව (හැඟීම්බර)'}</option>
                    <option value="none" className={isLightTheme ? "text-slate-800 bg-white" : "text-white bg-slate-900"}>{lang === 'en' ? '🔇 No Audio' : '🔇 ශබ්දය රහිත'}</option>
                  </select>
                </div>

                {/* 5-Image Uploader Dropzone */}
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
                    isLightTheme ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {t('uploadMemoryPhotos')}
                  </label>
                  
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Previews */}
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className={`relative w-14 h-14 rounded-xl overflow-hidden border shadow-md group ${
                        isLightTheme ? 'border-slate-200' : 'border-white/[0.06]'
                      }`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="upload preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(idx)}
                          className="absolute inset-0 bg-red-650/90 text-white font-bold text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity select-none cursor-pointer"
                        >
                          ❌
                        </button>
                      </div>
                    ))}

                    {/* Add Box */}
                    {uploadedImages.length < 5 && (
                      <label className={`w-14 h-14 flex flex-col items-center justify-center border border-dashed rounded-xl cursor-pointer transition-all shadow-inner ${
                        isLightTheme 
                          ? 'bg-slate-100/60 hover:bg-slate-200/50 border-slate-300 hover:border-amber-500/50 text-slate-500' 
                          : 'bg-slate-950/40 hover:bg-slate-950/80 border-white/[0.1] hover:border-amber-500/50 text-slate-350'
                      }`}>
                        <span className="text-lg font-bold">+</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    )}

                    {uploading && (
                      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-xs text-rose-450 mt-1 font-semibold">⚠️ {uploadError}</p>
                  )}
                  <span className={`text-[10px] block mt-1 leading-normal italic transition-colors duration-300 ${
                    isLightTheme ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {t('uploaderTip')}
                  </span>
                </div>
              </div>

              {/* Interactive Effects toggles */}
              <div className="space-y-3">
                <label className={`text-[10px] font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
                  isLightTheme ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {t('activeEffects')}
                </label>
                <div className={`flex flex-wrap gap-4 p-4.5 rounded-2xl border transition-all duration-300 ${
                  isLightTheme ? 'bg-white border-slate-200 shadow-sm shadow-slate-100/50' : 'bg-slate-950/30 p-4.5 rounded-2xl border border-white/[0.04]'
                }`}>
                  {[
                    { id: 'balloons' as const, label: lang === 'en' ? 'Floating Popping Balloons' : 'පාවෙන පිපිරෙන බැලූන්' },
                    { id: 'candles' as const, label: lang === 'en' ? 'Virtual Blowable Candles' : 'පිඹ නිවා දැමිය හැකි ඉටිපන්දම්' },
                    { id: 'confetti' as const, label: lang === 'en' ? 'Explosive Confetti Shower' : 'කොන්ෆෙට්ටි වර්ෂාව' },
                  ].map((effect) => {
                    const isActive = config.effects.includes(effect.id);
                    return (
                      <label key={effect.id} className={`flex items-center gap-2.5 text-sm font-semibold cursor-pointer select-none transition-colors duration-300 ${
                        isLightTheme ? 'text-slate-750' : 'text-slate-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => {
                            const nextEffects = isActive
                              ? config.effects.filter(id => id !== effect.id)
                              : [...config.effects, effect.id];
                            updateConfig('effects', nextEffects);
                          }}
                          className={`w-4.5 h-4.5 accent-amber-500 rounded ${
                            isLightTheme ? 'border-slate-300 bg-white' : 'border-white/[0.08] bg-slate-950/60'
                          }`}
                        />
                        <span>{effect.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Database & Local Sharing Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Database Save Card Panel */}
                <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-lg space-y-4 flex flex-col justify-between transition-all duration-300 ${
                  isLightTheme 
                    ? 'bg-white border-slate-200 shadow-slate-100/30' 
                    : 'bg-slate-900/40 border-white/[0.05]'
                }`}>
                  <div>
                    <h3 className={`text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>
                      <span>💾</span> {t('saveToDbCollection')}
                    </h3>
                    <p className={`text-[10px] mt-1 leading-normal font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-650' : 'text-slate-400'}`}>
                      {t('saveToDbDesc')}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {dbShareLink ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={dbShareLink}
                            className={`flex-1 border rounded-lg px-3 py-2 text-[10px] focus:outline-none transition-colors duration-300 ${
                              isLightTheme 
                                ? 'bg-slate-50 border-slate-200 text-slate-600' 
                                : 'bg-slate-950 border-white/[0.06] text-slate-350'
                            }`}
                          />
                          <button
                            onClick={() => copyToClipboard(dbShareLink)}
                            className="px-4 py-2 bg-amber-500 text-neutral-900 hover:bg-amber-600 active:scale-95 transition-all text-[10px] font-bold rounded-lg flex items-center gap-1 select-none cursor-pointer shadow-md shadow-amber-500/10"
                          >
                            <span>{copied ? t('copied') : t('copy')}</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-emerald-400 font-bold animate-pulse">
                          ✨ {t('savedMessage')}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={saveBirthdayCard}
                        disabled={savingCard}
                        className={`w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold rounded-xl text-xs transition-all select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 ${
                          isLightTheme ? 'disabled:bg-slate-200 disabled:text-slate-400' : 'disabled:bg-slate-800'
                        }`}
                      >
                        {savingCard ? (
                          <div className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>{t('saveCardGetLink')}</span>
                        )}
                      </button>
                    )}
                    {saveError && (
                      <p className="text-[10px] text-rose-450 font-semibold">⚠️ {saveError}</p>
                    )}
                  </div>
                </div>

                {/* Instant Serverless Base64 Link */}
                <div className={`p-6 rounded-2xl border shadow-md space-y-4 flex flex-col justify-between transition-all duration-300 ${
                  isLightTheme 
                    ? 'bg-white border-slate-200 shadow-slate-100/30' 
                    : 'bg-slate-950/20 border-white/[0.03]'
                }`}>
                  <div>
                    <h3 className={`text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${isLightTheme ? 'text-slate-750' : 'text-slate-350'}`}>
                      <span>🔗</span> {t('standaloneUrlLink')}
                    </h3>
                    <p className={`text-[10px] mt-1 leading-normal font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-650' : 'text-slate-400'}`}>
                      {t('standaloneUrlDesc')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className={`flex-1 border rounded-lg px-3 py-2 text-[10px] focus:outline-none transition-colors duration-300 ${
                        isLightTheme 
                          ? 'bg-slate-50 border-slate-200 text-slate-600' 
                          : 'bg-slate-950 border-white/[0.06] text-slate-350'
                      }`}
                    />
                    <button
                      onClick={() => copyToClipboard(shareUrl)}
                      className={`px-4 py-2 border transition-all text-[10px] font-bold rounded-lg flex items-center gap-1 select-none cursor-pointer ${
                        isLightTheme 
                          ? 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700' 
                          : 'bg-slate-900 border-white/[0.08] hover:bg-slate-850 text-slate-200'
                      }`}
                    >
                      <span>{t('copy')}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* CARD CREATION HISTORY PANEL */}
              <div className={`pt-6 border-t space-y-4 transition-colors duration-300 ${
                isLightTheme ? 'border-slate-200/80' : 'border-white/[0.05]'
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>
                  <span>📚</span> {t('myCollectionHistory')}
                </h3>
                
                {historyLoading ? (
                  <div className="flex items-center gap-2 py-4">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className={`text-xs transition-colors duration-300 ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>{t('loadingCards')}</span>
                  </div>
                ) : historyCards.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    {t('noCardsCreated')}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                    {historyCards.map((card) => {
                      const shareLink = `${window.location.origin}/wish?id=${card.id}&lang=${lang}`;
                      
                      return (
                        <div
                          key={card.id}
                          className={`flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5 group shadow-sm animate-fade-in p-4 rounded-2xl border ${
                            isLightTheme 
                              ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-250 shadow-slate-100/50' 
                              : 'bg-slate-900/40 hover:bg-slate-950/60 border-white/[0.04] hover:border-white/[0.08]'
                          }`}
                        >
                          <div
                            onClick={() => {
                              // Load card into mockup preview config (Read-Only)
                              setConfig({
                                name: card.name,
                                age: card.age?.toString() || '',
                                wishes: card.wishes,
                                theme: card.theme,
                                music: card.music,
                                effects: card.effects,
                                imageUrl: card.images[0] || '',
                              });
                              setUploadedImages(card.images);
                              setActivePreviewTab('box');
                            }}
                            className="flex-1 text-left cursor-pointer space-y-1.5 select-none"
                          >
                            <div className="flex items-center gap-2">
                              <h4 className={`text-xs font-bold leading-none transition-colors duration-300 ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>
                                {t('historyTo')}{card.name}
                              </h4>
                              {card.images && card.images.length > 0 && (
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full select-none">
                                  📸 {card.images.length}
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-500 font-medium leading-none">
                              {new Date(card.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              {card.theme} {t('historyTheme')}
                            </span>
                          </div>

                          <div className="flex gap-2 font-sans shrink-0">
                            <button
                              onClick={() => copyToClipboard(shareLink)}
                              className={`px-2.5 py-1.5 text-[9px] font-bold rounded-lg border transition-all cursor-pointer select-none ${
                                isLightTheme 
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                                  : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-white/[0.04]'
                              }`}
                              title="Copy Share Link"
                            >
                              📋 Copy
                            </button>
                            <a
                              href={`/wish?id=${card.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-900 text-[9px] font-bold rounded-lg transition-all block text-center cursor-pointer select-none shadow-md shadow-amber-500/5"
                            >
                              🔗 Open
                            </a>
                            <button
                              onClick={() => deleteBirthdayCard(card.id)}
                              className="px-2.5 py-1.5 bg-rose-600/85 hover:bg-rose-650 text-white text-[9px] font-bold rounded-lg transition-all cursor-pointer select-none"
                              title="Delete Card"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Right pane: Real-time Live Preview container */}
        {showPreview && (
          <div className={`col-span-12 lg:col-span-5 p-6 md:p-8 flex flex-col items-center justify-center relative min-h-[500px] transition-colors duration-300 ${
            isLightTheme ? 'bg-slate-100/70 border-l border-slate-200/50' : 'bg-slate-950'
          }`}>
            
            {/* Label banner */}
            <div className="absolute top-5 left-6 z-10 flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider select-none transition-colors duration-300 ${
                isLightTheme ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Live Preview Screen
              </span>
            </div>

            {/* Action buttons */}
            <div className="absolute top-5 right-6 z-10 flex gap-2">
              <button
                onClick={() => {
                  setActivePreviewTab('box');
                  setPreviewConfetti(false);
                }}
                className={`px-3.5 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase select-none cursor-pointer border ${
                  isLightTheme 
                    ? 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-sm' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-350 border-white/[0.04]'
                }`}
              >
                🔄 Reset Flow
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className={`px-3.5 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase select-none cursor-pointer border ${
                  isLightTheme 
                    ? 'bg-white hover:bg-slate-50 text-rose-600 border-slate-200 shadow-sm' 
                    : 'bg-slate-900 hover:bg-slate-805 text-rose-400 border-rose-500/10'
                }`}
              >
                ✕ Hide
              </button>
            </div>

          {/* Device Mockup shell */}
          <div className="w-full max-w-[340px] aspect-[9/19] rounded-[48px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative bg-black overflow-hidden flex flex-col">
            
            {/* Camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full border border-slate-750" />
            </div>

            {/* Inner frame viewport */}
            <div className={`flex-1 relative flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden transition-colors duration-700 ${previewTheme.bgClass} ${previewTheme.fontClass}`}>
              
              {/* Starry background layers */}
              {config.theme === 'gold' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-85 animate-fade-in">
                  <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-amber-400 rounded-full animate-pulse" />
                  <div className="absolute top-[30%] left-[75%] w-1.5 h-1.5 bg-yellow-200 rounded-full animate-pulse" />
                  <div className="absolute top-[75%] left-[15%] w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                </div>
              )}

              {config.theme === 'pink' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60 animate-fade-in">
                  <div className="absolute w-2.5 h-2.5 top-[20%] left-[20%] bg-[#ffb7c5] rounded-full" />
                  <div className="absolute w-3 h-2 top-[50%] left-[80%] bg-[#ffb7c5] rounded-full" />
                  <div className="absolute w-2 h-2.5 top-[80%] left-[30%] bg-[#ffb7c5] rounded-full" />
                </div>
              )}

              {config.theme === 'neon' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 bg-[size:20px_20px] bg-[linear-gradient(to_right,rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,240,255,0.1)_1px,transparent_1px)] animate-fade-in" />
              )}

              {config.theme === 'space' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-65 animate-fade-in">
                  <div className="absolute top-[15%] left-[10%] w-0.5 h-0.5 bg-white rounded-full" />
                  <div className="absolute top-[55%] left-[80%] w-1 h-1 bg-blue-300 rounded-full animate-pulse" />
                  <div className="absolute top-[40%] left-[30%] w-40 h-40 rounded-full bg-indigo-500/5 blur-[45px]" />
                </div>
              )}

              {/* Balloons if active */}
              <BalloonPop active={config.effects.includes('balloons') && activePreviewTab !== 'box'} />

              {/* Confetti if active */}
              <ConfettiEffect active={previewConfetti} />

              {/* Audio controller wrapper */}
              <AudioPlayer
                track={config.music}
                isPlaying={previewMusic}
                onTogglePlay={setPreviewMusic}
              />

              {/* VIEWPORT PHASES */}
              {activePreviewTab === 'box' && (
                <div className="w-full flex flex-col items-center justify-center animate-fade-in p-2">
                  <h3 className={`text-2xl font-bold mb-4 leading-snug ${previewTheme.headerFont}`}>
                    Hello, {config.name || 'Friend'}!
                  </h3>
                  <GiftBox
                    theme={config.theme}
                    onOpen={() => {
                      setActivePreviewTab('cake');
                      if (config.music !== 'none') {
                        setPreviewMusic(true);
                      }
                    }}
                  />
                </div>
              )}

              {activePreviewTab === 'cake' && (
                <div className="w-full flex flex-col items-center justify-center animate-fade-in p-2">
                  <h3 className={`text-xl font-bold mb-1 ${previewTheme.headerFont}`}>
                    Happy Birthday, {config.name || 'Friend'}!
                  </h3>
                  <p className="text-[10px] opacity-75 mb-6 max-w-[180px]">
                    Blow out the candles to read your special card.
                  </p>
                  
                  <CakeCandles
                    age={config.age ? parseInt(config.age) : 3}
                    onBlowOut={() => {
                      setActivePreviewTab('letter');
                      if (config.effects.includes('confetti')) {
                        setPreviewConfetti(true);
                      }
                    }}
                  />
                </div>
              )}

              {activePreviewTab === 'letter' && (
                <div
                  className={`w-full p-5 border rounded-2xl flex flex-col items-center backdrop-blur-md opacity-0 animate-[slideUpOpen_0.6s_ease-out_forwards] ${previewTheme.glassClass}`}
                  style={{
                    borderColor: 'rgba(255,255,255,0.06)',
                  }}
                >
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes slideUpOpen {
                      0% { opacity: 0; transform: translateY(20px) scale(0.97); }
                      100% { opacity: 1; transform: translateY(0) scale(1); }
                    }
                  `}} />

                  <span className="text-xl mb-3 animate-[bounce_1.5s_infinite]">🎉</span>
                  
                  <h4 className={`text-xl font-bold mb-2 tracking-wide ${previewTheme.textColor} ${previewTheme.headerFont}`}>
                    Happy Birthday!
                  </h4>
                  
                  <p className="text-sm font-semibold text-neutral-800 dark:text-white mb-4 leading-none">
                    {config.name || 'Friend'} {config.age ? `• Age ${config.age}` : ''}
                  </p>

                  {/* Multi-Image Polaroid Mockup Slider Preview */}
                  {uploadedImages.length > 0 ? (
                    <div className="relative w-28 h-32 mb-6 mt-1 flex items-center justify-center cursor-pointer">
                      {uploadedImages.map((imgUrl, idx) => {
                        // Just overlay stack for preview
                        const offset = idx % 2;
                        const rotate = offset === 0 ? '-2deg' : '3deg';
                        const scale = idx === 0 ? 'scale-100 z-10 animate-fade-in' : 'scale-90 opacity-75 z-0 animate-fade-in';
                        if (idx > 1) return null; // limit previews stack

                        return (
                          <div 
                            key={idx} 
                            className={`absolute w-24 h-28 bg-white p-1.5 pb-4 border border-neutral-200/50 shadow rounded-sm transition-transform ${scale}`}
                            style={{ transform: `rotate(${rotate})` }}
                          >
                            <div className="w-full h-[82%] relative overflow-hidden bg-neutral-100 rounded-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={imgUrl} alt="Preview Stack" className="w-full h-full object-cover animate-[fadeIn_0.5s_ease]" />
                            </div>
                            {uploadedImages.length > 1 && idx === 0 && (
                              <div className="text-[6px] text-center font-sans text-slate-400 mt-1 font-medium">
                                📷 ({uploadedImages.length} images stack)
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : config.imageUrl ? (
                    <div className="relative w-24 h-24 mb-4 overflow-hidden rounded-lg shadow border-2 border-white dark:border-neutral-800 rotate-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={config.imageUrl}
                        alt="Birthday child"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : null}

                  {/* Wishes text scrollable in mockup */}
                  <div className="max-h-[120px] overflow-y-auto w-full px-1 scrollbar-thin">
                    <p className={`text-xs leading-relaxed whitespace-pre-line text-center ${previewTheme.wishesFont}`}>
                      &ldquo;{config.wishes}&rdquo;
                    </p>
                  </div>

                  <div className="w-12 h-px bg-slate-700/50 my-4" />

                  {/* Blow again button */}
                  <button
                    onClick={() => {
                      setActivePreviewTab('cake');
                      setPreviewConfetti(false);
                    }}
                    className={`px-4 py-1.5 text-[10px] font-bold rounded-full select-none cursor-pointer transition-all ${previewTheme.btnClass}`}
                  >
                    🕯️ Blow Again
                  </button>

                </div>
              )}

            </div>
          </div>
        </div>
        )}


      {/* Floating Premium Notification Toast */}
      {notification && (
        <div 
          className="fixed bottom-6 right-6 z-50 animate-slide-in-up font-sans"
          style={{
            animation: 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes slideInUp {
              0% { opacity: 0; transform: translateY(20px) scale(0.95); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}} />
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-sm transition-all duration-300 ${
            notification.type === 'error'
              ? isLightTheme
                ? 'bg-red-50/95 border-red-200 text-red-800 shadow-red-100/50'
                : 'bg-[#1a0a0d]/90 border-red-500/30 text-red-200 shadow-red-950/20'
              : notification.type === 'success'
              ? isLightTheme
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800 shadow-emerald-100/50'
                : 'bg-[#0b1a0d]/90 border-emerald-500/30 text-emerald-200 shadow-emerald-950/20'
              : isLightTheme
              ? 'bg-amber-50/95 border-amber-200 text-amber-800 shadow-amber-100/50'
              : 'bg-[#0d1527]/90 border-amber-500/30 text-amber-200 shadow-amber-950/20'
          }`}>
            <span className="text-lg select-none">
              {notification.type === 'error' ? '🚨' : notification.type === 'success' ? '✨' : '🪄'}
            </span>
            <div className="flex-1 text-xs font-semibold leading-normal tracking-wide">
              {notification.text}
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-[10px] font-bold opacity-40 hover:opacity-100 transition-opacity pl-2 select-none cursor-pointer bg-transparent border-none text-current"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      </div>

      {/* Footer */}
      <footer className={`py-4 text-center border-t text-[11px] font-semibold transition-colors duration-300 tracking-wide z-10 shrink-0 ${
        isLightTheme 
          ? 'border-slate-200/80 bg-white/40 text-slate-500 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]' 
          : 'border-white/[0.04] bg-slate-950/40 text-slate-500'
      }`}>
        Developed by{' '}
        <a 
          href="https://thilina-samarasinghe-portfolio.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`font-bold transition-all duration-300 hover:underline ${
            isLightTheme ? 'text-amber-600 hover:text-amber-700' : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          Thilina Samarasinghe
        </a>
      </footer>
    </div>
  );
}
