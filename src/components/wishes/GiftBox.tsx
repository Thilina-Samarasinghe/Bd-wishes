'use client';

import React, { useState } from 'react';

interface GiftBoxProps {
  onOpen: () => void;
  theme: 'gold' | 'pink' | 'neon' | 'space' | 'sunset' | 'forest' | 'violet' | 'ocean';
}

export default function GiftBox({ onOpen, theme }: GiftBoxProps) {
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

  // Theme-specific colors for the gift box
  const getBoxColors = () => {
    switch (theme) {
      case 'gold':
        return {
          boxBg: 'bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700',
          lidBg: 'bg-neutral-800 border-b border-amber-500/20',
          ribbonBg: 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600',
          bowBg: 'bg-amber-500',
          shadow: 'shadow-amber-500/10',
          textColor: 'text-amber-400 font-serif',
          glow: 'bg-amber-400/20',
        };
      case 'pink':
        return {
          boxBg: 'bg-gradient-to-tr from-rose-500 via-pink-400 to-pink-300',
          lidBg: 'bg-pink-400 border-b border-rose-300/30',
          ribbonBg: 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500',
          bowBg: 'bg-yellow-400',
          shadow: 'shadow-pink-500/20',
          textColor: 'text-pink-100 font-sans',
          glow: 'bg-pink-300/30',
        };
      case 'neon':
        return {
          boxBg: 'bg-gradient-to-tr from-violet-950 via-purple-900 to-fuchsia-950 border border-fuchsia-500/50',
          lidBg: 'bg-purple-900 border-b border-cyan-400/50',
          ribbonBg: 'bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 animate-pulse',
          bowBg: 'bg-cyan-400',
          shadow: 'shadow-fuchsia-500/30 shadow-[0_0_20px_rgba(247,37,133,0.3)]',
          textColor: 'text-cyan-400 font-mono tracking-wider',
          glow: 'bg-fuchsia-500/20',
        };
      case 'space':
        return {
          boxBg: 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-950 border border-blue-500/30',
          lidBg: 'bg-indigo-950 border-b border-purple-500/30',
          ribbonBg: 'bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500',
          bowBg: 'bg-purple-500',
          shadow: 'shadow-blue-500/20',
          textColor: 'text-blue-300 font-sans tracking-wide',
          glow: 'bg-purple-500/15',
        };
      case 'sunset':
        return {
          boxBg: 'bg-gradient-to-tr from-amber-950 via-orange-800 to-orange-600',
          lidBg: 'bg-orange-850 border-b border-orange-500/20',
          ribbonBg: 'bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500',
          bowBg: 'bg-amber-400',
          shadow: 'shadow-orange-500/20',
          textColor: 'text-orange-400 font-sans tracking-wide',
          glow: 'bg-orange-400/20',
        };
      case 'forest':
        return {
          boxBg: 'bg-gradient-to-tr from-emerald-950 via-emerald-800 to-green-700',
          lidBg: 'bg-emerald-850 border-b border-emerald-500/20',
          ribbonBg: 'bg-gradient-to-r from-yellow-100 via-emerald-300 to-green-500',
          bowBg: 'bg-emerald-400',
          shadow: 'shadow-emerald-500/20',
          textColor: 'text-emerald-400 font-sans tracking-wide',
          glow: 'bg-emerald-400/20',
        };
      case 'violet':
        return {
          boxBg: 'bg-gradient-to-tr from-violet-950 via-purple-900 to-fuchsia-850',
          lidBg: 'bg-purple-900 border-b border-fuchsia-500/20',
          ribbonBg: 'bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500',
          bowBg: 'bg-fuchsia-400',
          shadow: 'shadow-purple-500/25',
          textColor: 'text-purple-400 font-sans tracking-wider',
          glow: 'bg-purple-400/20',
        };
      case 'ocean':
        return {
          boxBg: 'bg-gradient-to-tr from-blue-950 via-sky-800 to-sky-600',
          lidBg: 'bg-sky-850 border-b border-sky-550/20',
          ribbonBg: 'bg-gradient-to-r from-cyan-400 via-blue-450 to-sky-400',
          bowBg: 'bg-sky-400',
          shadow: 'shadow-sky-500/20',
          textColor: 'text-sky-350 font-sans tracking-wide',
          glow: 'bg-sky-400/20',
        };
    }
  };

  const colors = getBoxColors();

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
          🎁 You have a special gift!
        </p>
        <p className="text-xs text-neutral-400 mt-1.5 font-sans">
          Click the box to open
        </p>
      </div>
    </div>
  );
}
