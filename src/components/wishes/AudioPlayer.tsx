'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BirthdaySynth } from '@/utils/audioSynth';

interface AudioPlayerProps {
  track: 'music-box' | 'lofi' | 'piano' | 'none';
  isPlaying: boolean;
  onTogglePlay: (playing: boolean) => void;
}

export default function AudioPlayer({ track, isPlaying, onTogglePlay }: AudioPlayerProps) {
  const synthRef = useRef<BirthdaySynth | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize synth on client-side mount
  useEffect(() => {
    synthRef.current = new BirthdaySynth(track);
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => {
      clearTimeout(timer);
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update track theme when it changes
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setTheme(track);
    }
  }, [track]);

  // Synchronize playing state
  useEffect(() => {
    if (!synthRef.current || !mounted) return;

    if (isPlaying) {
      synthRef.current.play();
    } else {
      synthRef.current.stop();
    }
  }, [isPlaying, track, mounted]);

  const handleToggle = () => {
    const nextPlaying = !isPlaying;
    onTogglePlay(nextPlaying);
  };

  if (!mounted || track === 'none') return null;

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-3 bg-white/10 dark:bg-black/20 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 dark:border-white/5 shadow-lg">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes soundWave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .bar-1 { animation: soundWave 0.6s infinite 0.1s ease-in-out; }
        .bar-2 { animation: soundWave 0.6s infinite 0.3s ease-in-out; }
        .bar-3 { animation: soundWave 0.6s infinite 0.2s ease-in-out; }
        .bar-4 { animation: soundWave 0.6s infinite 0.4s ease-in-out; }
      `}} />

      {/* Visualizer bars */}
      <div className="flex items-end gap-[2px] w-5 h-4 justify-center">
        <div className={`w-[3px] bg-amber-400 rounded-full ${isPlaying ? 'bar-1' : 'h-[4px]'}`} />
        <div className={`w-[3px] bg-amber-400 rounded-full ${isPlaying ? 'bar-2' : 'h-[6px]'}`} />
        <div className={`w-[3px] bg-amber-400 rounded-full ${isPlaying ? 'bar-3' : 'h-[3px]'}`} />
        <div className={`w-[3px] bg-amber-400 rounded-full ${isPlaying ? 'bar-4' : 'h-[5px]'}`} />
      </div>

      <span className="text-[11px] font-medium tracking-wide uppercase opacity-75 text-neutral-800 dark:text-neutral-200 select-none">
        {track.replace('-', ' ')}
      </span>

      <button
        onClick={handleToggle}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-600 active:scale-90 transition-all text-white text-xs cursor-pointer"
        aria-label={isPlaying ? 'Mute Music' : 'Play Music'}
      >
        {isPlaying ? (
          /* Volume speaker icon */
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        ) : (
          /* Muted speaker icon */
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6H4.51c-.88 0-1.704.507-1.938 1.354A9.01 9.01 0 002.25 12c0 .83.112 1.633.322 2.396C2.806 15.244 3.63 15.75 4.51 15.75H6.75l4.72 4.72a.75.75 0 001.28-.53V3.85a.75.75 0 00-1.28-.53L6.75 8.25z" />
          </svg>
        )}
      </button>
    </div>
  );
}
