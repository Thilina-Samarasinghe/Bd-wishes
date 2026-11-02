'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { decodeConfig, DEFAULT_CONFIG, CardConfig } from '@/utils/encoder';
import GiftBox from '@/components/wishes/GiftBox';
import CakeCandles from '@/components/wishes/CakeCandles';
import BalloonPop from '@/components/wishes/BalloonPop';
import ConfettiEffect from '@/components/wishes/ConfettiEffect';
import AudioPlayer from '@/components/wishes/AudioPlayer';
import { getTheme, GOOGLE_FONTS_URL } from '@/lib/themes';
import { CARD_TEXT, isMusicTrack } from '@/lib/cardText';
import { unlockAudio } from '@/utils/audioSynth';

interface CardWishState extends CardConfig {
  images?: string[];
}

// A client component that extracts and decodes search params, wrapped in Suspense
function WishContent() {
  const searchParams = useSearchParams();
  // Language and look come from the card. Old links fall back to their lang param.
  const [config, setConfig] = useState<CardWishState>({ ...DEFAULT_CONFIG, lang: undefined, mode: undefined });
  const [phase, setPhase] = useState<'box' | 'cake' | 'letter'>('box');
  const [confettiActive, setConfettiActive] = useState(false);
  const [balloonsActive, setBalloonsActive] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState<'notFound' | 'loadError' | 'invalidLink' | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMuted, setUserMuted] = useState(false);
  const [hasTapped, setHasTapped] = useState(false);
  const previewLook = useRef('');

  const isPreview = searchParams.get('preview') === '1';
  const urlLang = searchParams.get('lang');
  const lang = config.lang ?? (urlLang === 'si' ? 'si' : 'en');
  const t = (key: keyof typeof CARD_TEXT['en']) => CARD_TEXT[lang][key];

  // The song is always on for the recipient. Browsers unlock sound on the first touch, so it
  // starts on that tap (which at the latest is the gift box) unless the browser allows it sooner.
  // The sender's preview stays silent until they tap, so editing the card makes no noise.
  const isMusicPlaying = !loading && !error && config.music !== 'none' && !userMuted && (!isPreview || hasTapped);

  useEffect(() => {
    const onGesture = () => {
      unlockAudio();
      setHasTapped(true);
    };
    const events = ['pointerdown', 'touchend', 'click', 'keydown'];
    events.forEach((name) => window.addEventListener(name, onGesture, { capture: true, passive: true }));
    return () => events.forEach((name) => window.removeEventListener(name, onGesture, { capture: true }));
  }, []);

  // Preview mode: the studio sends the unsaved card, and changes to it show up immediately
  useEffect(() => {
    if (!isPreview) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type !== 'bd-wishes-preview-config') return;
      const next = event.data.config as CardWishState;
      // A new look or song restarts the card from the gift box
      const look = [next.theme, next.music, next.mode, next.lang].join('|');
      if (look !== previewLook.current) {
        previewLook.current = look;
        setPhase('box');
        setConfettiActive(false);
        setBalloonsActive(false);
        setHasTapped(false);
        setUserMuted(false);
      }
      setConfig(next);
      setActiveImageIndex(0);
      setLoading(false);
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'bd-wishes-preview-ready' }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, [isPreview]);

  // Custom font loading dynamically via standard links or classes
  useEffect(() => {
    // Inject the Google Font links to HTML head
    const link = document.createElement('link');
    link.href = GOOGLE_FONTS_URL;
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

    if (isPreview) return;

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
              music: isMusicTrack(card.music) ? card.music : 'none',
              effects: card.effects as CardConfig['effects'],
              imageUrl: card.images[0] || '', // fallback
              images: card.images,
              lang: card.lang === 'si' || card.lang === 'en' ? card.lang : undefined,
              mode: card.mode === 'dark' || card.mode === 'light' ? card.mode : undefined,
            };
            timer = setTimeout(() => {
              setConfig(mappedConfig);
              setLoading(false);
            }, 0);
          } else {
            timer = setTimeout(() => {
              setError('notFound');
              setLoading(false);
            }, 0);
          }
        })
        .catch(() => {
          timer = setTimeout(() => {
            setError('loadError');
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
          setError('invalidLink');
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
  }, [searchParams, isPreview]);

  const handleOpenBox = () => {
    setPhase('cake');
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

  const theme = getTheme(config.theme, config.mode);

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#0f0f11] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <main className="relative min-h-dvh flex flex-col items-center justify-center bg-[#0a0a0c] text-white p-4 sm:p-6">
        <div className="w-full max-w-md bg-[#111115] border border-white/[0.05] p-6 sm:p-8 rounded-2xl backdrop-blur-md shadow-xl text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h1 className="text-xl font-bold mb-3 font-sans text-neutral-200">{t('unableToLoad')}</h1>
          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">{t(error)}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-amber-500 text-neutral-900 text-sm font-bold rounded-full hover:bg-amber-600 transition-all select-none"
          >
            {t('createYourOwn')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`relative min-h-dvh flex flex-col items-center justify-center overflow-x-hidden px-4 pt-16 pb-8 sm:p-6 sm:pt-16 transition-colors duration-1000 ${theme.bgClass} ${theme.fontClass}`}>
      {/* Dynamic Background Effect */}
      {theme.bgEffect}

      {/* Floating balloons background */}
      <BalloonPop active={balloonsActive} />

      {/* Confetti canvas animation */}
      <ConfettiEffect active={confettiActive} />

      {/* Audio synthesizer controller */}
      <AudioPlayer
        track={config.music}
        lang={lang}
        isPlaying={isMusicPlaying}
        onTogglePlay={(playing) => {
          setHasTapped(true);
          setUserMuted(!playing);
        }}
      />

      {/* Greeting Layout Card */}
      <div className="w-full max-w-lg z-30 flex flex-col items-center">
        
        {/* Phased Rendering */}
        {phase === 'box' && (
          <div className="text-center animate-fade-in">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl mb-6 font-bold leading-tight wrap-anywhere ${theme.headerFont}`}>
              {t('hello')}{config.name}!
            </h1>
            <GiftBox
              onOpen={handleOpenBox}
              theme={config.theme}
              mode={config.mode}
              lang={lang}
              showSongHint={config.music !== 'none' && !hasTapped}
            />
          </div>
        )}

        {phase === 'cake' && (
          <div className="w-full text-center flex flex-col items-center">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 wrap-anywhere ${theme.headerFont}`}>
              {t('happyBirthdayTo')}{config.name}!
            </h2>
            <p className="text-sm opacity-80 max-w-xs mb-8">
              {t('gestureDesc')}
            </p>
            
            <CakeCandles 
              age={config.age ? parseInt(config.age) : 3} 
              onBlowOut={handleBlowOutCandles}
              lang={lang}
            />
          </div>
        )}

        {phase === 'letter' && (
          <div 
            className={`relative w-full p-5 sm:p-8 md:p-10 transition-all duration-1000 ease-out translate-y-0 opacity-100 ${theme.cardClass}`}
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

            {theme.cardDecor}

            <div className="relative flex flex-col items-center text-center">

              {/* Star Badge */}
              <div className={`w-12 h-12 flex items-center justify-center rounded-full mb-6 text-xl animate-bounce ${theme.badgeClass}`}>
                🎉
              </div>

              <h1 className={`text-3xl md:text-4xl font-bold mb-4 tracking-wide ${theme.textColor} ${theme.headerFont}`}>
                {t('happyBirthday')}
              </h1>
              
              <h2 className={`text-xl md:text-2xl font-bold mb-6 wrap-anywhere ${theme.nameClass}`}>
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
              <p className={`text-base md:text-lg leading-relaxed whitespace-pre-line wrap-anywhere max-w-sm mb-8 ${theme.wishesFont}`}>
                &ldquo;{config.wishes}&rdquo;
              </p>

              {/* Decorative ending element */}
              <div className={`w-20 h-px mb-8 ${theme.dividerClass}`} />

              {/* Options to play again or create card */}
              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                  onClick={() => {
                    setPhase('cake');
                    setConfettiActive(false);
                  }}
                  className={`px-5 py-3 text-sm font-semibold rounded-full hover:scale-105 active:scale-95 transition-all shadow-md select-none cursor-pointer ${theme.secondaryBtnClass}`}
                >
                  🕯️ {t('blowAgain')}
                </button>
                {!isPreview && (
                <Link
                  href="/"
                  className={`px-5 py-3 text-sm font-semibold rounded-full hover:scale-105 active:scale-95 transition-all shadow-md select-none cursor-pointer flex items-center justify-center gap-1.5 ${theme.btnClass}`}
                >
                  <span>✨</span>
                  <span>{t('createYourOwn')}</span>
                </Link>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}

function WishFallback() {
  return (
    <div className="min-h-dvh bg-[#0f0f11] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
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
