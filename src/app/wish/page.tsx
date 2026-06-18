'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { decodeConfig, DEFAULT_CONFIG, CardConfig } from '@/utils/encoder';
import GiftBox from '@/components/wishes/GiftBox';
import CakeCandles from '@/components/wishes/CakeCandles';
import BalloonPop from '@/components/wishes/BalloonPop';
import ConfettiEffect from '@/components/wishes/ConfettiEffect';
import AudioPlayer from '@/components/wishes/AudioPlayer';

interface CardWishState extends CardConfig {
  images?: string[];
}

const TRANSLATIONS = {
  en: {
    loading: "Unpacking birthday wishes...",
    unableToLoad: "Unable to Load Card",
    createYourOwn: "Create Your Own Card",
    hello: "Hello, ",
    happyBirthdayTo: "Happy Birthday, ",
    gestureDesc: "A little sweet gesture for you! Make a wish and blow out the candles.",
    happyBirthday: "Happy Birthday!",
    age: "Age",
    clickPhoto: "Click photo to slide",
    blowAgain: "Blow Candles Again",
  },
  si: {
    loading: "උපන් දින සුභපැතුම් සකසමින් පවතී...",
    unableToLoad: "කාඩ්පත පූරණය කිරීමට නොහැකි විය",
    createYourOwn: "ඔබේම සුභපැතුම් පතක් සාදන්න",
    hello: "ආයුබෝවන්, ",
    happyBirthdayTo: "සුභ උපන්දිනයක්, ",
    gestureDesc: "ඔබ වෙනුවෙන් කුඩා මිහිරි සුභපැතුමක්! ප්‍රාර්ථනාවක් කර ඉටිපන්දම් පිඹ නිවා දමන්න.",
    happyBirthday: "සුභ උපන්දිනයක්!",
    age: "වයස",
    clickPhoto: "ඊළඟ පින්තූරය සඳහා ක්ලික් කරන්න",
    blowAgain: "නැවත ඉටිපන්දම් පිඹින්න",
  }
};

