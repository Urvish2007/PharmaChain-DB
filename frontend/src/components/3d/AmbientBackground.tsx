import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Environment, Float, Sphere } from '@react-three/drei';

const LiquidOrbs = () => {
  const mesh1 = useRef<Mesh>(null);
  const mesh2 = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh1.current) {
      mesh1.current.position.y = Math.sin(t * 0.4) * 2;
      mesh1.current.position.x = Math.cos(t * 0.3) * 3;
    }
    if (mesh2.current) {
      mesh2.current.position.y = Math.cos(t * 0.5) * 2 - 2;
      mesh2.current.position.x = Math.sin(t * 0.4) * 4;
    }
  });

  const materialProps = {
    transmission: 1,
    thickness: 1.5,
    roughness: 0.2,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
  };

  return (
    <>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere ref={mesh1} args={[2.5, 64, 64]} position={[-3, 1, -5]}>
          <meshPhysicalMaterial color="#3b82f6" {...materialProps} />
        </Sphere>
      </Float>
      
      <Float speed={1} rotationIntensity={0.8} floatIntensity={1.5}>
        <Sphere ref={mesh2} args={[3, 64, 64]} position={[4, -2, -8]}>
          <meshPhysicalMaterial color="#8b5cf6" {...materialProps} />
        </Sphere>
      </Float>

      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4338ca" />
      
      <Environment preset="city" />
    </>
  );
};

const AmbientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#0f172a]">
      {/* Fallback gradient behind the 3D canvas */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] opacity-80" />
      
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 2]} // Optimize pixel ratio
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'none' }}
      >
        <LiquidOrbs />
      </Canvas>
      
      {/* Overlay noise texture for premium matte look */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />
    </div>
  );
};

export default AmbientBackground;
