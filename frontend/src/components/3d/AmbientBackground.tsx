import React, { useEffect, useRef } from 'react';

/**
 * A single soft glowing bubble that smoothly follows the cursor.
 * Pure CSS/DOM — no Three.js, no WebGL, zero z-index fights.
 */
const AmbientBackground: React.FC = () => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const current = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);

    const animate = () => {
      // Lerp toward cursor for smooth lag
      current.current.x += (pos.current.x - current.current.x) * 0.06;
      current.current.y += (pos.current.y - current.current.y) * 0.06;

      if (bubbleRef.current) {
        bubbleRef.current.style.transform = `translate(${current.current.x - 300}px, ${current.current.y - 300}px)`;
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
      className="fixed inset-0 bg-[#0f172a] overflow-hidden"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {/* Static gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a1040] to-[#0f172a]" />

      {/* Cursor-following glow bubble */}
      <div
        ref={bubbleRef}
        className="absolute pointer-events-none will-change-transform"
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.10) 40%, transparent 70%)',
          filter: 'blur(40px)',
          top: 0,
          left: 0,
        }}
      />

      {/* Subtle static accent — bottom right */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)',
          filter: 'blur(60px)',
          bottom: -80,
          right: -80,
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AmbientBackground;