// A client component that extracts and decodes search params, wrapped in Suspense
function WishContent() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<CardWishState>(DEFAULT_CONFIG);
  const [phase, setPhase] = useState<'box' | 'cake' | 'letter'>('box');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [balloonsActive, setBalloonsActive] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'si'>('en');

  // Sync language selection
  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam === 'si' || langParam === 'en') {
      setTimeout(() => {
        setLang(langParam);
      }, 0);
    } else {
      const savedLang = localStorage.getItem('studio-lang');
      if (savedLang === 'si' || savedLang === 'en') {
        setTimeout(() => {
          setLang(savedLang as 'si' | 'en');
        }, 0);
      }
    }
  }, [searchParams]);

  const toggleLanguage = () => {
    setLang(prev => {
      const next = prev === 'en' ? 'si' : 'en';
      localStorage.setItem('studio-lang', next);
      return next;
    });
  };

  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key];
  };
  
  // Custom font loading dynamically via standard links or classes
  useEffect(() => {
    // Inject the Google Font links to HTML head
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Pacifico&family=Orbitron:wght@400..900&family=Space+Grotesk:wght@300..700&family=Outfit:wght@300..900&family=Quicksand:wght@300..700&family=Fira+Code:wght@300..700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Decode card config from URL or load from Database
  useEffect(() => {
    const cardParam = searchParams.get('card');
    const idParam = searchParams.get('id');
    let timer: NodeJS.Timeout;

    if (idParam) {
      setTimeout(() => setLoading(true), 0);
      fetch(`/api/card?id=${idParam}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.card) {
            const card = data.card;
            const mappedConfig: CardWishState = {
              name: card.name,
              age: card.age?.toString() || '',
              wishes: card.wishes,
              theme: card.theme as CardConfig['theme'],
              music: card.music as CardConfig['music'],
              effects: card.effects as CardConfig['effects'],
              imageUrl: card.images[0] || '', // fallback
              images: card.images,
            };
            timer = setTimeout(() => {
              setConfig(mappedConfig);
              setLoading(false);
            }, 0);
          } else {
            timer = setTimeout(() => {
              setError(data.error || 'This birthday card could not be found. It may have been deleted or the link is invalid.');
              setLoading(false);
            }, 0);
          }
        })
        .catch(() => {
          timer = setTimeout(() => {
            setError('An error occurred while loading this birthday card.');
            setLoading(false);
          }, 0);
        });
    } else if (cardParam) {
      const decoded = decodeConfig(cardParam);
      if (decoded) {
        timer = setTimeout(() => {
          setConfig(decoded);
          setLoading(false);
        }, 0);
      } else {
        timer = setTimeout(() => {
          setError('The link contains invalid configuration data.');
          setLoading(false);
        }, 0);
      }
    } else {
      // Load default config
      timer = setTimeout(() => {
        setLoading(false);
      }, 0);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchParams]);

  const handleOpenBox = () => {
    setPhase('cake');
    if (config.music !== 'none') {
      setIsMusicPlaying(true);
    }
    if (config.effects.includes('balloons')) {
      setBalloonsActive(true);
    }
  };

  const handleBlowOutCandles = () => {
    setPhase('letter');
    if (config.effects.includes('confetti')) {
      setConfettiActive(true);
    }
  };

  // Helper to get theme-specific styles
  const getThemeStyles = () => {
    switch (config.theme) {
      case 'gold':
        return {
          bgClass: 'bg-[#0f0f11] text-[#e5e5e7]',
          fontClass: 'font-["Outfit",sans-serif]',
          headerFont: 'font-["Playfair_Display",serif]',
          glassClass: 'bg-white/[0.03] border-amber-500/10 shadow-[0_8px_32px_0_rgba(212,175,55,0.08)]',
          textColor: 'text-amber-400',
          accentBorder: 'border-amber-500/20',
          wishesFont: 'font-["Playfair_Display",serif] italic text-neutral-200',
          bgEffect: (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Twinkling gold stars */}
              <div className="absolute top-[10%] left-[20%] w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
              <div className="absolute top-[30%] left-[80%] w-1 h-1 bg-yellow-200 rounded-full animate-pulse" style={{ animationDuration: '3.5s' }} />
              <div className="absolute top-[75%] left-[15%] w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDuration: '2.5s' }} />
              <div className="absolute top-[60%] left-[70%] w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
            </div>
          )
        };
      case 'pink':
        return {
          bgClass: 'bg-gradient-to-tr from-[#ffeef2] via-[#fff5f6] to-[#fffbfd] text-neutral-800',
          fontClass: 'font-["Quicksand",sans-serif]',
          headerFont: 'font-["Pacifico",cursive]',
          glassClass: 'bg-white/80 border-pink-200 shadow-[0_8px_32px_0_rgba(244,114,182,0.1)]',
          textColor: 'text-pink-500',
          accentBorder: 'border-pink-200',
          wishesFont: 'font-["Quicksand",sans-serif] font-medium text-neutral-700',
          bgEffect: (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes petalFall {
                  0% { transform: translateY(-5%) rotate(0deg) translateX(0); opacity: 0; }
                  10% { opacity: 0.8; }
                  90% { opacity: 0.8; }
                  100% { transform: translateY(105%) rotate(360deg) translateX(30px); opacity: 0; }
                }
                .petal {
                  position: absolute;
                  background-color: #ffb7c5;
                  border-radius: 150% 0 150% 150%;
                  animation: petalFall 8s infinite linear;
                  opacity: 0;
                }
              `}} />
              {/* Petals falling */}
              <div className="petal w-4 h-3 top-0 left-[10%]" style={{ animationDelay: '0s', animationDuration: '7s' }} />
              <div className="petal w-3 h-2 top-0 left-[40%]" style={{ animationDelay: '2s', animationDuration: '9s', transform: 'rotate(15deg)' }} />
              <div className="petal w-5 h-4 top-0 left-[75%]" style={{ animationDelay: '4s', animationDuration: '6s', transform: 'rotate(45deg)' }} />
              <div className="petal w-4 h-3 top-0 left-[90%]" style={{ animationDelay: '1s', animationDuration: '10s' }} />
            </div>
          )
        };
      case 'neon':
        return {
          bgClass: 'bg-[#060010] text-[#00f0ff]',
          fontClass: 'font-["Fira_Code",monospace]',
          headerFont: 'font-["Orbitron",sans-serif]',
          glassClass: 'bg-black/70 border-fuchsia-500 shadow-[0_0_15px_rgba(247,21,133,0.2)]',
          textColor: 'text-fuchsia-500',
          accentBorder: 'border-cyan-500/30',
          wishesFont: 'font-["Fira_Code",monospace] text-[#00f0ff]',
          bgEffect: (
            <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]">
              <style dangerouslySetInnerHTML={{__html: `
                .grid-bg {
                  background-size: 40px 40px;
                  background-image: linear-gradient(to right, rgba(0, 240, 255, 0.05) 1px, transparent 1px),
                                    linear-gradient(to bottom, rgba(0, 240, 255, 0.05) 1px, transparent 1px);
                  height: 100%;
                  width: 100%;
                }
              `}} />
              <div className="grid-bg opacity-40" />
            </div>
          )
        };
      case 'space':
        return {
          bgClass: 'bg-gradient-to-b from-[#020512] via-[#050b24] to-[#010207] text-[#e0e7ff]',
          fontClass: 'font-["Outfit",sans-serif]',
          headerFont: 'font-["Space_Grotesk",sans-serif]',
          glassClass: 'bg-indigo-950/20 border-indigo-500/10 shadow-[0_8px_32px_0_rgba(99,102,241,0.08)] backdrop-blur-xl',
          textColor: 'text-indigo-400',
          accentBorder: 'border-indigo-500/20',
          wishesFont: 'font-["Outfit",sans-serif] text-indigo-100 font-light leading-relaxed',
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
          )
        };
      case 'sunset':
        return {
          bgClass: 'bg-gradient-to-br from-[#1c0a00] via-[#120500] to-[#050100] text-[#ffeedd]',
          fontClass: 'font-["Outfit",sans-serif]',
          headerFont: 'font-["Playfair_Display",serif] font-bold',
          glassClass: 'bg-white/[0.02] border-orange-500/10 shadow-[0_8px_32px_0_rgba(249,115,22,0.08)] backdrop-blur-md',
          textColor: 'text-orange-500',
          accentBorder: 'border-orange-500/20',
          wishesFont: 'font-["Playfair_Display",serif] italic text-neutral-300 leading-relaxed',
          bgEffect: (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[80%] left-[20%] w-2 h-2 bg-orange-500 rounded-full blur-[1px] opacity-40 animate-pulse" style={{ animationDuration: '3s' }} />
              <div className="absolute top-[40%] left-[70%] w-1.5 h-1.5 bg-amber-500 rounded-full blur-[1px] opacity-50 animate-pulse" style={{ animationDuration: '4.5s' }} />
              <div className="absolute top-[20%] left-[30%] w-1 h-1 bg-red-400 rounded-full opacity-60 animate-pulse" style={{ animationDuration: '2.5s' }} />
              <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-orange-950/10 to-transparent blur-[60px]" />
            </div>
          )
        };
      case 'forest':
        return {
          bgClass: 'bg-gradient-to-tr from-[#020d06] via-[#04140b] to-[#010603] text-[#e2f0e5]',
          fontClass: 'font-["Quicksand",sans-serif]',
          headerFont: 'font-["Playfair_Display",serif]',
          glassClass: 'bg-emerald-950/10 border-emerald-500/10 shadow-[0_8px_32px_0_rgba(16,185,129,0.08)] backdrop-blur-md',
          textColor: 'text-emerald-400',
          accentBorder: 'border-emerald-500/20',
          wishesFont: 'font-["Quicksand",sans-serif] font-medium text-emerald-100/90 leading-relaxed',
          bgEffect: (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[50%] left-[35%] w-2 h-2 bg-emerald-400 rounded-full blur-[2px] opacity-60 animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute top-[20%] left-[80%] w-1.5 h-1.5 bg-green-300 rounded-full blur-[1px] opacity-50 animate-pulse" style={{ animationDuration: '6s' }} />
              <div className="absolute top-[70%] left-[10%] w-2.5 h-2.5 bg-emerald-500 rounded-full blur-[2px] opacity-45 animate-pulse" style={{ animationDuration: '5s' }} />
            </div>
          )
        };
      case 'violet':
        return {
          bgClass: 'bg-gradient-to-tr from-[#0b0214] via-[#06010d] to-[#020005] text-[#f5f0fa]',
          fontClass: 'font-["Outfit",sans-serif]',
          headerFont: 'font-["Orbitron",sans-serif]',
          glassClass: 'bg-purple-950/15 border-purple-500/15 shadow-[0_8px_32px_0_rgba(168,85,247,0.1)] backdrop-blur-md',
          textColor: 'text-purple-400',
          accentBorder: 'border-purple-500/20',
          wishesFont: 'font-["Outfit",sans-serif] text-purple-100/95 font-light leading-relaxed',
          bgEffect: (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[15%] left-[25%] w-0.5 h-0.5 bg-purple-300 rounded-full opacity-60" />
              <div className="absolute top-[65%] left-[75%] w-1.5 h-1.5 bg-fuchsia-400 rounded-full opacity-80 animate-pulse" style={{ animationDuration: '3.5s' }} />
              <div className="absolute top-[35%] left-[5%] w-64 h-64 rounded-full bg-purple-650/5 blur-[80px]" />
              <div className="absolute top-[75%] left-[45%] w-52 h-52 rounded-full bg-fuchsia-600/5 blur-[75px]" />
            </div>
          )
        };
      case 'ocean':
        return {
          bgClass: 'bg-gradient-to-b from-[#010817] via-[#031533] to-[#00050f] text-[#e0f2fe]',
          fontClass: 'font-["Quicksand",sans-serif]',
          headerFont: 'font-["Pacifico",cursive]',
          glassClass: 'bg-sky-950/10 border-sky-500/10 shadow-[0_8px_32px_0_rgba(14,165,233,0.08)] backdrop-blur-md',
          textColor: 'text-sky-400',
          accentBorder: 'border-sky-500/20',
          wishesFont: 'font-["Quicksand",sans-serif] text-sky-100 font-medium leading-relaxed',
          bgEffect: (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes rippleWave {
                  0% { transform: scale(1); opacity: 0.15; }
                  50% { transform: scale(1.08); opacity: 0.25; }
                  100% { transform: scale(1); opacity: 0.15; }
                }
                .ocean-glow {
                  animation: rippleWave 10s infinite ease-in-out;
                }
              `}} />
              <div className="ocean-glow absolute left-[10%] top-[-10%] w-80 h-80 rounded-full bg-sky-500/5 blur-[90px]" />
              <div className="absolute bottom-[20%] left-[75%] w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-60 animate-pulse" />
              <div className="absolute bottom-[50%] left-[20%] w-1 h-1 bg-sky-400 rounded-full opacity-40 animate-pulse" />
            </div>
          )
        };
    }
  };

  const theme = getThemeStyles();

  if (loading) {
    const queryLang = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : 'en';
    const currentLang = queryLang === 'si' ? 'si' : 'en';
    const loadingText = TRANSLATIONS[currentLang].loading;
    return (
      <div className="min-h-screen bg-[#0f0f11] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm opacity-60 tracking-wider">{loadingText}</p>
      </div>
    );
  }

  if (error) {
    const queryLang = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : 'en';
    const currentLang = queryLang === 'si' ? 'si' : 'en';
    let displayError = error;
    if (currentLang === 'si') {
      if (error.includes('could not be found')) {
        displayError = 'මෙම උපන් දින සුභපැතුම් පත සොයාගත නොහැකි විය. එය මකා දමා තිබිය හැක හෝ සබැඳිය වැරදි විය හැක.';
      } else if (error.includes('invalid configuration data')) {
        displayError = 'සබැඳියෙහි දෝෂ සහිත දත්ත අඩංගු වේ.';
      } else {
        displayError = 'කාඩ්පත පූරණය කිරීමේදී දෝෂයක් සිදු විය.';
      }
    }
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-white p-6">
        <div className="w-full max-w-md bg-[#111115] border border-white/[0.05] p-8 rounded-2xl backdrop-blur-md shadow-xl text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h1 className="text-xl font-bold mb-3 font-sans text-neutral-200">{TRANSLATIONS[currentLang].unableToLoad}</h1>
          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">{displayError}</p>
          <Link
            href="/"
            className="px-6 py-2.5 bg-amber-500 text-neutral-900 text-xs font-bold rounded-full hover:bg-amber-600 transition-all select-none"
          >
            {TRANSLATIONS[currentLang].createYourOwn}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden p-6 transition-colors duration-1000 ${theme.bgClass} ${theme.fontClass}`}>
      {/* Dynamic Background Effect */}
      {theme.bgEffect}

      {/* Floating Language Switcher Button */}
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={toggleLanguage}
          className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none text-[11px] font-bold shadow-md backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 ${
            config.theme === 'pink'
              ? 'bg-white/70 border-pink-200 text-pink-600 hover:bg-pink-50'
              : config.theme === 'gold'
              ? 'bg-neutral-900/60 border-amber-500/20 text-amber-400 hover:bg-neutral-800/80'
              : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
          }`}
        >
          {lang === 'en' ? '🇱🇰 සිංහල' : '🇬🇧 EN'}
        </button>
      </div>

      {/* Floating balloons background */}
      <BalloonPop active={balloonsActive} />

      {/* Confetti canvas animation */}
      <ConfettiEffect active={confettiActive} />

      {/* Audio synthesizer controller */}
      <AudioPlayer
        track={config.music}
        isPlaying={isMusicPlaying}
        onTogglePlay={setIsMusicPlaying}
      />

      {/* Greeting Layout Card */}
      <div className="w-full max-w-lg z-30 flex flex-col items-center">
        
        {/* Phased Rendering */}
        {phase === 'box' && (
          <div className="text-center animate-fade-in">
            <h1 className={`text-4xl md:text-5xl mb-6 font-bold leading-tight ${theme.headerFont}`}>
              {t('hello')}{config.name}!
            </h1>
            <GiftBox onOpen={handleOpenBox} theme={config.theme} />
          </div>
        )}

        {phase === 'cake' && (
          <div className="w-full text-center flex flex-col items-center">
            <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${theme.headerFont}`}>
              {t('happyBirthdayTo')}{config.name}!
            </h2>
            <p className="text-sm opacity-80 max-w-xs mb-8">
              {t('gestureDesc')}
            </p>
            
            <CakeCandles 
              age={config.age ? parseInt(config.age) : 3} 
              onBlowOut={handleBlowOutCandles} 
            />
          </div>
        )}

        {phase === 'letter' && (
          <div 
            className={`w-full border p-5 sm:p-8 md:p-10 rounded-2xl transition-all duration-1000 ease-out translate-y-0 opacity-100 backdrop-blur-md ${theme.glassClass} ${theme.accentBorder}`}
            style={{
              animation: 'slideUpOpen 1s ease-out forwards',
            }}
          >
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes slideUpOpen {
                0% { opacity: 0; transform: translateY(50px) scale(0.95); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}} />

            <div className="flex flex-col items-center text-center">
              
              {/* Star Badge */}
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center rounded-full text-amber-500 mb-6 text-xl animate-bounce">
                🎉
              </div>

              <h1 className={`text-3xl md:text-4xl font-bold mb-4 tracking-wide ${theme.textColor} ${theme.headerFont}`}>
                {t('happyBirthday')}
              </h1>
              
              <h2 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-white mb-6">
                {config.name} {config.age ? `• ${t('age')} ${config.age}` : ''}
              </h2>

              {/* Dynamic Polaroid Deck Gallery */}
              {config.images && config.images.length > 0 ? (() => {
                const images = config.images;
                return (
                  <div 
                    className="relative w-48 h-56 mb-12 flex items-center justify-center cursor-pointer select-none" 
                    onClick={() => {
                      setActiveImageIndex(prev => (prev + 1) % images.length);
                    }}
                  >
                    {images.map((imgUrl, idx) => {
                      const offset = (idx - activeImageIndex + images.length) % images.length;
                      
                      // Show top 3 in stack, hide rest
                      if (offset > 2) return null;
                      
                      // Stack styling: offset slightly
                      const rotate = offset === 0 ? '-3deg' : offset === 1 ? '4deg' : '-1deg';
                      const translate = offset === 0 ? 'translate-y-0 translate-x-0 z-30' : offset === 1 ? '-translate-y-2 translate-x-2 z-20' : '-translate-y-4 -translate-x-2 z-10';
                      const opacity = offset === 0 ? 'opacity-100 scale-100' : offset === 1 ? 'opacity-80 scale-95' : 'opacity-40 scale-90';

                      return (
                        <div
                          key={idx}
                          className={`absolute w-44 h-52 bg-white text-neutral-800 p-2.5 pb-8 border border-neutral-200/50 shadow-lg rounded-sm transition-all duration-500 ease-in-out ${translate} ${opacity}`}
                          style={{
                            transform: `rotate(${rotate})`,
                          }}
                        >
                          <div className="w-full h-[84%] relative overflow-hidden bg-neutral-100 rounded-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Birthday memory ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          {images.length > 1 && offset === 0 && (
                            <div className="text-[9px] text-center font-sans text-neutral-400 mt-2.5 font-semibold tracking-wide">
                              📷 {t('clickPhoto')} ({idx + 1}/{images.length})
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()
               : config.imageUrl ? (
                // Fallback for single image Url (Base64 link format)
                <div className="relative w-44 h-44 mb-8 overflow-hidden rounded-xl shadow-lg border-4 border-white dark:border-neutral-800 rotate-1 transform hover:rotate-0 transition-transform duration-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.imageUrl}
                    alt={config.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : null}

              {/* Personalized letter/wishes */}
              <p className={`text-base md:text-lg leading-relaxed whitespace-pre-line max-w-sm mb-8 ${theme.wishesFont}`}>
                &ldquo;{config.wishes}&rdquo;
              </p>

              {/* Decorative ending element */}
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-8" />

              {/* Options to play again or create card */}
              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                  onClick={() => {
                    setPhase('cake');
                    setConfettiActive(false);
                  }}
                  className="px-5 py-2.5 bg-neutral-800 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-full hover:scale-105 active:scale-95 transition-all shadow-md select-none cursor-pointer"
                >
                  🕯️ {t('blowAgain')}
                </button>
                <Link
                  href="/"
                  className="px-5 py-2.5 bg-amber-500 text-white text-xs font-semibold rounded-full hover:bg-amber-600 hover:scale-105 active:scale-95 transition-all shadow-md select-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>✨</span>
                  <span>{t('createYourOwn')}</span>
                </Link>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}

function WishFallback() {
  const [loadingText, setLoadingText] = useState("Unpacking birthday wishes...");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryLang = params.get('lang') || localStorage.getItem('studio-lang') || 'en';
      if (queryLang === 'si') {
        setTimeout(() => {
          setLoadingText("උපන් දින සුභපැතුම් සකසමින් පවතී...");
        }, 0);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f11] flex flex-col items-center justify-center text-white font-sans">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm opacity-60 tracking-wider">{loadingText}</p>
    </div>
  );
}

export default function WishPage() {
  return (
    <Suspense fallback={<WishFallback />}>
      <WishContent />
    </Suspense>
  );
}
