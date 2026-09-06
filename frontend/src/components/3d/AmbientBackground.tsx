import React, { useEffect, useRef } from 'react';

/**
 * Premium ambient background with:
 * - Deep layered gradients
 * - Cursor-following glow (indigo-toned, unified palette)
 * - Subtle grid pattern (inspired by Linear/Vercel)
 * - Noise texture overlay
 * - Reduced motion support
 */
const AmbientBackground: React.FC = () => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const current = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const raf = useRef<number>(0);

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const animate = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.04;
      current.current.y += (pos.current.y - current.current.y) * 0.04;

      if (bubbleRef.current) {
        bubbleRef.current.style.transform = `translate(${current.current.x - 250}px, ${current.current.y - 250}px)`;
      }
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: -1, background: '#060a14' }}
      aria-hidden="true"
    >
      {/* Base gradient — deep space feel */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99, 102, 241, 0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), #060a14',
        }}
      />

      {/* Subtle top-center ambient light */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 800,
          height: 400,
          top: -100,
          left: '50%',
          marginLeft: -400,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Cursor-following glow */}
      <div
        ref={bubbleRef}
        className="absolute pointer-events-none will-change-transform"
        style={{
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(79, 70, 229, 0.06) 40%, transparent 70%)',
          filter: 'blur(40px)',
          top: 0,
          left: 0,
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 80%)',
        }}
      />

      {/* Bottom-right accent */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          bottom: -60,
          right: -60,
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.025,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AmbientBackground;
