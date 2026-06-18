'use client';

import React, { useEffect, useRef } from 'react';

interface ConfettiEffectProps {
  active: boolean;
  burstCount?: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  '#ffd700', '#ff69b4', '#00ffff', '#ff4500', '#32cd32', 
  '#da70d6', '#ff00ff', '#1e90ff', '#ff8c00', '#adff2f'
];

export default function ConfettiEffect({ active, burstCount = 120 }: ConfettiEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const initParticle = (canvas: HTMLCanvasElement, isBurst = false): ConfettiParticle => {
    const size = Math.random() * 8 + 6;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    // If it's a burst, start at the bottom center (from the cake/gift), otherwise rain from top
    const x = isBurst ? canvas.width / 2 : Math.random() * canvas.width;
    const y = isBurst ? canvas.height * 0.7 : -20;
    
    const speedX = isBurst 
      ? (Math.random() - 0.5) * 15 // wide explosive spread
      : (Math.random() - 0.5) * 3; // soft drift
      
    const speedY = isBurst 
      ? -(Math.random() * 15 + 10) // high explosive jump upward
      : Math.random() * 3 + 2; // steady falling speed

    return {
      x,
      y,
      size,
      color,
      shape,
      speedX,
      speedY,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    };
  };

  const createBurst = (canvas: HTMLCanvasElement) => {
    const newParticles: ConfettiParticle[] = [];
    for (let i = 0; i < burstCount; i++) {
      newParticles.push(initParticle(canvas, true));
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      
      // If active and we don't have enough standard falling particles, spawn some from the top
      if (active && particles.length < 50 && Math.random() < 0.4) {
        particles.push(initParticle(canvas, false));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Physics update
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Falling vs bursting behavior
        p.speedY += 0.2; // Gravity
        p.speedX *= 0.98; // Air resistance
        p.rotation += p.rotationSpeed;

        // Fade out as it falls out of view or gets old
        if (p.speedY > 2 && p.opacity > 0.01) {
          p.opacity -= 0.005;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        ctx.beginPath();
        if (p.shape === 'circle') {
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        } else if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.shape === 'triangle') {
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
        }
        ctx.fill();
        ctx.restore();

        // Remove offscreen or invisible particles
        if (p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20 || p.opacity <= 0.01) {
          particles.splice(i, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, burstCount]);

  // Handle sudden bursts when active changes to true
  useEffect(() => {
    if (active && canvasRef.current) {
      createBurst(canvasRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
