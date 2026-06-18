'use client';

import React, { useState, useEffect } from 'react';

interface CakeCandlesProps {
  age?: number;
  onBlowOut: () => void;
}

// Play a soft wind/extinguish sound effect using Web Audio API
const playBlowSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    const bufferSize = ctx.sampleRate * 0.15; // 0.15 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise for blow sound
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    // Filter the noise to sound like a breath of wind
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.15);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noiseNode.start();
  } catch {
    // ignore audio errors
  }
};

export default function CakeCandles({ age = 3, onBlowOut }: CakeCandlesProps) {
  // Determine number of candles (min 1, max 5 for visual spacing)
  const numCandles = Math.min(Math.max(age > 0 ? age : 3, 1), 5);
  
  // State for which candles are lit
  const [litCandles, setLitCandles] = useState<boolean[]>(
    Array(numCandles).fill(true)
  );
  
  const [allBlownOut, setAllBlownOut] = useState(false);

  const handleBlowCandle = (index: number) => {
    if (!litCandles[index] || allBlownOut) return;
    
    playBlowSound();

    const nextLit = [...litCandles];
    nextLit[index] = false;
    setLitCandles(nextLit);

    // Check if all are blown out
    if (nextLit.every(val => !val)) {
      setAllBlownOut(true);
      setTimeout(() => {
        onBlowOut();
      }, 600);
    }
  };

  const blowAll = () => {
    if (allBlownOut) return;
    playBlowSound();
    setLitCandles(Array(numCandles).fill(false));
    setAllBlownOut(true);
    setTimeout(() => {
      onBlowOut();
    }, 600);
  };

  // Keep state sync'd if the count changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLitCandles(Array(numCandles).fill(true));
      setAllBlownOut(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [numCandles]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Flame flickering keyframe stylesheet */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flameFlicker {
          0%, 100% { transform: scale(1) rotate(-1deg); }
          20% { transform: scale(0.9, 1.05) rotate(1deg); }
          40% { transform: scale(1.05, 0.95) rotate(-2deg); }
          60% { transform: scale(0.95, 1.1) rotate(2deg); }
          80% { transform: scale(1.02, 0.98) rotate(0deg); }
        }
        .flicker-flame {
          animation: flameFlicker 1.2s infinite ease-in-out;
          transform-origin: bottom center;
        }
      `}} />

      {/* Styled Birthday Cake */}
      <svg
        viewBox="0 0 300 320"
        className="w-full max-w-[280px] md:max-w-[320px] select-none"
        style={{ filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.15))' }}
      >
        {/* BACKGROUND CAKE STAND */}
        <ellipse cx="150" cy="285" rx="110" ry="15" fill="#e2e8f0" />
        <rect x="135" y="285" width="30" height="20" fill="#cbd5e1" />
        <ellipse cx="150" cy="305" rx="70" ry="10" fill="#94a3b8" />

        {/* BOTTOM LAYER */}
        <path d="M 50 220 L 50 270 Q 50 285 150 285 Q 250 285 250 270 L 250 220 Z" fill="#ec4899" />
        <ellipse cx="150" cy="220" rx="100" ry="15" fill="#f472b6" />
        {/* Frosting drips */}
        <path d="M 50 220 C 60 235, 70 235, 80 220 C 90 240, 100 240, 110 220 C 120 235, 130 235, 140 220 C 150 240, 160 240, 170 220 C 180 235, 190 235, 200 220 C 210 240, 220 240, 230 220 C 240 230, 245 230, 250 220 Q 250 230 150 230 Q 50 230 50 220 Z" fill="#fdf2f8" />

        {/* MIDDLE LAYER */}
        <path d="M 75 160 L 75 210 Q 75 222 150 222 Q 225 222 225 210 L 225 160 Z" fill="#06b6d4" />
        <ellipse cx="150" cy="160" rx="75" ry="12" fill="#22d3ee" />
        {/* Cream drips middle */}
        <path d="M 75 160 C 85 172, 95 172, 105 160 C 115 175, 125 175, 135 160 C 145 172, 155 172, 165 160 C 175 175, 185 175, 195 160 C 205 172, 215 172, 225 160 Q 225 168 150 168 Q 75 168 75 160 Z" fill="#ecfdf5" />

        {/* TOP LAYER */}
        <path d="M 100 110 L 100 150 Q 100 160 150 160 Q 200 160 200 150 L 200 110 Z" fill="#fbbf24" />
        <ellipse cx="150" cy="110" rx="50" ry="10" fill="#fcd34d" />
        {/* Frosting drips top */}
        <path d="M 100 110 C 110 120, 120 120, 130 110 C 140 122, 150 122, 160 110 C 170 120, 180 120, 190 110 C 195 115, 198 115, 200 110 Q 200 116 150 116 Q 100 116 100 110 Z" fill="#fffbeb" />

        {/* Sprinkles on Top */}
        <circle cx="120" cy="112" r="2" fill="#ef4444" />
        <circle cx="135" cy="115" r="2.5" fill="#3b82f6" />
        <circle cx="150" cy="110" r="2" fill="#10b981" />
        <circle cx="165" cy="114" r="2" fill="#8b5cf6" />
        <circle cx="180" cy="112" r="2.5" fill="#f43f5e" />

        {/* CANDLES */}
        {litCandles.map((isLit, idx) => {
          // Spread candles horizontally on top of the cake
          // Total width available is 100px (from x=100 to x=200)
          // Centered at x=150
          let candleX = 150;
          if (numCandles > 1) {
            const spacing = 70 / (numCandles - 1);
            candleX = 115 + idx * spacing;
          }
          
          // Candle vertical base
          const candleY = 108;
          const candleHeight = 35;
          const candleWidth = 6;

          return (
            <g key={idx}>
              {/* Candle Body */}
              <rect
                x={candleX - candleWidth / 2}
                y={candleY - candleHeight}
                width={candleWidth}
                height={candleHeight}
                rx="2"
                fill={idx % 2 === 0 ? '#3b82f6' : '#a855f7'}
                style={{
                  filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))',
                }}
              />
              {/* Spiral stripes */}
              <path
                d={`M ${candleX - 3} ${candleY - 30} L ${candleX + 3} ${candleY - 26}
                   M ${candleX - 3} ${candleY - 20} L ${candleX + 3} ${candleY - 16}
                   M ${candleX - 3} ${candleY - 10} L ${candleX + 3} ${candleY - 6}`}
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Wick */}
              <line
                x1={candleX}
                y1={candleY - candleHeight}
                x2={candleX}
                y2={candleY - candleHeight - 6}
                stroke="#374151"
                strokeWidth="1.2"
              />

              {/* Flame */}
              {isLit ? (
                <g
                  className="cursor-pointer"
                  onClick={() => handleBlowCandle(idx)}
                >
                  {/* Invisible larger click helper */}
                  <circle
                    cx={candleX}
                    cy={candleY - candleHeight - 15}
                    r="16"
                    fill="transparent"
                  />
                  {/* Flickering Flame */}
                  <path
                    className="flicker-flame"
                    d={`M ${candleX} ${candleY - candleHeight - 24} 
                       C ${candleX - 6} ${candleY - candleHeight - 14}, ${candleX - 5} ${candleY - candleHeight - 6}, ${candleX} ${candleY - candleHeight - 6} 
                       C ${candleX + 5} ${candleY - candleHeight - 6}, ${candleX + 6} ${candleY - candleHeight - 14}, ${candleX} ${candleY - candleHeight - 24} Z`}
                    fill="url(#flameGrad)"
                    style={{
                      transformOrigin: `${candleX}px ${candleY - candleHeight - 6}px`,
                      filter: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.7))',
                    }}
                  />
                </g>
              ) : (
                /* Smoke puff when blown out */
                <g opacity="0">
                  <path
                    d={`M ${candleX} ${candleY - candleHeight - 8} 
                       q -4 -6 0 -12 
                       q 4 -6 -2 -12`}
                    stroke="#e2e8f0"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    className="animate-smoke"
                    style={{
                      animation: 'puff 0.8s ease-out forwards',
                    }}
                  />
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes puff {
                      0% { opacity: 0.8; stroke-dashoffset: 20; transform: translateY(0) scale(1); }
                      50% { opacity: 0.4; }
                      100% { opacity: 0; stroke-dashoffset: 0; transform: translateY(-15px) scale(1.3); }
                    }
                  `}} />
                </g>
              )}
            </g>
          );
        })}

        {/* Global gradients for candles/flame */}
        <defs>
          <radialGradient id="flameGrad" cx="50%" cy="80%" r="80%">
            <stop offset="0%" stopColor="#ffff55" />
            <stop offset="40%" stopColor="#ff9900" />
            <stop offset="80%" stopColor="#ff3300" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff3300" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Helper trigger */}
      {!allBlownOut ? (
        <button
          onClick={blowAll}
          className="mt-6 flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-medium rounded-full shadow-lg transition-all duration-200 text-sm group"
        >
          <span>💨</span>
          <span>Blow Out All Candles</span>
        </button>
      ) : (
        <div className="mt-6 text-xl font-semibold text-amber-500 animate-pulse flex items-center gap-1.5">
          <span>🌟</span>
          <span>Make a wish!</span>
        </div>
      )}
    </div>
  );
}
