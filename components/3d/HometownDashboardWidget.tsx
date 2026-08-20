'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles, MapPin, Compass } from 'lucide-react';
import { useLocationContext } from '@/lib/LocationContext';

function DashboardGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshStandardMaterial color="#E8754F" emissive="#E8754F" emissiveIntensity={0.6} />
      </mesh>

      <mesh ref={meshRef}>
        <sphereGeometry args={[1.3, 18, 18]} />
        <meshStandardMaterial color="#78A88B" wireframe roughness={0.3} />
      </mesh>
    </group>
  );
}

export default function HometownDashboardWidget({ hometownName }: { hometownName?: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const { currentLocation } = useLocationContext();

  useEffect(() => {
    setIsMounted(true);
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const activeName = hometownName || currentLocation?.city || 'Hometown';

  return (
    <div className="relative w-full h-[220px] rounded-2xl bg-gradient-to-br from-hub-cream to-hub-stone border border-hub-border p-4 flex flex-col justify-between overflow-hidden shadow-sm">
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-hub-terracotta" />
          <span className="text-xs font-semibold text-hub-charcoal uppercase tracking-wider">{activeName} Today</span>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-hub-terracotta/10 text-hub-terracotta border border-hub-terracotta/30 font-medium">
          Live 3D Pulse
        </span>
      </div>

      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {isMounted && hasWebGL ? (
          <Canvas camera={{ position: [0, 0, 4.2] }}>
            <ambientLight intensity={1.2} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color="#F3B562" />
            <Float speed={2} floatIntensity={0.4}>
              <DashboardGlobe />
            </Float>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
          </Canvas>
        ) : (
          <div className="w-24 h-24 rounded-full bg-hub-terracotta/10 border border-hub-terracotta/30 flex items-center justify-center text-hub-terracotta animate-pulse">
            <Compass className="w-8 h-8" />
          </div>
        )}
      </div>

      <div className="z-10 bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-hub-border text-xs text-hub-sage flex justify-between items-center shadow-xs">
        <span>Active Hometown Memory Nodes</span>
        <span className="font-mono text-hub-terracotta font-semibold">184 Verified</span>
      </div>
    </div>
  );
}
