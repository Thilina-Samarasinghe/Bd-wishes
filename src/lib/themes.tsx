import type { ReactNode } from 'react';

/**
 * Single source of truth for every card theme.
 *
 * To add a theme, add one entry to THEMES below. The theme picker, live preview, shared
 * wish page, gift box, and link validation all read from this list.
 *
 * Theme ids are stored in the database and inside shared links, so never rename or
 * remove an existing id: doing so would change how previously shared cards look.
 */

export const THEME_IDS = [
  'gold',
  'pink',
  'neon',
  'space',
  'sunset',
  'forest',
  'violet',
  'ocean',
  'party',
  'scrapbook',
  'ticket',
  'arcade',
  'ceylon',
  'aurora',
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

type Localized = { en: string; si: string };

export interface ThemeDefinition {
  emoji: string;
  label: Localized;
  desc: Localized;
  isNew?: boolean;
  /** Border and background of the selected tile in the theme picker. */
  pickerClass: string;
  /** Small color strip shown on the picker tile. */
  swatchClass: string;
  bgClass: string;
  fontClass: string;
  headerFont: string;
  /** The card frame: this is what gives each design its own shape. */
  cardClass: string;
  /** Decorations drawn inside the card frame, such as tape or corner leaves. */
  cardDecor?: ReactNode;
  textColor: string;
  nameClass: string;
  wishesFont: string;
  btnClass: string;
  secondaryBtnClass: string;
  badgeClass: string;
  dividerClass: string;
  bgEffect: ReactNode;
  box: {
    boxBg: string;
    lidBg: string;
    ribbonBg: string;
    bowBg: string;
    shadow: string;
    textColor: string;
    glow: string;
  };
}

export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Pacifico&family=Orbitron:wght@400..900&family=Space+Grotesk:wght@300..700&family=Outfit:wght@300..900&family=Quicksand:wght@300..700&family=Fira+Code:wght@300..700&family=Fredoka:wght@400..700&family=Caveat:wght@400..700&family=Press+Start+2P&display=swap';

// Shared defaults for the original eight glass-style themes
const GLASS_CARD = 'border rounded-2xl backdrop-blur-md';
const DARK_NAME = 'text-white';
const DARK_SECONDARY_BTN = 'bg-white text-neutral-900';
const AMBER_BADGE = 'bg-amber-500/10 border border-amber-500/30 text-amber-500';
const AMBER_DIVIDER = 'bg-gradient-to-r from-transparent via-amber-500/50 to-transparent';

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  gold: {
    emoji: '✨',
    label: { en: 'Midnight Gold', si: 'මධ්‍යම රාත්‍රී රන්' },
    desc: { en: 'Serif fonts, gold details', si: 'සෙරිෆ් අකුරු, රන් විස්තර' },
    pickerClass: 'border-amber-500/80 shadow-amber-500/5 bg-amber-500/5',
    swatchClass: 'bg-gradient-to-r from-neutral-900 to-amber-400',
    bgClass: 'bg-[#0f0f11] text-[#e5e5e7]',
    fontClass: 'font-["Outfit",sans-serif]',
    headerFont: 'font-["Playfair_Display",serif]',
    cardClass: `${GLASS_CARD} bg-white/[0.03] border-amber-500/20 shadow-[0_8px_32px_0_rgba(212,175,55,0.08)]`,
    textColor: 'text-amber-400',
    nameClass: DARK_NAME,
    wishesFont: 'font-["Playfair_Display",serif] italic text-neutral-200',
    btnClass: 'bg-amber-500 text-neutral-950 hover:bg-amber-600',
    secondaryBtnClass: DARK_SECONDARY_BTN,
    badgeClass: AMBER_BADGE,
    dividerClass: AMBER_DIVIDER,
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Twinkling gold stars */}
        <div className="absolute top-[10%] left-[20%] w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
        <div className="absolute top-[30%] left-[80%] w-1 h-1 bg-yellow-200 rounded-full animate-pulse" style={{ animationDuration: '3.5s' }} />
        <div className="absolute top-[75%] left-[15%] w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDuration: '2.5s' }} />
        <div className="absolute top-[60%] left-[70%] w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
      </div>
    ),
    box: {
      boxBg: 'bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700',
      lidBg: 'bg-neutral-800 border-b border-amber-500/20',
      ribbonBg: 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600',
      bowBg: 'bg-amber-500',
      shadow: 'shadow-amber-500/10',
      textColor: 'text-amber-400 font-serif',
      glow: 'bg-amber-400/20',
    },
  },
  pink: {
    emoji: '🌸',
    label: { en: 'Cherry Blossom', si: 'චෙරි මල්' },
    desc: { en: 'Pastel pink, falling sakura', si: 'පැස්ටල් රෝස, වැටෙන සකුරා' },
    pickerClass: 'border-pink-500/80 shadow-pink-500/5 bg-pink-500/5',
    swatchClass: 'bg-gradient-to-r from-pink-200 to-pink-500',
    bgClass: 'bg-gradient-to-tr from-[#ffeef2] via-[#fff5f6] to-[#fffbfd] text-neutral-800',
    fontClass: 'font-["Quicksand",sans-serif]',
    headerFont: 'font-["Pacifico",cursive]',
    cardClass: `${GLASS_CARD} bg-white/80 border-pink-200 shadow-[0_8px_32px_0_rgba(244,114,182,0.1)]`,
    textColor: 'text-pink-500',
    nameClass: 'text-neutral-800',
    wishesFont: 'font-["Quicksand",sans-serif] font-medium text-neutral-700',
    btnClass: 'bg-pink-500 text-white hover:bg-pink-600',
    secondaryBtnClass: 'bg-neutral-800 text-white',
    badgeClass: 'bg-pink-500/10 border border-pink-500/30 text-pink-500',
    dividerClass: 'bg-gradient-to-r from-transparent via-pink-400/60 to-transparent',
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Petals falling */}
        <div className="theme-petal w-4 h-3 top-0 left-[10%]" style={{ animationDelay: '0s', animationDuration: '7s' }} />
        <div className="theme-petal w-3 h-2 top-0 left-[40%]" style={{ animationDelay: '2s', animationDuration: '9s' }} />
        <div className="theme-petal w-5 h-4 top-0 left-[75%]" style={{ animationDelay: '4s', animationDuration: '6s' }} />
        <div className="theme-petal w-4 h-3 top-0 left-[90%]" style={{ animationDelay: '1s', animationDuration: '10s' }} />
      </div>
    ),
    box: {
      boxBg: 'bg-gradient-to-tr from-rose-500 via-pink-400 to-pink-300',
      lidBg: 'bg-pink-400 border-b border-rose-300/30',
      ribbonBg: 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500',
      bowBg: 'bg-yellow-400',
      shadow: 'shadow-pink-500/20',
      textColor: 'text-pink-500 font-sans',
      glow: 'bg-pink-300/30',
    },
  },
  neon: {
    emoji: '🕹️',
    label: { en: 'Retro Neon', si: 'රෙට්රෝ නියෝන්' },
    desc: { en: 'Cyberpunk grids, neon glows', si: 'සයිබර්පන්ක් ජාලක, නියෝන් දිලිසුම්' },
    pickerClass: 'border-fuchsia-500/80 shadow-fuchsia-500/5 bg-fuchsia-500/5',
    swatchClass: 'bg-gradient-to-r from-cyan-400 to-fuchsia-500',
    bgClass: 'bg-[#060010] text-[#00f0ff]',
    fontClass: 'font-["Fira_Code",monospace]',
    headerFont: 'font-["Orbitron",sans-serif]',
    cardClass: `${GLASS_CARD} bg-black/70 border-cyan-500/30 shadow-[0_0_15px_rgba(247,21,133,0.2)]`,
    textColor: 'text-fuchsia-500',
    nameClass: DARK_NAME,
    wishesFont: 'font-["Fira_Code",monospace] text-[#00f0ff]',
    btnClass: 'bg-[#ff007f] text-white hover:bg-fuchsia-600',
    secondaryBtnClass: DARK_SECONDARY_BTN,
    badgeClass: 'bg-fuchsia-500/10 border border-fuchsia-500/40 text-fuchsia-400',
    dividerClass: 'bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent',
    bgEffect: <div className="absolute inset-0 pointer-events-none overflow-hidden theme-neon-grid" />,
    box: {
      boxBg: 'bg-gradient-to-tr from-violet-950 via-purple-900 to-fuchsia-950 border border-fuchsia-500/50',
      lidBg: 'bg-purple-900 border-b border-cyan-400/50',
      ribbonBg: 'bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 animate-pulse',
      bowBg: 'bg-cyan-400',
      shadow: 'shadow-fuchsia-500/30 shadow-[0_0_20px_rgba(247,37,133,0.3)]',
      textColor: 'text-cyan-400 font-mono tracking-wider',
      glow: 'bg-fuchsia-500/20',
    },
  },
  space: {
    emoji: '🌌',
    label: { en: 'Nebula Voyage', si: 'නෙබියුලා චාරිකාව' },
    desc: { en: 'Cosmic stars, nebulae', si: 'විශ්ව තරු, නෙබියුලාවන්' },
    pickerClass: 'border-indigo-400/80 shadow-indigo-400/5 bg-indigo-400/5',
    swatchClass: 'bg-gradient-to-r from-indigo-950 to-indigo-400',
    bgClass: 'bg-gradient-to-b from-[#020512] via-[#050b24] to-[#010207] text-[#e0e7ff]',
    fontClass: 'font-["Outfit",sans-serif]',
    headerFont: 'font-["Space_Grotesk",sans-serif]',
    cardClass: `${GLASS_CARD} bg-indigo-950/20 border-indigo-500/20 shadow-[0_8px_32px_0_rgba(99,102,241,0.08)]`,
    textColor: 'text-indigo-400',
    nameClass: DARK_NAME,
    wishesFont: 'font-["Outfit",sans-serif] text-indigo-100 font-light leading-relaxed',
    btnClass: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondaryBtnClass: DARK_SECONDARY_BTN,
    badgeClass: 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400',
    dividerClass: 'bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent',
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Starry universe dots */}
        <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-white rounded-full opacity-60" />
        <div className="absolute top-[45%] left-[85%] w-1.5 h-1.5 bg-blue-300 rounded-full opacity-80 animate-pulse" />
        <div className="absolute top-[80%] left-[60%] w-0.5 h-0.5 bg-white rounded-full opacity-40" />
        <div className="absolute top-[15%] left-[65%] w-2 h-2 bg-indigo-400 rounded-full blur-[1px] opacity-50 animate-pulse" style={{ animationDuration: '3s' }} />
        {/* Glowing nebula */}
        <div className="absolute left-[30%] top-[40%] w-72 h-72 rounded-full bg-indigo-500/5 blur-[80px]" />
        <div className="absolute right-[20%] top-[10%] w-60 h-60 rounded-full bg-purple-500/5 blur-[90px]" />
      </div>
    ),
    box: {
      boxBg: 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-950 border border-blue-500/30',
      lidBg: 'bg-indigo-950 border-b border-purple-500/30',
      ribbonBg: 'bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500',
      bowBg: 'bg-purple-500',
      shadow: 'shadow-blue-500/20',
      textColor: 'text-blue-300 font-sans tracking-wide',
      glow: 'bg-purple-500/15',
    },
  },
  sunset: {
    emoji: '🌇',
    label: { en: 'Sunset Glow', si: 'ඉර බැස යන රන්වන් පැහැය' },
    desc: { en: 'Warm gradients, sunset dust', si: 'උණුසුම් වර්ණ සංයෝජන, සන්සෙට් ඩස්ට්' },
    pickerClass: 'border-orange-500/80 shadow-orange-500/5 bg-orange-500/5',
    swatchClass: 'bg-gradient-to-r from-red-900 to-orange-400',
    bgClass: 'bg-gradient-to-br from-[#1c0a00] via-[#120500] to-[#050100] text-[#ffeedd]',
    fontClass: 'font-["Outfit",sans-serif]',
    headerFont: 'font-["Playfair_Display",serif] font-bold',
    cardClass: `${GLASS_CARD} bg-white/[0.02] border-orange-500/20 shadow-[0_8px_32px_0_rgba(249,115,22,0.08)]`,
    textColor: 'text-orange-500',
    nameClass: DARK_NAME,
    wishesFont: 'font-["Playfair_Display",serif] italic text-neutral-300 leading-relaxed',
    btnClass: 'bg-orange-500 text-neutral-950 hover:bg-orange-600',
    secondaryBtnClass: DARK_SECONDARY_BTN,
    badgeClass: 'bg-orange-500/10 border border-orange-500/30 text-orange-500',
    dividerClass: 'bg-gradient-to-r from-transparent via-orange-500/50 to-transparent',
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[80%] left-[20%] w-2 h-2 bg-orange-500 rounded-full blur-[1px] opacity-40 animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute top-[40%] left-[70%] w-1.5 h-1.5 bg-amber-500 rounded-full blur-[1px] opacity-50 animate-pulse" style={{ animationDuration: '4.5s' }} />
        <div className="absolute top-[20%] left-[30%] w-1 h-1 bg-red-400 rounded-full opacity-60 animate-pulse" style={{ animationDuration: '2.5s' }} />
        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-orange-950/10 to-transparent blur-[60px]" />
      </div>
    ),
    box: {
      boxBg: 'bg-gradient-to-tr from-amber-950 via-orange-800 to-orange-600',
      lidBg: 'bg-orange-900 border-b border-orange-500/20',
      ribbonBg: 'bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500',
      bowBg: 'bg-amber-400',
      shadow: 'shadow-orange-500/20',
      textColor: 'text-orange-400 font-sans tracking-wide',
      glow: 'bg-orange-400/20',
    },
  },
  forest: {
    emoji: '🌲',
    label: { en: 'Mystic Forest', si: 'ගුප්ත වනාන්තරය' },
    desc: { en: 'Deep greens, natural fireflies', si: 'ගැඹුරු කොළ, ස්වභාවික කදෝකිමියන්' },
    pickerClass: 'border-emerald-500/80 shadow-emerald-500/5 bg-emerald-500/5',
    swatchClass: 'bg-gradient-to-r from-emerald-950 to-emerald-400',
    bgClass: 'bg-gradient-to-tr from-[#020d06] via-[#04140b] to-[#010603] text-[#e2f0e5]',
    fontClass: 'font-["Quicksand",sans-serif]',
    headerFont: 'font-["Playfair_Display",serif]',
    cardClass: `${GLASS_CARD} bg-emerald-950/10 border-emerald-500/20 shadow-[0_8px_32px_0_rgba(16,185,129,0.08)]`,
    textColor: 'text-emerald-400',
    nameClass: DARK_NAME,
    wishesFont: 'font-["Quicksand",sans-serif] font-medium text-emerald-100/90 leading-relaxed',
    btnClass: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondaryBtnClass: DARK_SECONDARY_BTN,
    badgeClass: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
    dividerClass: 'bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent',
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[50%] left-[35%] w-2 h-2 bg-emerald-400 rounded-full blur-[2px] opacity-60 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-[20%] left-[80%] w-1.5 h-1.5 bg-green-300 rounded-full blur-[1px] opacity-50 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-[70%] left-[10%] w-2.5 h-2.5 bg-emerald-500 rounded-full blur-[2px] opacity-45 animate-pulse" style={{ animationDuration: '5s' }} />
      </div>
    ),
    box: {
      boxBg: 'bg-gradient-to-tr from-emerald-950 via-emerald-800 to-green-700',
      lidBg: 'bg-emerald-900 border-b border-emerald-500/20',
      ribbonBg: 'bg-gradient-to-r from-yellow-100 via-emerald-300 to-green-500',
      bowBg: 'bg-emerald-400',
      shadow: 'shadow-emerald-500/20',
      textColor: 'text-emerald-400 font-sans tracking-wide',
      glow: 'bg-emerald-400/20',
    },
  },
  violet: {
    emoji: '🔮',
    label: { en: 'Amethyst Cyber', si: 'ඇමතීස්ට් සයිබර්' },
    desc: { en: 'Futuristic purples, cyber glow', si: 'අනාගතවාදී දම් පැහැය, සයිබර් දිලිසුම' },
    pickerClass: 'border-purple-500/80 shadow-purple-500/5 bg-purple-500/5',
    swatchClass: 'bg-gradient-to-r from-purple-950 to-purple-400',
    bgClass: 'bg-gradient-to-tr from-[#0b0214] via-[#06010d] to-[#020005] text-[#f5f0fa]',
    fontClass: 'font-["Outfit",sans-serif]',
    headerFont: 'font-["Orbitron",sans-serif]',
    cardClass: `${GLASS_CARD} bg-purple-950/15 border-purple-500/20 shadow-[0_8px_32px_0_rgba(168,85,247,0.1)]`,
    textColor: 'text-purple-400',
    nameClass: DARK_NAME,
    wishesFont: 'font-["Outfit",sans-serif] text-purple-100/95 font-light leading-relaxed',
    btnClass: 'bg-purple-600 text-white hover:bg-purple-700',
    secondaryBtnClass: DARK_SECONDARY_BTN,
    badgeClass: 'bg-purple-500/10 border border-purple-500/30 text-purple-400',
    dividerClass: 'bg-gradient-to-r from-transparent via-purple-400/50 to-transparent',
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[25%] w-0.5 h-0.5 bg-purple-300 rounded-full opacity-60" />
        <div className="absolute top-[65%] left-[75%] w-1.5 h-1.5 bg-fuchsia-400 rounded-full opacity-80 animate-pulse" style={{ animationDuration: '3.5s' }} />
        <div className="absolute top-[35%] left-[5%] w-64 h-64 rounded-full bg-purple-600/5 blur-[80px]" />
        <div className="absolute top-[75%] left-[45%] w-52 h-52 rounded-full bg-fuchsia-600/5 blur-[75px]" />
      </div>
    ),
    box: {
      boxBg: 'bg-gradient-to-tr from-violet-950 via-purple-900 to-fuchsia-900',
      lidBg: 'bg-purple-900 border-b border-fuchsia-500/20',
      ribbonBg: 'bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500',
      bowBg: 'bg-fuchsia-400',
      shadow: 'shadow-purple-500/25',
      textColor: 'text-purple-400 font-sans tracking-wider',
      glow: 'bg-purple-400/20',
    },
  },
  ocean: {
    emoji: '🌊',
    label: { en: 'Abyss Blue', si: 'අගාධ නිල්' },
    desc: { en: 'Azure waves, water ripples', si: 'නිල් රළ, ජල රැළි' },
    pickerClass: 'border-sky-500/80 shadow-sky-500/5 bg-sky-500/5',
    swatchClass: 'bg-gradient-to-r from-blue-950 to-sky-400',
    bgClass: 'bg-gradient-to-b from-[#010817] via-[#031533] to-[#00050f] text-[#e0f2fe]',
    fontClass: 'font-["Quicksand",sans-serif]',
    headerFont: 'font-["Pacifico",cursive]',
    cardClass: `${GLASS_CARD} bg-sky-950/10 border-sky-500/20 shadow-[0_8px_32px_0_rgba(14,165,233,0.08)]`,
    textColor: 'text-sky-400',
    nameClass: DARK_NAME,
    wishesFont: 'font-["Quicksand",sans-serif] text-sky-100 font-medium leading-relaxed',
    btnClass: 'bg-sky-500 text-white hover:bg-sky-600',
    secondaryBtnClass: DARK_SECONDARY_BTN,
    badgeClass: 'bg-sky-500/10 border border-sky-500/30 text-sky-400',
    dividerClass: 'bg-gradient-to-r from-transparent via-sky-400/50 to-transparent',
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="theme-ocean-glow absolute left-[10%] top-[-10%] w-80 h-80 rounded-full bg-sky-500/5 blur-[90px]" />
        <div className="absolute bottom-[20%] left-[75%] w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-60 animate-pulse" />
        <div className="absolute bottom-[50%] left-[20%] w-1 h-1 bg-sky-400 rounded-full opacity-40 animate-pulse" />
      </div>
    ),
    box: {
      boxBg: 'bg-gradient-to-tr from-blue-950 via-sky-800 to-sky-600',
      lidBg: 'bg-sky-800 border-b border-sky-500/20',
      ribbonBg: 'bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-400',
      bowBg: 'bg-sky-400',
      shadow: 'shadow-sky-500/20',
      textColor: 'text-sky-300 font-sans tracking-wide',
      glow: 'bg-sky-400/20',
    },
  },

  // ---- New designs: each has its own card shape as well as its own colors ----

  party: {
    emoji: '🎈',
    isNew: true,
    label: { en: 'Confetti Party', si: 'සාද උත්සවය' },
    desc: { en: 'Bold colors, sticker-style card', si: 'තද වර්ණ, ස්ටිකර් මෝස්තර කාඩ්පත' },
    pickerClass: 'border-[#ff3d81]/80 shadow-[#ff3d81]/5 bg-[#ff3d81]/5',
    swatchClass: 'bg-gradient-to-r from-[#ffd23f] via-[#ff3d81] to-[#2b59ff]',
    bgClass: 'bg-[#fff1c2] text-neutral-900',
    fontClass: 'font-["Quicksand",sans-serif] font-medium',
    headerFont: 'font-["Fredoka",sans-serif]',
    cardClass: 'bg-white text-neutral-900 border-[3px] border-neutral-900 rounded-3xl shadow-[8px_8px_0_0_#171717]',
    cardDecor: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#ffd23f]" />
        <div className="absolute -bottom-5 -left-5 w-16 h-16 rotate-12 bg-[#2bd9a0]" />
      </div>
    ),
    textColor: 'text-[#ff3d81]',
    nameClass: 'text-neutral-900',
    wishesFont: 'font-["Quicksand",sans-serif] font-semibold text-neutral-800',
    btnClass: 'bg-[#2b59ff] text-white border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717] hover:bg-[#1f46d6]',
    secondaryBtnClass: 'bg-[#ffd23f] text-neutral-900 border-2 border-neutral-900 shadow-[3px_3px_0_0_#171717]',
    badgeClass: 'bg-[#ffd23f] border-2 border-neutral-900 text-neutral-900',
    dividerClass: 'bg-neutral-900',
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="theme-bob absolute top-[8%] left-[8%] w-12 h-12 rounded-full bg-[#ff3d81]/80" />
        <div className="theme-bob absolute top-[9%] right-[8%] w-10 h-10 rotate-12 bg-[#2b59ff]/80" style={{ animationDelay: '1s' }} />
        <div className="theme-bob absolute bottom-[14%] left-[12%] w-9 h-9 rotate-45 bg-[#2bd9a0]/90" style={{ animationDelay: '2s' }} />
        <div className="theme-bob absolute bottom-[10%] right-[14%] w-14 h-14 rounded-full border-[6px] border-[#ff3d81]/80" style={{ animationDelay: '0.5s' }} />
      </div>
    ),
    box: {
      boxBg: 'bg-[#ff3d81] border-[3px] border-neutral-900',
      lidBg: 'bg-[#ff5c95] border-[3px] border-neutral-900',
      ribbonBg: 'bg-[#ffd23f]',
      bowBg: 'bg-[#2b59ff]',
      shadow: 'shadow-[8px_8px_0_0_#171717]',
      textColor: 'text-neutral-900 font-sans font-bold',
      glow: 'bg-[#ff3d81]/25',
    },
  },
  scrapbook: {
    emoji: '📔',
    isNew: true,
    label: { en: 'Memory Scrapbook', si: 'මතක සටහන් පොත' },
    desc: { en: 'Kraft paper, tape, handwriting', si: 'ක්‍රාෆ්ට් කඩදාසි, ටේප්, අත් අකුරු' },
    pickerClass: 'border-[#a9794a]/80 shadow-[#a9794a]/5 bg-[#a9794a]/5',
    swatchClass: 'bg-gradient-to-r from-[#d8c09a] via-[#f7b2a6] to-[#fffdf6]',
    bgClass: 'theme-kraft bg-[#d8c09a] text-[#3b2f23]',
    fontClass: 'font-["Quicksand",sans-serif] font-medium',
    headerFont: 'font-["Caveat",cursive]',
    cardClass: 'theme-lined-paper text-[#3b2f23] rounded-sm -rotate-1 shadow-[0_14px_34px_rgba(60,40,10,0.35)]',
    cardDecor: (
      <>
        <div className="absolute -top-3 left-4 -rotate-6 w-24 h-7 bg-[#f7b2a6]/85 shadow-sm pointer-events-none" />
        <div className="absolute -bottom-2 -right-3 -rotate-[32deg] w-20 h-6 bg-[#a8d5c5]/85 shadow-sm pointer-events-none" />
      </>
    ),
    textColor: 'text-[#b5482e]',
    nameClass: 'text-[#3b2f23]',
    wishesFont: 'font-["Caveat",cursive] text-2xl! leading-snug! text-[#3b2f23]',
    btnClass: 'bg-[#b5482e] text-white hover:bg-[#99391f]',
    secondaryBtnClass: 'bg-[#3b2f23] text-[#fffdf6]',
    badgeClass: 'bg-[#f7b2a6]/40 border border-[#b5482e]/30 text-[#b5482e]',
    dividerClass: 'bg-[#3b2f23]/30',
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[7%] left-[6%] text-3xl -rotate-12 opacity-70">⭐</div>
        <div className="absolute top-[14%] right-[8%] text-3xl rotate-12 opacity-70">💌</div>
        <div className="absolute bottom-[9%] left-[9%] text-3xl rotate-6 opacity-70">🌼</div>
        <div className="absolute bottom-[12%] right-[7%] text-3xl -rotate-6 opacity-70">📷</div>
      </div>
    ),
    box: {
      boxBg: 'bg-[#a9794a]',
      lidBg: 'bg-[#b98a5a] border-b border-[#6e4c2b]/40',
      ribbonBg: 'bg-[#f7b2a6]',
      bowBg: 'bg-[#b5482e]',
      shadow: 'shadow-[#3b2f23]/30',
      textColor: 'text-[#3b2f23] font-sans font-bold',
      glow: 'bg-[#fffdf6]/40',
    },
  },
  ticket: {
    emoji: '🎟️',
    isNew: true,
    label: { en: 'Golden Ticket', si: 'රන් ප්‍රවේශ පත' },
    desc: { en: 'Vintage ticket, cut-out edges', si: 'කැපූ දාර සහිත පැරණි ප්‍රවේශ පත' },
    pickerClass: 'border-[#d4a437]/80 shadow-[#d4a437]/5 bg-[#d4a437]/5',
    swatchClass: 'bg-gradient-to-r from-[#5b0f1a] via-[#d4a437] to-[#fbe9c6]',
    bgClass: 'bg-gradient-to-b from-[#5b0f1a] to-[#2c060c] text-[#fbe9c6]',
    fontClass: 'font-["Outfit",sans-serif]',
    headerFont: 'font-["Playfair_Display",serif] font-black',
    cardClass: 'theme-ticket text-[#4a1d0e]',
    cardDecor: (
      <>
        <div className="absolute top-3 left-4 text-xs text-[#8a1c1c]/70 pointer-events-none">★</div>
        <div className="absolute top-3 right-4 text-xs text-[#8a1c1c]/70 pointer-events-none">★</div>
      </>
    ),
    textColor: 'text-[#8a1c1c]',
    nameClass: 'text-[#4a1d0e]',
    wishesFont: 'font-["Playfair_Display",serif] italic font-medium text-[#4a1d0e]',
    btnClass: 'bg-[#8a1c1c] text-[#fbe9c6] hover:bg-[#6f1515]',
    secondaryBtnClass: 'bg-[#4a1d0e] text-[#fbe9c6]',
    badgeClass: 'bg-[#8a1c1c]/10 border border-[#8a1c1c]/40 text-[#8a1c1c]',
    dividerClass: 'border-t-2 border-dashed border-[#8a1c1c]/40 h-0!',
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="theme-spotlight absolute -top-[20%] left-1/2 -translate-x-1/2 w-[140%] h-[80%] rounded-full bg-[#d4a437]/15 blur-[80px]" />
        <div className="absolute top-[12%] left-[12%] w-1.5 h-1.5 bg-[#f6d77a] rounded-full animate-pulse" />
        <div className="absolute top-[28%] right-[14%] w-2 h-2 bg-[#f6d77a] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[18%] left-[18%] w-1.5 h-1.5 bg-[#f6d77a] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    ),
    box: {
      boxBg: 'bg-gradient-to-tr from-[#8a1c1c] via-[#a82626] to-[#c23a3a]',
      lidBg: 'bg-[#8a1c1c] border-b border-[#d4a437]/50',
      ribbonBg: 'bg-gradient-to-r from-[#d4a437] via-[#f6d77a] to-[#d4a437]',
      bowBg: 'bg-[#d4a437]',
      shadow: 'shadow-[#d4a437]/20',
      textColor: 'text-[#f6d77a] font-serif',
      glow: 'bg-[#d4a437]/25',
    },
  },
  arcade: {
    emoji: '👾',
    isNew: true,
    label: { en: 'Pixel Arcade', si: 'පික්සල් ආකේඩ්' },
    desc: { en: '8-bit fonts, level-up style', si: '8-bit අකුරු, ගේම් මෝස්තරය' },
    pickerClass: 'border-[#ffe14d]/80 shadow-[#ffe14d]/5 bg-[#ffe14d]/5',
    swatchClass: 'bg-gradient-to-r from-[#15153f] via-[#ff4d6d] to-[#ffe14d]',
    bgClass: 'bg-[#0b0b2a] text-[#e8e8ff]',
    fontClass: 'font-["Fira_Code",monospace]',
    headerFont: 'font-["Press_Start_2P",monospace] text-lg! sm:text-xl! leading-relaxed! wrap-anywhere',
    cardClass: 'theme-pixel-card text-[#e8e8ff]',
    cardDecor: (
      <>
        <div className="absolute top-2.5 left-3 text-xs pointer-events-none">❤️❤️❤️</div>
        <div className="absolute top-2.5 right-3 text-xs pointer-events-none">⭐</div>
      </>
    ),
    textColor: 'text-[#ffe14d]',
    nameClass: 'text-[#7df9ff] font-["Fira_Code",monospace]',
    wishesFont: 'font-["Fira_Code",monospace] text-[#e8e8ff]',
    btnClass: 'bg-[#ff4d6d] text-white rounded-none! shadow-[0_4px_0_0_#a81e3a] hover:bg-[#ff6b86]',
    secondaryBtnClass: 'bg-[#ffe14d] text-[#15153f] rounded-none! shadow-[0_4px_0_0_#b89c1d]',
    badgeClass: 'bg-[#ff4d6d] text-white rounded-none!',
    dividerClass: 'bg-[#7df9ff]/40',
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-1.5 h-1.5 bg-white theme-blink" />
        <div className="absolute top-[22%] right-[20%] w-1.5 h-1.5 bg-[#7df9ff] theme-blink" style={{ animationDelay: '0.4s' }} />
        <div className="absolute top-[60%] left-[8%] w-1.5 h-1.5 bg-[#ffe14d] theme-blink" style={{ animationDelay: '0.8s' }} />
        <div className="absolute bottom-[14%] right-[12%] w-1.5 h-1.5 bg-white theme-blink" style={{ animationDelay: '1.2s' }} />
        <div className="absolute bottom-0 inset-x-0 h-3 theme-pixel-ground" />
      </div>
    ),
    box: {
      boxBg: 'bg-[#ff4d6d] rounded-none!',
      lidBg: 'bg-[#ff6b86] rounded-none!',
      ribbonBg: 'bg-[#ffe14d]',
      bowBg: 'bg-[#7df9ff]',
      shadow: 'shadow-[0_6px_0_0_#a81e3a]',
      textColor: 'text-[#ffe14d] font-mono',
      glow: 'bg-[#ff4d6d]/20',
    },
  },
  ceylon: {
    emoji: '🍃',
    isNew: true,
    label: { en: 'Ceylon Tea Garden', si: 'සිලෝන් තේ වතුයාය' },
    desc: { en: 'Misty green hills, letter card', si: 'මීදුම් කඳු, ලිපි කාඩ්පත' },
    pickerClass: 'border-[#2f6b3f]/80 shadow-[#2f6b3f]/5 bg-[#2f6b3f]/5',
    swatchClass: 'bg-gradient-to-r from-[#fffdf5] via-[#a9cf94] to-[#2f6b3f]',
    bgClass: 'bg-gradient-to-b from-[#f1f7e8] to-[#cfe4bf] text-[#21402a]',
    fontClass: 'font-["Quicksand",sans-serif] font-medium',
    headerFont: 'font-["Playfair_Display",serif]',
    cardClass: 'bg-[#fffdf5] text-[#21402a] border border-[#2f6b3f]/40 outline outline-[#2f6b3f]/25 -outline-offset-8 rounded-lg shadow-[0_12px_32px_rgba(33,64,42,0.18)]',
    cardDecor: (
      <>
        <div className="absolute top-3 left-3 text-lg pointer-events-none">🌿</div>
        <div className="absolute top-3 right-3 text-lg -scale-x-100 pointer-events-none">🌿</div>
      </>
    ),
    textColor: 'text-[#2f6b3f]',
    nameClass: 'text-[#21402a]',
    wishesFont: 'font-["Playfair_Display",serif] italic text-[#21402a]',
    btnClass: 'bg-[#2f6b3f] text-white hover:bg-[#25562f]',
    secondaryBtnClass: 'bg-[#c98a2b] text-white',
    badgeClass: 'bg-[#2f6b3f]/10 border border-[#2f6b3f]/30 text-[#2f6b3f]',
    dividerClass: 'bg-gradient-to-r from-transparent via-[#2f6b3f]/50 to-transparent',
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full h-[32%]" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 150 C 200 60, 400 60, 620 140 S 1000 220, 1200 110 V300 H0 Z" fill="#a9cf94" fillOpacity="0.55" />
          <path d="M0 220 C 240 130, 460 240, 700 190 S 1040 130, 1200 200 V300 H0 Z" fill="#6ea864" fillOpacity="0.55" />
          <path d="M0 270 C 300 210, 560 290, 820 250 S 1100 230, 1200 265 V300 H0 Z" fill="#2f6b3f" fillOpacity="0.5" />
        </svg>
      </div>
    ),
    box: {
      boxBg: 'bg-gradient-to-tr from-[#25562f] via-[#2f6b3f] to-[#4d8a57]',
      lidBg: 'bg-[#2f6b3f] border-b border-[#c98a2b]/40',
      ribbonBg: 'bg-gradient-to-r from-[#c98a2b] via-[#e3b363] to-[#c98a2b]',
      bowBg: 'bg-[#c98a2b]',
      shadow: 'shadow-[#2f6b3f]/30',
      textColor: 'text-[#2f6b3f] font-serif font-bold',
      glow: 'bg-[#6ea864]/30',
    },
  },
  aurora: {
    emoji: '🌠',
    isNew: true,
    label: { en: 'Northern Aurora', si: 'උතුරු ආලෝකය' },
    desc: { en: 'Flowing light, frosted glass', si: 'ගලා යන ආලෝකය, මීදුම් වීදුරු' },
    pickerClass: 'border-teal-400/80 shadow-teal-400/5 bg-teal-400/5',
    swatchClass: 'bg-gradient-to-r from-emerald-300 via-cyan-400 to-violet-500',
    bgClass: 'bg-[#050a18] text-[#e6f6f5]',
    fontClass: 'font-["Outfit",sans-serif]',
    headerFont: 'font-["Space_Grotesk",sans-serif]',
    cardClass: 'bg-slate-950/55 border border-white/15 rounded-3xl backdrop-blur-xl shadow-[0_0_60px_rgba(45,212,191,0.18)]',
    textColor: 'bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent',
    nameClass: DARK_NAME,
    wishesFont: 'font-["Outfit",sans-serif] font-light text-teal-50',
    btnClass: 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 hover:from-emerald-300 hover:to-cyan-300',
    secondaryBtnClass: 'bg-white/10 border border-white/20 text-white',
    badgeClass: 'bg-teal-400/10 border border-teal-300/30 text-teal-300',
    dividerClass: 'bg-gradient-to-r from-transparent via-teal-300/50 to-transparent',
    bgEffect: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="theme-aurora absolute -top-[15%] -left-[10%] w-[70%] h-[55%] rounded-full bg-emerald-400/25 blur-[70px]" />
        <div className="theme-aurora absolute top-[5%] right-[-15%] w-[65%] h-[50%] rounded-full bg-violet-500/25 blur-[80px]" style={{ animationDelay: '-4s' }} />
        <div className="theme-aurora absolute top-[35%] left-[20%] w-[55%] h-[35%] rounded-full bg-cyan-400/15 blur-[70px]" style={{ animationDelay: '-8s' }} />
      </div>
    ),
    box: {
      boxBg: 'bg-gradient-to-tr from-slate-900 via-teal-900 to-violet-900 border border-teal-300/30',
      lidBg: 'bg-teal-950 border-b border-teal-300/30',
      ribbonBg: 'bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-400',
      bowBg: 'bg-cyan-300',
      shadow: 'shadow-teal-400/20',
      textColor: 'text-teal-200 font-sans tracking-wide',
      glow: 'bg-teal-400/25',
    },
  },
};

