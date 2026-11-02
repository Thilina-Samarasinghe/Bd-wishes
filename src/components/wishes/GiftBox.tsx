'use client';

import React, { useState } from 'react';
import { getTheme, type CardMode, type ThemeId } from '@/lib/themes';
import { CARD_TEXT, type CardLang } from '@/lib/cardText';

interface GiftBoxProps {
  onOpen: () => void;
  theme: ThemeId;
  mode?: CardMode;
  lang?: CardLang;
  showSongHint?: boolean;
}

export default function GiftBox({ onOpen, theme, mode, lang = 'en', showSongHint = false }: GiftBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    // Play a soft wind chime/opening sweep sound effect
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {}

    // Callback after opening transition completes
    setTimeout(() => {
      onOpen();
    }, 800);
  };

  const colors = getTheme(theme, mode).box;
  const text = CARD_TEXT[lang];

  return (
    <div className="flex flex-col items-center justify-center min-h-[350px]">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes subtlePulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
        .animate-float {
          animation: float 4s infinite ease-in-out;
        }
        .animate-glow {
          animation: subtlePulse 3s infinite ease-in-out;
        }
      `}} />

      <div 
        className="relative cursor-pointer select-none py-12"
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow Ring behind the Box */}
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl animate-glow transition-all duration-500 ${colors.glow}`} />

        {/* 3D Gift Box Wrapper */}
        <div className={`relative w-40 h-40 animate-float transition-all duration-700 ${isOpen ? 'scale-75 opacity-0 pointer-events-none' : 'scale-100'}`}>
          
          {/* LID OF GIFT BOX */}
          <div 
            className={`absolute z-10 w-44 h-12 left-[-8px] rounded-t-md shadow-lg transition-all duration-500 ease-out ${colors.lidBg} ${isHovered ? '-translate-y-2' : ''}`}
            style={{
              top: '0px',
            }}
          >
            {/* Lid Ribbon Horizontal */}
            <div className={`absolute top-0 bottom-0 left-[76px] w-8 ${colors.ribbonBg}`} />
            
            {/* Bow */}
            <div className="absolute top-[-16px] left-[70px] w-10 h-10 flex items-center justify-center">
              {/* Bow Left Loop */}
              <div className={`absolute w-7 h-5 rounded-full border-2 border-white/20 -rotate-45 left-[-8px] top-0 origin-right ${colors.bowBg}`} />
              {/* Bow Right Loop */}
              <div className={`absolute w-7 h-5 rounded-full border-2 border-white/20 rotate-45 right-[-8px] top-0 origin-left ${colors.bowBg}`} />
              {/* Bow Center Knot */}
              <div className="absolute w-5 h-5 rounded-full bg-white shadow-md z-20" />
            </div>
          </div>

          {/* BOX BODY */}
          <div className={`absolute bottom-0 w-40 h-32 rounded-b-md shadow-2xl transition-all duration-300 ${colors.boxBg} ${colors.shadow}`}>
            {/* Box Ribbon Vertical */}
            <div className={`absolute top-0 bottom-0 left-[72px] w-8 h-full ${colors.ribbonBg}`} />
            {/* Box Ribbon Horizontal */}
            <div className={`absolute top-[48px] bottom-0 left-0 w-full h-8 ${colors.ribbonBg}`} />
            
            {/* Inner shadows / highlights */}
            <div className="absolute inset-0 bg-black/10 rounded-b-md pointer-events-none" />
          </div>

        </div>
      </div>

      <div className={`text-center transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
        <p className={`text-lg font-medium animate-pulse ${colors.textColor}`}>
          🎁 {text.specialGift}
        </p>
        <p className="text-xs opacity-70 mt-1.5 font-sans">
          {text.tapToOpen}
        </p>
        {showSongHint && (
          <p className="text-xs opacity-70 mt-1 font-sans">🎵 {text.tapForSong}</p>
        )}
      </div>
    </div>
  );
}
