'use client';

import React, { useState, useEffect, useRef } from 'react';
import { encodeConfig, DEFAULT_CONFIG, CardConfig } from '@/utils/encoder';
import CardPreviewFrame from '@/components/wishes/CardPreviewFrame';
import { getNativeMode, GOOGLE_FONTS_URL, THEME_IDS, THEMES, type ThemeId } from '@/lib/themes';
import { MUSIC_LABELS, MUSIC_TRACKS, type CardLang, type MusicTrack } from '@/lib/cardText';
import { BirthdaySynth, unlockAudio } from '@/utils/audioSynth';

interface SavedWishCard {
  id: string;
  name: string;
  age?: number | null;
  wishes: string;
  theme: ThemeId;
  music: MusicTrack;
  effects: ('balloons' | 'candles' | 'confetti')[];
  images: string[];
  lang?: string | null;
  mode?: string | null;
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
    continueAsGuest: "Continue as Guest",
    cardSettings: "Send This Card In",
    cardSettingsDesc: "These choices are for the card you send. The language and 🌙 buttons at the top only change this website.",
    cardLanguage: "Card language",
    cardAppearance: "Card appearance",
    modeDark: "Dark",
    modeLight: "Light",
    tapToHear: "Tap a sound to hear it. It plays for the birthday person when they open the card.",
    previewCard: "Preview Card",
    previewTitle: "Card Preview",
    previewPanelTitle: "Check your card first",
    previewPanelDesc: "See exactly what the birthday person will see, with the song. Tap the gift to start.",
    previewAskTitle: "Preview your card first?",
    previewAskDesc: "Make sure the name, song, and message look right before you share it.",
    skipAndSave: "Skip and save",
    skipAndCopy: "Skip and copy link",
    backToEditing: "Edit",
    looksGoodSave: "Looks good: Save & get link",
    looksGoodCopy: "Looks good: Copy link",
    restartPreview: "Restart",
    livePreview: "Live Preview",
    guestLoginHint: "No account needed. Create a card and share it by link.",
    guestPromptTitle: "Want to keep your cards?",
    guestPromptDesc: "Sign in to save your wishes, add photos, and view your previous cards anytime.",
    guestPromptAction: "Sign In",
    enterCreativeStudio: "Enter Creative Studio",
    loginDescription: "Sign in securely with email. We will generate a passwordless magic link to save cards and upload memories.",
    emailAddress: "Email Address",
    sendMagicLink: "Send Magic Link",
    sendingMagicLink: "Sending Magic Link...",
    magicLinkAutoLogin: "DEVELOPMENT AUTO-LOGIN CUE",
    magicLinkAutoLoginDesc: "Running locally: you can also sign in right here without opening your email:",
    magicLinkSent: "Sign-in link sent! Please check your email inbox.",
    magicLinkNotSent: "The email could not be sent:",
    newThemeTag: "New",
    clickToLoginDirectly: "Click to Login Directly",
    studioConfigurator: "Studio Configurator",
    configuratorDescription: "Customize the recipient details, select interactive sound tracks, choose visual themes, and upload memory pictures to save in the database.",
    quickThemePresets: "Quick Theme Presets",
    recipientName: "Recipient Name",
    enterRecipientName: "Enter recipient's name",
    recipientAge: "Recipient Age (Optional)",
    enterRecipientAge: "Enter age (e.g. 25)",
    visualThemeSelect: "Visual Theme Select",
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
    continueAsGuest: "අමුත්තෙකු ලෙස ඉදිරියට යන්න",
    cardSettings: "මෙම කාඩ්පත යවන ආකාරය",
    cardSettingsDesc: "මෙම තේරීම් ඔබ යවන කාඩ්පත සඳහා වේ. ඉහළ ඇති භාෂා සහ 🌙 බොත්තම් මෙම වෙබ් අඩවිය පමණක් වෙනස් කරයි.",
    cardLanguage: "කාඩ්පතේ භාෂාව",
    cardAppearance: "කාඩ්පතේ පෙනුම",
    modeDark: "අඳුරු",
    modeLight: "ආලෝකමත්",
    tapToHear: "ශබ්දයක් ඇසීමට එය ස්පර්ශ කරන්න. කාඩ්පත විවෘත කළ විට එය උපන්දින හිමියාට ඇසේ.",
    previewCard: "කාඩ්පත පෙරදසුන් කරන්න",
    previewTitle: "කාඩ්පත් පෙරදසුන",
    previewPanelTitle: "පළමුව ඔබේ කාඩ්පත පරීක්ෂා කරන්න",
    previewPanelDesc: "උපන්දින හිමියාට පෙනෙන දේ ගීතය සමඟම බලන්න. ආරම්භ කිරීමට තෑග්ග ස්පර්ශ කරන්න.",
    previewAskTitle: "පළමුව කාඩ්පත පෙරදසුන් කරන්නද?",
    previewAskDesc: "බෙදාගැනීමට පෙර නම, ගීතය සහ පණිවිඩය නිවැරදිදැයි බලන්න.",
    skipAndSave: "මඟහැර සුරකින්න",
    skipAndCopy: "මඟහැර සබැඳිය පිටපත් කරන්න",
    backToEditing: "සංස්කරණය",
    looksGoodSave: "හොඳයි: සුරැකලා සබැඳිය ලබා ගන්න",
    looksGoodCopy: "හොඳයි: සබැඳිය පිටපත් කරන්න",
    restartPreview: "නැවත ආරම්භ කරන්න",
    livePreview: "සජීවී පෙරදසුන",
    guestLoginHint: "ගිණුමක් අවශ්‍ය නැත. කාඩ්පතක් සාදා සබැඳියකින් බෙදාගන්න.",
    guestPromptTitle: "ඔබේ කාඩ්පත් තබා ගැනීමට අවශ්‍යද?",
    guestPromptDesc: "ඔබේ සුභපැතුම් සුරැකීමට, ඡායාරූප එක් කිරීමට සහ පෙර කාඩ්පත් ඕනෑම වේලාවක බැලීමට ඇතුළු වන්න.",
    guestPromptAction: "ඇතුළු වන්න",
    enterCreativeStudio: "නිර්මාණාත්මක ස්ටුඩියෝවට ඇතුළු වන්න",
    loginDescription: "විද්‍යුත් තැපෑලෙන් ආරක්ෂිතව ඇතුළු වන්න. කාඩ්පත් සුරැකීමට සහ මතකයන් උඩුගත කිරීමට අපි මුරපද රහිත මැජික් සබැඳියක් සාදන්නෙමු.",
    emailAddress: "විද්‍යුත් තැපැල් ලිපිනය",
    sendMagicLink: "මැජික් සබැඳිය එවන්න",
    sendingMagicLink: "සබැඳිය යවමින් පවතී...",
    magicLinkAutoLogin: "සංවර්ධන ස්වයංක්‍රීය ඇතුළුවීමේ ඉඟිය",
    magicLinkAutoLoginDesc: "දේශීයව ධාවනය වේ: ඔබේ විද්‍යුත් තැපෑල විවෘත නොකර මෙතැනින්ම ඇතුළු විය හැක:",
    magicLinkSent: "ඇතුළුවීමේ සබැඳිය යවන ලදී! කරුණාකර ඔබේ විද්‍යුත් තැපෑල පරීක්ෂා කරන්න.",
    magicLinkNotSent: "විද්‍යුත් තැපෑල යැවීමට නොහැකි විය:",
    newThemeTag: "නව",
    clickToLoginDirectly: "කෙලින්ම ඇතුළු වීමට ක්ලික් කරන්න",
    studioConfigurator: "ස්ටුඩියෝ සැකසුම්කරණය",
    configuratorDescription: "ලබන්නාගේ තොරතුරු සකසන්න, අන්තර්ක්‍රියාකාරී ශබ්ද පීලි තෝරන්න, දෘශ්‍ය තේමා තෝරන්න, සහ මතක පින්තූර උඩුගත කරන්න.",
    quickThemePresets: "ඉක්මන් තේමා පෙරසිටුවීම්",
    recipientName: "ලබන්නාගේ නම",
    enterRecipientName: "ලබන්නාගේ නම ඇතුළත් කරන්න",
    recipientAge: "ලබන්නාගේ වයස (විකල්ප)",
    enterRecipientAge: "වයස ඇතුළත් කරන්න (උදා. 25)",
    visualThemeSelect: "දෘශ්‍ය තේමාව තෝරන්න",
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
    },
    {
      label: "🎈 Confetti Party (Fun)",
      wishes: "It's your day, so turn the music up! Wishing you cake, laughter, and a year packed with big happy moments! 🎉🎂",
      theme: "party" as const,
      music: "music-box" as const,
    },
    {
      label: "📔 Memory Scrapbook (Heartfelt)",
      wishes: "Another year of memories with you, and I'd keep every page. Happy birthday to one of my favorite people. 💌",
      theme: "scrapbook" as const,
      music: "piano" as const,
    },
    {
      label: "🍃 Ceylon Tea Garden (Elegant)",
      wishes: "May your year be as calm as the misty hills and as warm as a fresh cup of tea. Wishing you peace, health, and happiness. 🍵",
      theme: "ceylon" as const,
      music: "piano" as const,
    },
    {
      label: "👾 Pixel Arcade (Gamer)",
      wishes: "LEVEL UP! You just unlocked a brand new year. Bonus lives, extra cake, and zero game overs ahead! 🕹️",
      theme: "arcade" as const,
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
    },
    {
      label: "🎈 සාද උත්සවය (විනෝදජනක)",
      wishes: "අද ඔබේ දවස, ඒ නිසා සංගීතය වැඩි කරන්න! කේක්, සිනහව සහ සතුටු මොහොතවල් පිරුණු වසරක් ඔබට ප්‍රාර්ථනා කරමි! 🎉🎂",
      theme: "party" as const,
      music: "music-box" as const,
    },
    {
      label: "📔 මතක සටහන් පොත (හදවතින්ම)",
      wishes: "ඔබ සමඟ තවත් මතක පිරුණු වසරක්. ඒ හැම පිටුවක්ම මම රැකගන්නම්. මගේ ආදරණීය කෙනෙකුට සුභ උපන්දිනයක්! 💌",
      theme: "scrapbook" as const,
      music: "piano" as const,
    },
    {
      label: "🍃 සිලෝන් තේ වතුයාය (අලංකාර)",
      wishes: "මීදුම් කඳු මෙන් සන්සුන්, උණු තේ කෝප්පයක් මෙන් උණුසුම් වසරක් ඔබට වේවා. සාමය, නිරෝගීකම සහ සතුට ප්‍රාර්ථනා කරමි. 🍵",
      theme: "ceylon" as const,
      music: "piano" as const,
    },
    {
      label: "👾 පික්සල් ආකේඩ් (ගේමර්)",
      wishes: "LEVEL UP! ඔබ අලුත්ම වසරක් අගුළු හැරියා. අමතර ජීවිත, අමතර කේක්, Game Over නැහැ! 🕹️",
      theme: "arcade" as const,
      music: "lofi" as const,
    }
  ]
};