export type CardMode = 'dark' | 'light';

type ThemeVariant = Partial<Omit<ThemeDefinition, 'box'>> & { boxText: string };

const glassCard = (classes: string) => `${GLASS_CARD} ${classes}`;

/**
 * Each theme has a native look, plus one alternate so the sender can choose dark or light.
 * Cards saved before this choice existed have no mode and keep their native look.
 */
const THEME_MODES: Record<ThemeId, { native: CardMode; alternate: ThemeVariant }> = {
  gold: {
    native: 'dark',
    alternate: {
      bgClass: 'bg-gradient-to-b from-[#fffaf0] to-[#f6e7c8] text-neutral-800',
      cardClass: glassCard('bg-white/85 border-amber-300 shadow-[0_8px_32px_0_rgba(180,130,20,0.15)]'),
      textColor: 'text-amber-700',
      nameClass: 'text-neutral-800',
      wishesFont: 'font-["Playfair_Display",serif] italic text-neutral-700',
      secondaryBtnClass: 'bg-neutral-800 text-white',
      badgeClass: 'bg-amber-500/15 border border-amber-600/30 text-amber-700',
      boxText: 'text-amber-700 font-serif font-semibold',
    },
  },
  pink: {
    native: 'light',
    alternate: {
      bgClass: 'bg-gradient-to-tr from-[#2a0a18] via-[#1c0712] to-[#12040c] text-pink-50',
      cardClass: glassCard('bg-white/5 border-pink-400/25 shadow-[0_8px_32px_0_rgba(244,114,182,0.12)]'),
      textColor: 'text-pink-400',
      nameClass: DARK_NAME,
      wishesFont: 'font-["Quicksand",sans-serif] font-medium text-pink-50',
      secondaryBtnClass: DARK_SECONDARY_BTN,
      boxText: 'text-pink-300 font-sans',
    },
  },
  neon: {
    native: 'dark',
    alternate: {
      bgClass: 'bg-[#f5f3ff] text-[#3b0764]',
      cardClass: glassCard('bg-white/85 border-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.2)]'),
      textColor: 'text-fuchsia-600',
      nameClass: 'text-[#3b0764]',
      wishesFont: 'font-["Fira_Code",monospace] text-[#3b0764]',
      secondaryBtnClass: 'bg-[#3b0764] text-white',
      badgeClass: 'bg-fuchsia-500/10 border border-fuchsia-500/40 text-fuchsia-600',
      boxText: 'text-fuchsia-700 font-mono font-semibold tracking-wider',
    },
  },
  space: {
    native: 'dark',
    alternate: {
      bgClass: 'bg-gradient-to-b from-[#eef2ff] to-[#dbe3ff] text-indigo-950',
      cardClass: glassCard('bg-white/80 border-indigo-200 shadow-[0_8px_32px_0_rgba(99,102,241,0.15)]'),
      textColor: 'text-indigo-600',
      nameClass: 'text-indigo-950',
      wishesFont: 'font-["Outfit",sans-serif] text-indigo-950 leading-relaxed',
      secondaryBtnClass: 'bg-indigo-950 text-white',
      badgeClass: 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-600',
      boxText: 'text-indigo-700 font-sans font-semibold tracking-wide',
    },
  },
  sunset: {
    native: 'dark',
    alternate: {
      bgClass: 'bg-gradient-to-br from-[#fff1e6] via-[#ffe3cf] to-[#ffd3b0] text-[#5b2a0e]',
      cardClass: glassCard('bg-white/80 border-orange-200 shadow-[0_8px_32px_0_rgba(249,115,22,0.15)]'),
      textColor: 'text-orange-600',
      nameClass: 'text-[#5b2a0e]',
      wishesFont: 'font-["Playfair_Display",serif] italic text-[#5b2a0e] leading-relaxed',
      secondaryBtnClass: 'bg-[#5b2a0e] text-white',
      badgeClass: 'bg-orange-500/10 border border-orange-500/30 text-orange-600',
      boxText: 'text-orange-700 font-sans font-semibold tracking-wide',
    },
  },
  forest: {
    native: 'dark',
    alternate: {
      bgClass: 'bg-gradient-to-tr from-[#effaf2] via-[#e2f5e8] to-[#d0eedb] text-emerald-950',
      cardClass: glassCard('bg-white/80 border-emerald-200 shadow-[0_8px_32px_0_rgba(16,185,129,0.15)]'),
      textColor: 'text-emerald-700',
      nameClass: 'text-emerald-950',
      wishesFont: 'font-["Quicksand",sans-serif] font-medium text-emerald-950 leading-relaxed',
      secondaryBtnClass: 'bg-emerald-950 text-white',
      badgeClass: 'bg-emerald-500/10 border border-emerald-600/30 text-emerald-700',
      boxText: 'text-emerald-700 font-sans font-semibold tracking-wide',
    },
  },
  violet: {
    native: 'dark',
    alternate: {
      bgClass: 'bg-gradient-to-tr from-[#faf5ff] via-[#f3eafd] to-[#e9dcfb] text-purple-950',
      cardClass: glassCard('bg-white/80 border-purple-200 shadow-[0_8px_32px_0_rgba(168,85,247,0.15)]'),
      textColor: 'text-purple-600',
      nameClass: 'text-purple-950',
      wishesFont: 'font-["Outfit",sans-serif] text-purple-950 leading-relaxed',
      secondaryBtnClass: 'bg-purple-950 text-white',
      badgeClass: 'bg-purple-500/10 border border-purple-500/30 text-purple-600',
      boxText: 'text-purple-700 font-sans font-semibold tracking-wider',
    },
  },
  ocean: {
    native: 'dark',
    alternate: {
      bgClass: 'bg-gradient-to-b from-[#effaff] via-[#e0f4fe] to-[#c9e9fb] text-sky-950',
      cardClass: glassCard('bg-white/80 border-sky-200 shadow-[0_8px_32px_0_rgba(14,165,233,0.15)]'),
      textColor: 'text-sky-600',
      nameClass: 'text-sky-950',
      wishesFont: 'font-["Quicksand",sans-serif] text-sky-950 font-medium leading-relaxed',
      btnClass: 'bg-sky-600 text-white hover:bg-sky-700',
      secondaryBtnClass: 'bg-sky-950 text-white',
      badgeClass: 'bg-sky-500/10 border border-sky-500/30 text-sky-600',
      boxText: 'text-sky-700 font-sans font-semibold tracking-wide',
    },
  },
  party: {
    native: 'light',
    alternate: {
      bgClass: 'bg-[#17132b] text-white',
      cardClass: 'bg-[#241d45] text-white border-[3px] border-white rounded-3xl shadow-[8px_8px_0_0_#ff3d81]',
      textColor: 'text-[#ffd23f]',
      nameClass: DARK_NAME,
      wishesFont: 'font-["Quicksand",sans-serif] font-semibold text-white/90',
      btnClass: 'bg-[#2b59ff] text-white border-2 border-white shadow-[3px_3px_0_0_#ff3d81] hover:bg-[#1f46d6]',
      secondaryBtnClass: 'bg-[#ffd23f] text-neutral-900 border-2 border-white shadow-[3px_3px_0_0_#ff3d81]',
      dividerClass: 'bg-white/70',
      boxText: 'text-white font-sans font-bold',
    },
  },
  scrapbook: {
    native: 'light',
    alternate: {
      bgClass: 'theme-kraft bg-[#2b2118] text-[#f4e9d8]',
      cardClass: 'theme-lined-paper-dark text-[#f4e9d8] rounded-sm -rotate-1 shadow-[0_14px_34px_rgba(0,0,0,0.5)]',
      textColor: 'text-[#f7b2a6]',
      nameClass: 'text-[#f4e9d8]',
      wishesFont: 'font-["Caveat",cursive] text-2xl! leading-snug! text-[#f4e9d8]',
      secondaryBtnClass: 'bg-[#f4e9d8] text-[#2b2118]',
      dividerClass: 'bg-[#f4e9d8]/30',
      badgeClass: 'bg-[#f7b2a6]/20 border border-[#f7b2a6]/40 text-[#f7b2a6]',
      boxText: 'text-[#f4e9d8] font-sans font-bold',
    },
  },
  ticket: {
    native: 'dark',
    alternate: {
      bgClass: 'bg-gradient-to-b from-[#fdf3dc] to-[#f1dcae] text-[#4a1d0e]',
      boxText: 'text-[#8a1c1c] font-serif font-semibold',
    },
  },
  arcade: {
    native: 'dark',
    alternate: {
      bgClass: 'bg-[#e8f4ff] text-[#15153f]',
      cardClass: 'theme-pixel-card-light text-[#15153f]',
      textColor: 'text-[#d6264a]',
      nameClass: 'text-[#15153f] font-["Fira_Code",monospace]',
      wishesFont: 'font-["Fira_Code",monospace] text-[#15153f]',
      dividerClass: 'bg-[#15153f]/40',
      secondaryBtnClass: 'bg-[#15153f] text-[#ffe14d] rounded-none! shadow-[0_4px_0_0_#7a7a9e]',
      boxText: 'text-[#d6264a] font-mono font-semibold',
    },
  },
  ceylon: {
    native: 'light',
    alternate: {
      bgClass: 'bg-gradient-to-b from-[#0e2417] to-[#06140c] text-[#e6f2df]',
      cardClass: 'bg-[#12301e] text-[#e6f2df] border border-[#a9cf94]/40 outline outline-[#a9cf94]/25 -outline-offset-8 rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.45)]',
      textColor: 'text-[#a9cf94]',
      nameClass: 'text-[#f1f7e8]',
      wishesFont: 'font-["Playfair_Display",serif] italic text-[#e6f2df]',
      btnClass: 'bg-[#a9cf94] text-[#0e2417] hover:bg-[#bcdca9]',
      badgeClass: 'bg-[#a9cf94]/15 border border-[#a9cf94]/40 text-[#a9cf94]',
      dividerClass: 'bg-gradient-to-r from-transparent via-[#a9cf94]/50 to-transparent',
      boxText: 'text-[#a9cf94] font-serif font-bold',
    },
  },
  aurora: {
    native: 'dark',
    alternate: {
      bgClass: 'bg-[#f2fbfa] text-slate-800',
      cardClass: 'bg-white/65 border border-white rounded-3xl backdrop-blur-xl shadow-[0_0_60px_rgba(45,212,191,0.25)]',
      textColor: 'bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent',
      nameClass: 'text-slate-900',
      wishesFont: 'font-["Outfit",sans-serif] text-slate-700',
      secondaryBtnClass: 'bg-slate-900 text-white',
      badgeClass: 'bg-teal-500/10 border border-teal-600/30 text-teal-700',
      dividerClass: 'bg-gradient-to-r from-transparent via-teal-600/50 to-transparent',
      boxText: 'text-teal-700 font-sans font-semibold tracking-wide',
    },
  },
};

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value);
}

/** The look a theme was designed with: what cards without a saved mode show. */
export function getNativeMode(id: unknown): CardMode {
  return THEME_MODES[isThemeId(id) ? id : 'gold'].native;
}

/**
 * Looks up a theme in the requested mode. An unknown id from an old link falls back to
 * Midnight Gold, and a card with no mode keeps the theme's native look.
 */
export function getTheme(id: unknown, mode?: CardMode | null): ThemeDefinition {
  const themeId: ThemeId = isThemeId(id) ? id : 'gold';
  const base = THEMES[themeId];
  const { native, alternate } = THEME_MODES[themeId];
  if (!mode || mode === native) return base;
  const { boxText, ...overrides } = alternate;
  return { ...base, ...overrides, box: { ...base.box, textColor: boxText } };
}
