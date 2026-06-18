'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';

interface Balloon {
  id: number;
  x: number; // percentage across screen (0 - 100)
  speed: number; // animation duration in seconds
  size: number;
  color: string;
  swayDuration: number;
  popped: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

const BALLOON_COLORS = [
  '#ff4d6d', '#ff758f', '#ff8fa3', // Pinks
  '#4ea8de', '#56cfe1', '#64dfdf', // Blues/Cyans
  '#ffd166', '#ffb703', '#fb8500', // Yellows/Oranges
  '#70e000', '#38b000', '#9ef01a', // Greens
  '#b5179e', '#7209b7', '#f72585', // Purples
];

// Spawn a balloon helper
const spawnBalloon = (
  idCounter: React.MutableRefObject<number>,
  setBalloons: React.Dispatch<React.SetStateAction<Balloon[]>>
) => {
  const size = Math.random() * 30 + 55; // width: 55px to 85px
  const newBalloon: Balloon = {
    id: idCounter.current++,
    x: Math.random() * 85 + 7, // 7% to 92%
    speed: Math.random() * 4 + 7, // 7 to 11 seconds flight
    size,
    color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
    swayDuration: Math.random() * 2 + 1.8, // 1.8s to 3.8s sway
    popped: false,
  };
  setBalloons(prev => [...prev, newBalloon]);
};

export default function BalloonPop({ active }: { active: boolean }) {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const idCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Canvas and particle animation loop refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const isLoopRunning = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  // Synth bubble/balloon pop sound effect
  const playPopSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Fast downward frequency sweep (simulates a popping bubble/balloon)
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  };

  // Canvas particle animation loop
  const startParticleLoop = () => {
    if (isLoopRunning.current) return;
    isLoopRunning.current = true;

    const updateParticles = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        isLoopRunning.current = false;
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        isLoopRunning.current = false;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity force
        p.alpha -= 0.025; // fade out speed

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(updateParticles);
      } else {
        isLoopRunning.current = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateParticles);
  };

  // Create popping particles helper
  const createPopParticles = useCallback((x: number, y: number, color: string) => {
    const count = 14;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = Math.random() * 3.5 + 1.5;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 2,
        alpha: 1,
      });
    }
    particlesRef.current.push(...newParticles);
    startParticleLoop();
  }, []);

  // Handle pop action
  const handlePop = (balloon: Balloon, e: React.MouseEvent<HTMLDivElement>) => {
    if (balloon.popped) return;
    e.stopPropagation();
    
    playPopSound();
    
    // Calculate client coordinates relative to container
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    createPopParticles(clickX, clickY, balloon.color);

    setBalloons(prev =>
      prev.map(b => (b.id === balloon.id ? { ...b, popped: true } : b))
    );

    // Delete balloon after pop animation completes
    setTimeout(() => {
      setBalloons(prev => prev.filter(b => b.id !== balloon.id));
    }, 150);
  };

  const handleAnimationEnd = (id: number) => {
    // Remove balloon from state when it floats off screen
    setBalloons(prev => prev.filter(b => b.id !== id));
  };

  // Handle Canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [active]);

  // Handle Spawning
  useEffect(() => {
    if (!active) {
      setTimeout(() => setBalloons([]), 0);
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];

    // Spawn initial balloons staggered
    for (let i = 0; i < 4; i++) {
      const t = setTimeout(() => spawnBalloon(idCounter, setBalloons), i * 1400);
      timeouts.push(t);
    }

    // Interval to spawn subsequent balloons
    const interval = setInterval(() => {
      setBalloons(prev => {
        if (prev.filter(b => !b.popped).length < 7) {
          spawnBalloon(idCounter, setBalloons);
        }
        return prev;
      });
    }, 2000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [active]);

  // Clean up animation frame
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20 overflow-hidden pointer-events-none"
      style={{ height: '100%', width: '100%' }}
    >
      {/* Self-contained CSS animations keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-118vh) rotate(6deg); }
        }
        @keyframes sway {
          0% { transform: translateX(-18px); }
          100% { transform: translateX(18px); }
        }
      `}} />

      {/* Floating balloons */}
      {balloons.map(b => {
        const popStyle = b.popped
          ? { transform: 'scale(1.4) blur(4px)', opacity: 0 }
          : { transform: 'scale(1)', opacity: 1 };

        return (
          <div
            key={b.id}
            onAnimationEnd={() => handleAnimationEnd(b.id)}
            className="absolute pointer-events-auto"
            style={{
              left: `${b.x}%`,
              bottom: `-120px`,
              width: `${b.size}px`,
              height: `${b.size * 1.25}px`,
              animation: `floatUp ${b.speed}s linear forwards`,
            }}
          >
            {/* Sway layer */}
            <div
              className="w-full h-full"
              style={{
                animation: `sway ${b.swayDuration}s ease-in-out infinite alternate`,
              }}
            >
              {/* Scale/pop layer */}
              <div
                onClick={(e) => handlePop(b, e)}
                className="w-full h-full cursor-pointer select-none transition-all duration-150 ease-out"
                style={{
                  ...popStyle,
                  touchAction: 'none',
                }}
              >
                {/* Balloon SVG */}
                <svg
                  viewBox="0 0 100 130"
                  width="100%"
                  height="100%"
                  style={{ filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.12))' }}
                >
                  <defs>
                    <radialGradient id={`grad-${b.id}`} cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.65} />
                      <stop offset="40%" stopColor={b.color} />
                      <stop offset="100%" stopColor={darkenColor(b.color)} />
                    </radialGradient>
                  </defs>
                  {/* Balloon String */}
                  <path
                    d="M 50 100 Q 45 115 52 130"
                    fill="none"
                    stroke="rgba(150,150,150,0.4)"
                    strokeWidth="1.5"
                  />
                  {/* Balloon Body */}
                  <ellipse
                    cx="50"
                    cy="50"
                    rx="40"
                    ry="48"
                    fill={`url(#grad-${b.id})`}
                  />
                  {/* Balloon Knot */}
                  <polygon
                    points="50,95 44,103 56,103"
                    fill={darkenColor(b.color)}
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}

      {/* Pop Particle Canvas (Hardware-accelerated rendering) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full"
      />
    </div>
  );
}

// Simple color darkener for shading
function darkenColor(hex: string): string {
  if (!hex.startsWith('#')) return hex;
  
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r = Math.max(0, Math.floor(r * 0.75));
  g = Math.max(0, Math.floor(g * 0.75));
  b = Math.max(0, Math.floor(b * 0.75));

  const rs = r.toString(16).padStart(2, '0');
  const gs = g.toString(16).padStart(2, '0');
  const bs = b.toString(16).padStart(2, '0');

  return `#${rs}${gs}${bs}`;
}