// Changes the card's language, and translates the message if it is still an unedited preset
function withCardLang(config: CardConfig, next: CardLang): CardConfig {
  const presetIndex = PRESETS[config.lang ?? 'en'].findIndex((preset) => preset.wishes === config.wishes);
  return {
    ...config,
    lang: next,
    wishes: presetIndex >= 0 ? PRESETS[next][presetIndex].wishes : config.wishes,
  };
}

export default function CustomizerPage() {
  const [config, setConfig] = useState<CardConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewedCard, setPreviewedCard] = useState<string | null>(null);
  const [pendingShare, setPendingShare] = useState<'save' | 'copy' | null>(null);
  const [playingTrack, setPlayingTrack] = useState<MusicTrack | null>(null);
  const soundPreview = useRef<BirthdaySynth | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);

  // Auth & Database States
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
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
  
  // Close the preview with the phone's back button, and stop the sound when leaving the page
  useEffect(() => {
    const onPopState = () => {
      setPreviewOpen(false);
      setPendingShare(null);
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        soundPreview.current?.stop();
        setPlayingTrack(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      soundPreview.current?.stop();
    };
  }, []);

  // Custom font loader & Client mount session validation
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    const link = document.createElement('link');
    link.href = GOOGLE_FONTS_URL;
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
          // Only a starting point: the website language button never changes the card afterwards
          setConfig(current => withCardLang(current, savedLang as CardLang));
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
        // Dev mode only: the API also returns the link for a quick local sign-in
        if (data.link) {
          setMagicLinkUrl(data.link);
        }
        if (data.emailSent) {
          triggerNotification(t('magicLinkSent'), 'success');
        } else if (data.emailError) {
          triggerNotification(`${t('magicLinkNotSent')} ${data.emailError}`, 'error');
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
          images: uploadedImages,
          lang: config.lang,
          mode: config.mode
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
    ? `${window.location.origin}/wish?card=${encodeConfig(config)}`
    : '';

  // Handle preset application
  const applyPreset = (index: number) => {
    const preset = PRESETS[config.lang ?? 'en'][index];
    setConfig(prev => ({
      ...prev,
      wishes: preset.wishes,
      theme: preset.theme,
      music: preset.music
    }));
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



  // --- Sound selection ---
  const stopSoundPreview = () => {
    soundPreview.current?.stop();
    setPlayingTrack(null);
  };

  const selectTrack = (track: MusicTrack) => {
    unlockAudio();
    const wasPlayingThis = playingTrack === track;
    updateConfig('music', track);
    stopSoundPreview();
    // Tapping the track that is playing stops it
    if (track === 'none' || wasPlayingThis) return;

    if (!soundPreview.current) soundPreview.current = new BirthdaySynth(track);
    soundPreview.current.setLoop(false);
    soundPreview.current.setTheme(track);
    soundPreview.current.play(() => setPlayingTrack(null));
    setPlayingTrack(track);
  };

  // --- Preview and sharing ---
  const cardFingerprint = JSON.stringify({ config, uploadedImages });
  const previewShareAction: 'save' | 'copy' = pendingShare ?? (user && !dbShareLink ? 'save' : 'copy');

  const runShare = (action: 'save' | 'copy') => {
    if (action === 'save') {
      saveBirthdayCard();
    } else {
      copyToClipboard(dbShareLink ?? shareUrl);
    }
  };

  // Suggest a preview unless this exact version of the card has already been previewed
  const requestShare = (action: 'save' | 'copy') => {
    if (previewedCard === cardFingerprint) {
      runShare(action);
    } else {
      setPendingShare(action);
    }
  };

  const openPreview = () => {
    stopSoundPreview();
    setPreviewedCard(cardFingerprint);
    setPreviewOpen(true);
    // Lets the phone's back button close the preview instead of leaving the studio
    window.history.pushState({ cardPreview: true }, '');
  };

  const closePreview = () => {
    window.history.back();
  };

  const confirmPreview = () => {
    const action = previewShareAction;
    closePreview();
    runShare(action);
  };

  const togglePreviewPane = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setShowPreview(prev => !prev);
    } else {
      openPreview();
    }
  };

  return (
    <div className={`min-h-dvh transition-colors duration-300 font-sans flex flex-col relative overflow-clip ${
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
            <p className={`hidden md:block text-xs md:text-xs font-medium transition-colors duration-300 ${
              isLightTheme ? 'text-slate-500' : 'text-slate-400'
            }`}>{t('brandSubtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className={`min-h-9 px-2 py-1.5 rounded-xl border transition-all cursor-pointer select-none text-xs font-bold shadow-sm flex items-center justify-center shrink-0 hover:-translate-y-0.5 active:translate-y-0 ${
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
            className={`min-h-9 min-w-9 shrink-0 p-1.5 rounded-xl border transition-all cursor-pointer select-none text-xs sm:text-sm md:text-base shadow-sm flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 ${
              isLightTheme 
                ? 'bg-white border-slate-200 text-amber-500 hover:bg-slate-50 shadow-slate-100' 
                : 'bg-slate-900 border-white/[0.08] text-amber-400 hover:bg-slate-850'
            }`}
            aria-label="Toggle theme"
            title={isLightTheme ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {isLightTheme ? '☀️' : '🌙'}
          </button>

          {(user || guestMode) && (
            <button
              onClick={togglePreviewPane}
              className={`text-xs font-bold min-h-9 min-w-9 shrink-0 justify-center px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer select-none hover:-translate-y-0.5 active:translate-y-0 ${
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
                className={`text-xs font-bold px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all select-none cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
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
            <span className={`hidden sm:inline-block text-xs font-bold select-none uppercase tracking-wider px-2 py-1 border rounded-full transition-all duration-300 ${
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 lg:overflow-hidden min-w-0">
        
        {/* Left pane: Customizer / Login Panel (scrollable) */}
        <div className={`${showPreview ? 'lg:col-span-7' : 'lg:col-span-12'} min-w-0 p-4 sm:p-6 md:p-8 lg:overflow-y-auto lg:max-h-[calc(100vh-81px)] transition-all duration-300 lg:border-r space-y-8 scrollbar-thin ${
          isLightTheme ? 'border-slate-200/80 shadow-inner bg-slate-50/50' : 'border-white/[0.05]'
        }`}>
          
          {authLoading ? (
            /* Loading check */
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>{t('loadingCards')}</p>
            </div>
          ) : !user && !guestMode ? (
            /* PASSWORDLESS LOGIN PANEL */
            <div className="max-w-md mx-auto py-6 sm:py-16 space-y-8 animate-fade-in">
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
                  <label htmlFor="login-email" className={`text-xs font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
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
                    className={`w-full rounded-xl px-4 py-3 text-base sm:text-sm transition-all focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 ${
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

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setGuestMode(true)}
                  className={`w-full py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none hover:-translate-y-0.5 active:translate-y-0 ${
                    isLightTheme
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'bg-slate-950/40 border-white/[0.08] text-slate-200 hover:bg-slate-950/70'
                  }`}
                >
                  🎁 {t('continueAsGuest')}
                </button>
                <p className={`text-xs font-medium ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t('guestLoginHint')}
                </p>
              </div>

              {magicLinkUrl && (
                <div className={`p-5 rounded-2xl space-y-2.5 text-center animate-pulse shadow-sm border ${
                  isLightTheme 
                    ? 'bg-amber-500/5 border-amber-500/30' 
                    : 'bg-amber-500/5 border-amber-500/20'
                }`}>
                  <p className="text-xs text-amber-500 dark:text-amber-400 font-extrabold tracking-wider">✨ {t('magicLinkAutoLogin')}</p>
                  <p className={`text-xs font-medium ${isLightTheme ? 'text-slate-650' : 'text-slate-400'}`}>{t('magicLinkAutoLoginDesc')}</p>
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
            /* CUSTOMIZER FORM (signed-in users and guests) */
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

              {/* Card language and appearance: these travel with the card */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 transition-all duration-300 ${
                isLightTheme ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-500/[0.04] border-amber-500/20'
              }`}>
                <div className="space-y-1">
                  <h3 className={`text-sm font-extrabold ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>💌 {t('cardSettings')}</h3>
                  <p className={`text-xs leading-relaxed font-medium ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>{t('cardSettingsDesc')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className={`text-xs font-bold block ${isLightTheme ? 'text-slate-600' : 'text-slate-300'}`}>{t('cardLanguage')}</span>
                    <div role="group" aria-label={t('cardLanguage')} className={`grid grid-cols-2 gap-1 p-1 rounded-xl ${isLightTheme ? 'bg-slate-100' : 'bg-slate-950/60'}`}>
                      <button
                        type="button"
                        aria-pressed={(config.lang ?? 'en') === 'en'}
                        onClick={() => setConfig(current => withCardLang(current, 'en'))}
                        className={`min-h-11 rounded-lg text-sm font-bold transition-all cursor-pointer select-none ${
                          (config.lang ?? 'en') === 'en'
                            ? 'bg-amber-500 text-neutral-950 shadow-sm'
                            : isLightTheme ? 'text-slate-600 hover:bg-white' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                      <button
                        type="button"
                        aria-pressed={config.lang === 'si'}
                        onClick={() => setConfig(current => withCardLang(current, 'si'))}
                        className={`min-h-11 rounded-lg text-sm font-bold transition-all cursor-pointer select-none ${
                          config.lang === 'si'
                            ? 'bg-amber-500 text-neutral-950 shadow-sm'
                            : isLightTheme ? 'text-slate-600 hover:bg-white' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        🇱🇰 සිංහල
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className={`text-xs font-bold block ${isLightTheme ? 'text-slate-600' : 'text-slate-300'}`}>{t('cardAppearance')}</span>
                    <div role="group" aria-label={t('cardAppearance')} className={`grid grid-cols-2 gap-1 p-1 rounded-xl ${isLightTheme ? 'bg-slate-100' : 'bg-slate-950/60'}`}>
                      <button
                        type="button"
                        aria-pressed={(config.mode ?? getNativeMode(config.theme)) === 'dark'}
                        onClick={() => updateConfig('mode', 'dark')}
                        className={`min-h-11 rounded-lg text-sm font-bold transition-all cursor-pointer select-none ${
                          (config.mode ?? getNativeMode(config.theme)) === 'dark'
                            ? 'bg-amber-500 text-neutral-950 shadow-sm'
                            : isLightTheme ? 'text-slate-600 hover:bg-white' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        🌙 {t('modeDark')}
                      </button>
                      <button
                        type="button"
                        aria-pressed={(config.mode ?? getNativeMode(config.theme)) === 'light'}
                        onClick={() => updateConfig('mode', 'light')}
                        className={`min-h-11 rounded-lg text-sm font-bold transition-all cursor-pointer select-none ${
                          (config.mode ?? getNativeMode(config.theme)) === 'light'
                            ? 'bg-amber-500 text-neutral-950 shadow-sm'
                            : isLightTheme ? 'text-slate-600 hover:bg-white' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        ☀️ {t('modeLight')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick presets */}
              <div className="space-y-3">
                <label className={`text-xs font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
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
                        onClick={() => applyPreset(idx)}
                        className={`min-h-11 px-3 py-2.5 rounded-xl text-xs font-bold transition-all select-none text-left cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-sm ${colors} ${
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
                  <label htmlFor="name-input" className={`text-xs font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
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
                    className={`w-full rounded-xl px-4 py-3 text-base sm:text-sm transition-all focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 ${
                      isLightTheme 
                        ? 'bg-white border border-slate-200 text-slate-800 placeholder-slate-450 shadow-sm' 
                        : 'bg-slate-950/60 border border-white/[0.06] text-white placeholder-slate-600 shadow-inner'
                    }`}
                  />
                </div>

                {/* Recipient Age Input */}
                <div className="space-y-2">
                  <label htmlFor="age-input" className={`text-xs font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
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
                    className={`w-full rounded-xl px-4 py-3 text-base sm:text-sm transition-all focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 ${
                      isLightTheme 
                        ? 'bg-white border border-slate-200 text-slate-800 placeholder-slate-450 shadow-sm' 
                        : 'bg-slate-950/60 border border-white/[0.06] text-white placeholder-slate-600 shadow-inner'
                    }`}
                  />
                </div>
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <label className={`text-xs font-bold uppercase tracking-wider block transition-colors duration-300 ${
                  isLightTheme ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {t('visualThemeSelect')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {THEME_IDS.map((themeId) => {
                    const themeItem = THEMES[themeId];
                    const isActive = config.theme === themeId;
                    return (
                      <button
                        key={themeId}
                        onClick={() => {
                          updateConfig('theme', themeId);
                        }}
                        className={`relative flex flex-col p-3 sm:p-4 text-left rounded-2xl border-2 transition-all select-none cursor-pointer hover:-translate-y-0.5 ${
                          isActive 
                            ? themeItem.pickerClass 
                            : isLightTheme 
                              ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm shadow-slate-100/50' 
                              : 'border-white/[0.04] bg-slate-950/30 hover:bg-slate-950/60 text-slate-200'
                        }`}
                      >
                        {themeItem.isNew && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-extrabold uppercase tracking-wide">
                            {t('newThemeTag')}
                          </span>
                        )}
                        <span className="text-xl mb-1.5">{themeItem.emoji}</span>
                        <span className={`text-xs font-bold leading-tight ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>{themeItem.label[lang]}</span>
                        <span className={`text-[11px] mt-1.5 leading-relaxed font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>{themeItem.desc[lang]}</span>
                        <span className={`mt-2.5 h-1.5 w-full rounded-full ${themeItem.swatchClass}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <label htmlFor="wishes-input" className={`text-xs font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
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
                  className={`w-full rounded-xl px-4 py-3 text-base sm:text-sm transition-all resize-y leading-relaxed focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 ${
                    isLightTheme 
                      ? 'bg-white border border-slate-200 text-slate-800 placeholder-slate-450 shadow-sm' 
                      : 'bg-slate-950/60 border border-white/[0.06] text-white placeholder-slate-600 shadow-inner'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Audio Track Selector */}
                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
                    isLightTheme ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {t('soundSignature')}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {MUSIC_TRACKS.map((track) => {
                      const isSelected = config.music === track;
                      const isSounding = playingTrack === track;
                      return (
                        <button
                          key={track}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => selectTrack(track)}
                          className={`min-h-16 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10'
                              : isLightTheme
                                ? 'border-slate-200 bg-white hover:bg-slate-50'
                                : 'border-white/[0.06] bg-slate-950/40 hover:bg-slate-950/70'
                          }`}
                        >
                          <span className="text-lg shrink-0">{MUSIC_LABELS[track].emoji}</span>
                          <span className="flex-1 min-w-0">
                            <span className={`block text-xs font-bold leading-tight ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>{MUSIC_LABELS[track][lang]}</span>
                            <span className={`block text-xs mt-0.5 leading-tight font-medium ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>{MUSIC_LABELS[track].hint[lang]}</span>
                          </span>
                          {track !== 'none' && (
                            <span className="text-xs shrink-0" aria-hidden="true">{isSounding ? '⏸️' : '▶️'}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <span className={`text-xs block leading-normal transition-colors duration-300 ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t('tapToHear')}
                  </span>
                </div>

                {/* 5-Image Uploader Dropzone (the upload API requires a session) */}
                {user && (
                <div className="space-y-2">
                  <label className={`text-xs font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
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
                          className="absolute inset-0 bg-black/40 text-white font-bold text-xs flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity select-none cursor-pointer"
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
                  <span className={`text-xs block mt-1 leading-normal italic transition-colors duration-300 ${
                    isLightTheme ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {t('uploaderTip')}
                  </span>
                </div>
                )}
              </div>

              {/* Interactive Effects toggles */}
              <div className="space-y-3">
                <label className={`text-xs font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
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

              {/* Suggested step before sharing */}
              <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 transition-all duration-300 ${
                isLightTheme ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-500/[0.05] border-emerald-500/20'
              }`}>
                <div className="flex-1 space-y-1">
                  <h3 className={`text-sm font-extrabold ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>👀 {t('previewPanelTitle')}</h3>
                  <p className={`text-xs leading-relaxed font-medium ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>{t('previewPanelDesc')}</p>
                </div>
                <button
                  type="button"
                  onClick={openPreview}
                  className="min-h-12 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-neutral-950 text-sm font-bold transition-all cursor-pointer select-none shrink-0"
                >
                  👁️ {t('previewCard')}
                </button>
              </div>

              {/* Database & Local Sharing Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Database Save Card Panel */}
                {user ? (
                <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-md shadow-lg space-y-4 flex flex-col justify-between transition-all duration-300 ${
                  isLightTheme 
                    ? 'bg-white border-slate-200 shadow-slate-100/30' 
                    : 'bg-slate-900/40 border-white/[0.05]'
                }`}>
                  <div>
                    <h3 className={`text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>
                      <span>💾</span> {t('saveToDbCollection')}
                    </h3>
                    <p className={`text-xs mt-1 leading-normal font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-650' : 'text-slate-400'}`}>
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
                            className={`min-w-0 flex-1 border rounded-lg px-3 py-2.5 text-base sm:text-xs focus:outline-none transition-colors duration-300 ${
                              isLightTheme 
                                ? 'bg-slate-50 border-slate-200 text-slate-600' 
                                : 'bg-slate-950 border-white/[0.06] text-slate-350'
                            }`}
                          />
                          <button
                            onClick={() => copyToClipboard(dbShareLink)}
                            className="min-h-11 shrink-0 px-4 py-2 bg-amber-500 text-neutral-900 hover:bg-amber-600 active:scale-95 transition-all text-xs font-bold rounded-lg flex items-center gap-1 select-none cursor-pointer shadow-md shadow-amber-500/10"
                          >
                            <span>{copied ? t('copied') : t('copy')}</span>
                          </button>
                        </div>
                        <p className="text-xs text-emerald-400 font-bold animate-pulse">
                          ✨ {t('savedMessage')}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => requestShare('save')}
                        disabled={savingCard}
                        className={`w-full min-h-12 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold rounded-xl text-sm transition-all select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 ${
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
                      <p className="text-xs text-rose-450 font-semibold">⚠️ {saveError}</p>
                    )}
                  </div>
                </div>
                ) : (
                <div className={`p-4 sm:p-6 rounded-2xl border shadow-lg space-y-4 flex flex-col justify-between transition-all duration-300 ${
                  isLightTheme ? 'bg-white border-slate-200 shadow-slate-100/30' : 'bg-slate-900/40 border-white/[0.05]'
                }`}>
                  <div className="space-y-1.5">
                    <h3 className={`text-sm font-bold ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>🔑 {t('guestPromptTitle')}</h3>
                    <p className={`text-[11px] leading-relaxed font-medium ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>{t('guestPromptDesc')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGuestMode(false)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer select-none"
                  >
                    {t('guestPromptAction')}
                  </button>
                </div>
                )}

                {/* Instant Serverless Base64 Link */}
                <div className={`p-4 sm:p-6 rounded-2xl border shadow-md space-y-4 flex flex-col justify-between transition-all duration-300 ${
                  isLightTheme 
                    ? 'bg-white border-slate-200 shadow-slate-100/30' 
                    : 'bg-slate-950/20 border-white/[0.03]'
                }`}>
                  <div>
                    <h3 className={`text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${isLightTheme ? 'text-slate-750' : 'text-slate-350'}`}>
                      <span>🔗</span> {t('standaloneUrlLink')}
                    </h3>
                    <p className={`text-xs mt-1 leading-normal font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-650' : 'text-slate-400'}`}>
                      {t('standaloneUrlDesc')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className={`min-w-0 flex-1 border rounded-lg px-3 py-2.5 text-base sm:text-xs focus:outline-none transition-colors duration-300 ${
                        isLightTheme 
                          ? 'bg-slate-50 border-slate-200 text-slate-600' 
                          : 'bg-slate-950 border-white/[0.06] text-slate-350'
                      }`}
                    />
                    <button
                      onClick={() => requestShare('copy')}
                      className={`min-h-11 shrink-0 px-4 py-2 border transition-all text-xs font-bold rounded-lg flex items-center gap-1 select-none cursor-pointer ${
                        isLightTheme 
                          ? 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700' 
                          : 'bg-slate-900 border-white/[0.08] hover:bg-slate-850 text-slate-200'
                      }`}
                    >
                      <span>{copied ? t('copied') : t('copy')}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* CARD CREATION HISTORY PANEL */}
              {user && (
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
                      // Cards saved before the language choice existed still follow the lang param
                      const shareLink = `${window.location.origin}/wish?id=${card.id}${card.lang ? '' : `&lang=${lang}`}`;
                      
                      return (
                        <div
                          key={card.id}
                          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 transition-all hover:-translate-y-0.5 group shadow-sm animate-fade-in p-4 rounded-2xl border ${
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
                                lang: card.lang === 'si' ? 'si' : 'en',
                                mode: card.mode === 'dark' || card.mode === 'light' ? card.mode : undefined,
                              });
                              setUploadedImages(card.images);
                            }}
                            className="flex-1 text-left cursor-pointer space-y-1.5 select-none"
                          >
                            <div className="flex items-center gap-2">
                              <h4 className={`text-xs font-bold leading-none transition-colors duration-300 ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>
                                {t('historyTo')}{card.name}
                              </h4>
                              {card.images && card.images.length > 0 && (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full select-none">
                                  📸 {card.images.length}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-none">
                              {new Date(card.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              {card.theme} {t('historyTheme')}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 sm:flex gap-2 font-sans shrink-0">
                            <button
                              onClick={() => copyToClipboard(shareLink)}
                              className={`min-h-11 sm:min-h-0 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer select-none ${
                                isLightTheme 
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                                  : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-white/[0.04]'
                              }`}
                              title="Copy Share Link"
                            >
                              📋 Copy
                            </button>
                            <a
                              href={shareLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-11 sm:min-h-0 flex items-center justify-center px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-900 text-[11px] font-bold rounded-lg transition-all cursor-pointer select-none shadow-md shadow-amber-500/5"
                            >
                              🔗 Open
                            </a>
                            <button
                              onClick={() => deleteBirthdayCard(card.id)}
                              className="min-h-11 sm:min-h-0 px-2.5 py-1.5 bg-rose-600/85 hover:bg-rose-600 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer select-none"
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
              )}

            </div>
          )}

        </div>

        {/* Right pane: live preview on large screens. Phones use the full-screen preview. */}
        {showPreview && (
          <div className={`hidden lg:flex lg:col-span-5 p-8 flex-col items-center gap-5 relative lg:max-h-[calc(100vh-81px)] lg:overflow-y-auto transition-colors duration-300 ${
            isLightTheme ? 'bg-slate-100/70 border-l border-slate-200/50' : 'bg-slate-950'
          }`}>
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider select-none transition-colors duration-300 ${
                  isLightTheme ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {t('livePreview')}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewKey(key => key + 1)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all select-none cursor-pointer border ${
                    isLightTheme
                      ? 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/[0.04]'
                  }`}
                >
                  🔄 {t('restartPreview')}
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all select-none cursor-pointer border ${
                    isLightTheme
                      ? 'bg-white hover:bg-slate-50 text-rose-600 border-slate-200 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-rose-400 border-rose-500/10'
                  }`}
                >
                  ✕ {t('hide')}
                </button>
              </div>
            </div>

            <div className="w-full max-w-[340px] aspect-[9/19] shrink-0 rounded-[48px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] bg-black overflow-hidden">
              <CardPreviewFrame key={previewKey} config={config} images={uploadedImages} className="w-full h-full border-0" />
            </div>
          </div>
        )}

      {/* Full-screen card preview */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('previewTitle')}
          className="fixed inset-0 z-50 h-dvh flex flex-col items-center bg-black/95"
        >
          <div className="w-full sm:max-w-[430px] flex items-center justify-between gap-3 px-3 py-2 text-white shrink-0">
            <button
              onClick={closePreview}
              className="min-h-11 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold cursor-pointer select-none"
            >
              ← {t('backToEditing')}
            </button>
            <span className="text-xs font-bold opacity-70 truncate">{t('previewTitle')}</span>
          </div>
          <CardPreviewFrame config={config} images={uploadedImages} className="flex-1 min-h-0 w-full sm:max-w-[430px] border-0 bg-black sm:rounded-2xl" />
          <div className="w-full sm:max-w-[430px] p-3 shrink-0">
            <button
              onClick={confirmPreview}
              className="w-full min-h-12 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-neutral-950 text-sm font-bold transition-all cursor-pointer select-none"
            >
              ✅ {previewShareAction === 'save' ? t('looksGoodSave') : t('looksGoodCopy')}
            </button>
          </div>
        </div>
      )}

      {/* Suggests a preview before the card is shared */}
      {pendingShare && !previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => setPendingShare(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('previewAskTitle')}
            onClick={(e) => e.stopPropagation()}
            className={`w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl ${
              isLightTheme ? 'bg-white text-slate-800' : 'bg-slate-900 text-white'
            }`}
          >
            <div className="space-y-1.5 text-center">
              <div className="text-3xl">👀</div>
              <h3 className="text-base font-extrabold">{t('previewAskTitle')}</h3>
              <p className={`text-sm leading-relaxed ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>{t('previewAskDesc')}</p>
            </div>
            <button
              onClick={openPreview}
              className="w-full min-h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-sm font-bold transition-all cursor-pointer select-none"
            >
              👁️ {t('previewCard')}
            </button>
            <button
              onClick={() => {
                const action = pendingShare;
                setPendingShare(null);
                runShare(action);
              }}
              className={`w-full min-h-11 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none ${
                isLightTheme ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {pendingShare === 'save' ? t('skipAndSave') : t('skipAndCopy')}
            </button>
          </div>
        </div>
      )}

      {/* Floating Premium Notification Toast */}
      {notification && (
        <div 
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-[60] animate-slide-in-up font-sans"
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
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl sm:max-w-sm transition-all duration-300 ${
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
              className="text-xs font-bold opacity-40 hover:opacity-100 transition-opacity pl-2 select-none cursor-pointer bg-transparent border-none text-current"
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
