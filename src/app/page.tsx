'use client';

import React, { useState, useEffect } from 'react';
import { encodeConfig, DEFAULT_CONFIG, CardConfig } from '@/utils/encoder';
import CakeCandles from '@/components/wishes/CakeCandles';
import GiftBox from '@/components/wishes/GiftBox';
import BalloonPop from '@/components/wishes/BalloonPop';
import ConfettiEffect from '@/components/wishes/ConfettiEffect';
import AudioPlayer from '@/components/wishes/AudioPlayer';

const PRESETS = [
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
];

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
  const [historyCards, setHistoryCards] = useState<any[]>([]);
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

  const toggleTheme = () => {
    setIsLightTheme(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('studio-theme', next ? 'light' : 'dark');
      }
      return next;
    });
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
        setIsLightTheme(true);
      }
    }

    // Validate active session
    checkUserSession();

    return () => {
      clearTimeout(timer);
      document.head.removeChild(link);
    };
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

  // Sync uploaded images with config imageUrl for mockup preview (fallback to first uploaded)
  useEffect(() => {
    if (uploadedImages.length > 0) {
      setConfig(prev => ({ ...prev, imageUrl: uploadedImages[0] }));
    } else {
      setConfig(prev => ({ ...prev, imageUrl: '' }));
    }
  }, [uploadedImages]);

  const checkUserSession = async () => {
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
  };

  const fetchUserHistory = async () => {
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
  };

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
          setUploadedImages(prev => [...prev, data.url]);
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
    setUploadedImages(prev => prev.filter((_, idx) => idx !== index));
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
    ? `${window.location.origin}/wish?card=${encodeConfig(config)}`
    : '';

  // Handle preset application
  const applyPreset = (preset: typeof PRESETS[0]) => {
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
      <header className={`border-b backdrop-blur-xl px-8 py-5 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-colors duration-300 ${
        isLightTheme ? 'border-slate-200/80 bg-white/70 text-slate-850' : 'border-white/[0.05] bg-slate-950/60 text-slate-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 text-xl select-none animate-[pulse_3s_infinite]">
            🎂
          </div>
          <div>
            <h1 className={`text-sm md:text-base font-extrabold tracking-wide bg-clip-text text-transparent transition-all duration-300 ${
              isLightTheme 
                ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600' 
                : 'bg-gradient-to-r from-white via-slate-100 to-slate-400'
            }`}>Creative BD Wishes Studio</h1>
            <p className={`text-[10px] md:text-xs font-medium transition-colors duration-300 ${
              isLightTheme ? 'text-slate-500' : 'text-slate-400'
            }`}>Design & Share Magical Interactive Birthday Greetings</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Light/Dark mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer select-none text-base shadow-sm flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 ${
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
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer select-none hover:-translate-y-0.5 active:translate-y-0 ${
                showPreview
                  ? isLightTheme
                    ? 'bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-900 border border-white/[0.08] hover:bg-slate-850 text-slate-300'
                  : 'bg-amber-500 text-neutral-950 hover:bg-amber-600 shadow-amber-500/10'
              }`}
            >
              {showPreview ? '👁️ Hide Preview' : '👁️ Show Preview'}
            </button>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-inner border transition-all duration-300 ${
                isLightTheme 
                  ? 'text-slate-750 bg-white border-slate-200/80 shadow-slate-100' 
                  : 'text-slate-300 bg-slate-950/60 border-white/[0.05]'
              }`}>
                👤 {user.email}
              </span>
              <button
                onClick={handleLogout}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all select-none cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
                  isLightTheme
                    ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200'
                    : 'text-rose-400 hover:text-rose-350 hover:bg-rose-950/25 border-rose-500/20'
                }`}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <span className={`text-xs font-bold select-none uppercase tracking-wider px-3 py-1 border rounded-full transition-all duration-300 ${
              isLightTheme 
                ? 'text-slate-500 bg-slate-200/40 border-slate-250' 
                : 'text-slate-500 bg-slate-950/40 border-white/[0.03]'
            }`}>
              Guest Mode
            </span>
          )}
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left pane: Customizer / Login Panel (scrollable) */}
        <div className={`${showPreview ? 'lg:col-span-7' : 'lg:col-span-12'} p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-81px)] transition-all duration-300 border-r space-y-8 scrollbar-thin ${
          isLightTheme ? 'border-slate-200/80 shadow-inner bg-slate-50/50' : 'border-white/[0.05]'
        }`}>
          
          {authLoading ? (
            /* Loading check */
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>Loading your creative studio...</p>
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
                <h2 className={`text-2xl font-extrabold tracking-tight font-sans transition-colors duration-300 ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>Enter Creative Studio</h2>
                <p className={`text-xs leading-relaxed font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>
                  Sign in securely with email. We will generate a passwordless magic link to save cards and upload memories.
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
                    Email Address
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
                    <span>🚀 Send Magic Link</span>
                  )}
                </button>
              </form>

              {magicLinkUrl && (
                <div className={`p-5 rounded-2xl space-y-2.5 text-center animate-pulse shadow-sm border ${
                  isLightTheme 
                    ? 'bg-amber-500/5 border-amber-500/30' 
                    : 'bg-amber-500/5 border-amber-500/20'
                }`}>
                  <p className="text-xs text-amber-500 dark:text-amber-400 font-extrabold tracking-wider">✨ DEVELOPMENT AUTO-LOGIN CUE</p>
                  <p className={`text-[10px] font-medium ${isLightTheme ? 'text-slate-650' : 'text-slate-400'}`}>An email has been simulated. Click below to login immediately:</p>
                  <a
                    href={magicLinkUrl}
                    className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 font-bold rounded-xl text-xs transition-all shadow-md mt-1 cursor-pointer select-none"
                  >
                    🔑 Click to Login Directly
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
                  <span>🛠️</span> Studio Configurator
                </h2>
                <p className={`text-xs mt-1 leading-relaxed font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>
                  Customize the recipient details, select interactive sound tracks, choose visual themes, and upload memory pictures to save in the database.
                </p>
              </div>

              {/* Quick presets */}
              <div className="space-y-3">
                <label className={`text-[10px] font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
                  isLightTheme ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Quick Theme Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESETS.map((p, idx) => {
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
                    Recipient Name
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    value={config.name}
                    onChange={(e) => updateConfig('name', e.target.value)}
                    placeholder="Enter recipient's name"
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
                    Recipient Age (Optional)
                  </label>
                  <input
                    id="age-input"
                    type="number"
                    min="1"
                    max="100"
                    value={config.age || ''}
                    onChange={(e) => updateConfig('age', e.target.value)}
                    placeholder="Enter age (e.g. 25)"
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
                  Visual Theme Select
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {[
                    { id: 'gold' as const, label: 'Midnight Gold', emoji: '✨', border: 'border-amber-500/80 shadow-amber-500/5 bg-amber-500/5', desc: 'Serif fonts, gold details' },
                    { id: 'pink' as const, label: 'Cherry Blossom', emoji: '🌸', border: 'border-pink-500/80 shadow-pink-500/5 bg-pink-500/5', desc: 'Pastel pink, falling sakura' },
                    { id: 'neon' as const, label: 'Retro Neon', emoji: '🕹️', border: 'border-fuchsia-500/80 shadow-fuchsia-500/5 bg-fuchsia-500/5', desc: 'Cyberpunk grids, neon glows' },
                    { id: 'space' as const, label: 'Nebula Voyage', emoji: '🌌', border: 'border-indigo-400/80 shadow-indigo-400/5 bg-indigo-400/5', desc: 'Cosmic stars, nebulae' },
                    { id: 'sunset' as const, label: 'Sunset Glow', emoji: '🌇', border: 'border-orange-500/80 shadow-orange-500/5 bg-orange-500/5', desc: 'Warm gradients, sunset dust' },
                    { id: 'forest' as const, label: 'Mystic Forest', emoji: '🌲', border: 'border-emerald-500/80 shadow-emerald-500/5 bg-emerald-500/5', desc: 'Deep greens, natural fireflies' },
                    { id: 'violet' as const, label: 'Amethyst Cyber', emoji: '🔮', border: 'border-purple-500/80 shadow-purple-500/5 bg-purple-500/5', desc: 'Futuristic purples, cyber glow' },
                    { id: 'ocean' as const, label: 'Abyss Blue', emoji: '🌊', border: 'border-sky-500/80 shadow-sky-500/5 bg-sky-500/5', desc: 'Azure waves, water ripples' },
                  ].map((t) => {
                    const isActive = config.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          updateConfig('theme', t.id);
                          setActivePreviewTab('box');
                        }}
                        className={`flex flex-col p-4 text-left rounded-2xl border-2 transition-all select-none cursor-pointer hover:-translate-y-0.5 ${
                          isActive 
                            ? t.border 
                            : isLightTheme 
                              ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm shadow-slate-100/50' 
                              : 'border-white/[0.04] bg-slate-950/30 hover:bg-slate-950/60 text-slate-200'
                        }`}
                      >
                        <span className="text-xl mb-1.5">{t.emoji}</span>
                        <span className={`text-xs font-bold leading-tight ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>{t.label}</span>
                        <span className={`text-[9px] mt-1.5 leading-relaxed font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-505 text-slate-500' : 'text-slate-400'}`}>{t.desc}</span>
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
                  Personalized Wishes Letter
                </label>
                <textarea
                  id="wishes-input"
                  rows={4}
                  value={config.wishes}
                  onChange={(e) => updateConfig('wishes', e.target.value)}
                  placeholder="Write a sweet, customized birthday message..."
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
                    Sound Signature
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
                    <option value="music-box" className={isLightTheme ? "text-slate-800 bg-white" : "text-white bg-slate-900"}>🎁 Classic Music Box (Nostalgic)</option>
                    <option value="lofi" className={isLightTheme ? "text-slate-800 bg-white" : "text-white bg-slate-900"}>☕ Cozy Lofi Birthday (Chill)</option>
                    <option value="piano" className={isLightTheme ? "text-slate-800 bg-white" : "text-white bg-slate-900"}>🎹 Elegant Piano (Emotional)</option>
                    <option value="none" className={isLightTheme ? "text-slate-800 bg-white" : "text-white bg-slate-900"}>🔇 No Audio</option>
                  </select>
                </div>

                {/* 5-Image Uploader Dropzone */}
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
                    isLightTheme ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Upload Memory Photos (Up to 5 images)
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
                    Tip: Images will render as a dynamic stack of Polaroids in the letter stage.
                  </span>
                </div>
              </div>

              {/* Interactive Effects toggles */}
              <div className="space-y-3">
                <label className={`text-[10px] font-bold uppercase tracking-wider block font-sans transition-colors duration-300 ${
                  isLightTheme ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Active Interactive Effects
                </label>
                <div className={`flex flex-wrap gap-4 p-4.5 rounded-2xl border transition-all duration-300 ${
                  isLightTheme ? 'bg-white border-slate-200 shadow-sm shadow-slate-100/50' : 'bg-slate-950/30 p-4.5 rounded-2xl border border-white/[0.04]'
                }`}>
                  {[
                    { id: 'balloons' as const, label: 'Floating Popping Balloons' },
                    { id: 'candles' as const, label: 'Virtual Blowable Candles' },
                    { id: 'confetti' as const, label: 'Explosive Confetti Shower' },
                  ].map((effect) => {
                    const isActive = config.effects.includes(effect.id);
                    return (
                      <label key={effect.id} className={`flex items-center gap-2.5 text-sm font-semibold cursor-pointer select-none transition-colors duration-300 ${
                        isLightTheme ? 'text-slate-700' : 'text-slate-300'
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
                      <span>💾</span> Save to DB Collection
                    </h3>
                    <p className={`text-[10px] mt-1 leading-normal font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>
                      Saves your uploaded images and card configuration to your cloud dashboard.
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
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-emerald-400 font-bold animate-pulse">
                          ✨ Saved! Share this persistent ID link.
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
                          <span>Save Card & Get Link</span>
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
                      <span>🔗</span> Standalone URL Code Link
                    </h3>
                    <p className={`text-[10px] mt-1 leading-normal font-medium transition-colors duration-300 ${isLightTheme ? 'text-slate-650' : 'text-slate-400'}`}>
                      Generate an instant serverless URL. (Does not save uploaded memory images).
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
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* CARD CREATION HISTORY PANEL */}
              <div className={`pt-6 border-t space-y-4 transition-colors duration-300 ${
                isLightTheme ? 'border-slate-200/80' : 'border-white/[0.05]'
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>
                  <span>📚</span> My Collection History
                </h3>
                
                {historyLoading ? (
                  <div className="flex items-center gap-2 py-4">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className={`text-xs transition-colors duration-300 ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Loading cards list...</span>
                  </div>
                ) : historyCards.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No cards created yet. Fill out the configurator and click "Save Card" to start your collection!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                    {historyCards.map((card) => {
                      const shareLink = `${window.location.origin}/wish?id=${card.id}`;
                      
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
                                To: {card.name}
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
                              {card.theme} theme
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
          <div className={`lg:col-span-5 p-6 md:p-8 flex flex-col items-center justify-center relative min-h-[500px] transition-colors duration-300 ${
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
