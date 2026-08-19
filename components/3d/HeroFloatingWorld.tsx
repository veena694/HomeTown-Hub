'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function MiniHouse({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.7, 0.6, 0.7]} />
        <meshStandardMaterial color="#FFF8ED" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.85, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.6, 0.45, 4]} />
        <meshStandardMaterial color="#E8754F" roughness={0.3} />
      </mesh>
    </group>
  );
}

function FloatingPhoto({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0.1, -0.2, 0.1]}>
      <mesh>
        <boxGeometry args={[0.9, 0.7, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[0.75, 0.55]} />
        <meshStandardMaterial color="#8FB8D8" roughness={0.6} />
      </mesh>
    </group>
  );
}

function FloatingPin({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.8;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.35]} />
      <meshStandardMaterial color="#E8754F" emissive="#E8754F" emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function HeroFloatingWorld() {
  const [mounted, setMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!mounted || !hasWebGL) return null;

  return (
    <div className="w-full h-[320px] rounded-3xl overflow-hidden bg-transparent relative">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#F3B562" />

        <Sparkles count={25} scale={4} size={2.5} speed={0.4} color="#F3B562" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
          <MiniHouse position={[-1.8, 0.2, 0]} />
          <FloatingPhoto position={[1.8, 0.4, 0]} />
          <FloatingPin position={[0, 0.8, 0.2]} />
        </Float>
      </Canvas>
    </div>
  );
}
