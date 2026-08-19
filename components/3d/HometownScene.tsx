'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import WebGLFallback from './WebGLFallback';
import { MapPin, Sparkles as SparklesIcon, X, Compass, BookOpen, Calendar, ArrowLeft, Share2, Layers, Heart } from 'lucide-react';
import { useLocationContext, PlaceData } from '@/lib/LocationContext';
import Link from 'next/link';

interface LandmarkData {
  id: string;
  name: string;
  category: string;
  year: string;
  description: string;
  position: [number, number, number];
  color: string;
}

// 3D Miniature Model Components
function PalaceMiniature({ color = '#E8754F' }: { color?: string }) {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Base Palace Layer */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.0, 1.2]} />
        <meshStandardMaterial color="#FFF8ED" roughness={0.3} />
      </mesh>
      {/* Central Dome */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.45, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Side Domes */}
      <mesh position={[-0.7, 1.1, 0]}>
        <sphereGeometry args={[0.25, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh position={[0.7, 1.1, 0]}>
        <sphereGeometry args={[0.25, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </group>
  );
}

function FortMiniature() {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Fort Outer Walls */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.8, 2.2]} />
        <meshStandardMaterial color="#D45D36" roughness={0.7} />
      </mesh>
      {/* Corner Watchtowers */}
      <mesh position={[-0.9, 0.9, -0.9]}>
        <cylinderGeometry args={[0.22, 0.25, 0.6, 8]} />
        <meshStandardMaterial color="#B84924" />
      </mesh>
      <mesh position={[0.9, 0.9, -0.9]}>
        <cylinderGeometry args={[0.22, 0.25, 0.6, 8]} />
        <meshStandardMaterial color="#B84924" />
      </mesh>
      <mesh position={[-0.9, 0.9, 0.9]}>
        <cylinderGeometry args={[0.22, 0.25, 0.6, 8]} />
        <meshStandardMaterial color="#B84924" />
      </mesh>
      <mesh position={[0.9, 0.9, 0.9]}>
        <cylinderGeometry args={[0.22, 0.25, 0.6, 8]} />
        <meshStandardMaterial color="#B84924" />
      </mesh>
    </group>
  );
}

function TempleMiniature() {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Main Temple Shikhara Tower */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <coneGeometry args={[0.65, 1.4, 4]} />
        <meshStandardMaterial color="#F3B562" roughness={0.3} />
      </mesh>
      {/* Temple Base */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.4, 0.4, 1.4]} />
        <meshStandardMaterial color="#FFF8ED" />
      </mesh>
      {/* Kalash Top */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#E8754F" />
      </mesh>
    </group>
  );
}

function GenericMiniature({ color = '#8FB8D8' }: { color?: string }) {
  return (
    <group position={[0, 0.2, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.0, 1.2]} />
        <meshStandardMaterial color="#FFF8ED" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <coneGeometry args={[0.85, 0.6, 4]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </group>
  );
}

function House({ position, color = '#F4EFE6', roofColor = '#E8754F' }: { position: [number, number, number]; color?: string; roofColor?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.8, 0.85]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.75, 0.55, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 0.6, 6]} />
        <meshStandardMaterial color="#8C6D58" />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <dodecahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial color="#78A88B" roughness={0.5} />
      </mesh>
    </group>
  );
}

function InteractiveLandmark({
  data,
  onSelect,
}: {
  data: LandmarkData;
  onSelect: (lm: LandmarkData) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = data.position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.08 + (hovered ? 0.2 : 0);
    }
  });

  return (
    <group position={data.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(data)}
      >
        <octahedronGeometry args={[0.38]} />
        <meshStandardMaterial
          color={hovered ? '#E8754F' : data.color}
          emissive={data.color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          roughness={0.2}
        />
      </mesh>

      <Html position={[0, 0.75, 0]} center distanceFactor={10}>
        <div
          onClick={() => onSelect(data)}
          className={`cursor-pointer transition-all duration-300 transform ${
            hovered ? 'scale-110 shadow-lg' : 'scale-100'
          } px-3 py-1 rounded-full bg-white/90 dark:bg-[#27322B]/90 border ${
            hovered ? 'border-hub-terracotta text-hub-terracotta' : 'border-hub-border text-hub-charcoal'
          } text-[11px] font-semibold whitespace-nowrap backdrop-blur-md flex items-center gap-1.5 shadow-sm`}
        >
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: data.color }} />
          {data.name}
        </div>
      </Html>
    </group>
  );
}

function DioramaBaseTable() {
  return (
    <group>
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <cylinderGeometry args={[5.8, 6.2, 0.4, 32]} />
        <meshStandardMaterial color="#E6DFD3" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <cylinderGeometry args={[5.6, 5.6, 0.04, 32]} />
        <meshStandardMaterial color="#EBF4EC" roughness={0.8} />
      </mesh>
    </group>
  );
}

function HometownSceneContent({
  landmarks,
  selectedPlace,
  onSelectLandmark,
}: {
  landmarks: LandmarkData[];
  selectedPlace: PlaceData | null;
  onSelectLandmark: (lm: LandmarkData) => void;
}) {
  const cat = selectedPlace?.category?.toLowerCase() || '';

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 20, 10]} intensity={1.8} castShadow />
      <pointLight position={[0, 5, 0]} intensity={1.2} color="#F3B562" />
      <Sparkles count={40} scale={8} size={3} speed={0.4} color="#F3B562" />

      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.2}>
        <DioramaBaseTable />

        {selectedPlace ? (
          /* Render Selected Place Focused 3D Miniature Model */
          <group position={[0, 0, 0]}>
            {cat.includes('fort') || cat.includes('castle') ? (
              <FortMiniature />
            ) : cat.includes('palace') ? (
              <PalaceMiniature />
            ) : cat.includes('temple') || cat.includes('mandir') ? (
              <TempleMiniature />
            ) : (
              <GenericMiniature color={selectedPlace.category === 'HERITAGE' ? '#E8754F' : '#F3B562'} />
            )}

            <House position={[-2.2, 0, 1.5]} color="#FFF8ED" roofColor="#E8754F" />
            <House position={[2.2, 0, 1.5]} color="#F4EFE6" roofColor="#78A88B" />
            <Tree position={[-1.5, 0, -1.8]} />
            <Tree position={[1.8, 0, -1.8]} />

            <Html position={[0, 2.2, 0]} center distanceFactor={8}>
              <div className="px-4 py-1.5 rounded-full bg-hub-terracotta text-white font-bold text-xs shadow-lg flex items-center gap-1.5 animate-bounce">
                <MapPin className="w-4 h-4" />
                <span>{selectedPlace.name}</span>
              </div>
            </Html>
          </group>
        ) : (
          /* Render City-Level Overview Diorama */
          <group>
            <House position={[-1.8, 0, 1.8]} color="#FFF8ED" roofColor="#E8754F" />
            <House position={[1.8, 0, 1.8]} color="#F4EFE6" roofColor="#78A88B" />
            <House position={[-2.2, 0, -1.8]} color="#FFF8ED" roofColor="#8FB8D8" />
            <House position={[2.1, 0, 2.1]} color="#F4EFE6" roofColor="#F3B562" />
            <House position={[0, 0, -2.5]} color="#FFF8ED" roofColor="#C99BB5" />

            <Tree position={[-1.0, 0, 2.2]} />
            <Tree position={[1.2, 0, -2.1]} />
            <Tree position={[-2.8, 0, 0.2]} />
            <Tree position={[2.7, 0, 0.5]} />

            {landmarks.map((lm) => (
              <InteractiveLandmark key={lm.id} data={lm} onSelect={onSelectLandmark} />
            ))}
          </group>
        )}
      </Float>

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.6} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 4} />
    </>
  );
}

export default function HometownScene() {
  const [isMounted, setIsMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkData | null>(null);
  const [realLandmarks, setRealLandmarks] = useState<LandmarkData[]>([]);
  const { currentLocation, selectedPlace, setSelectedPlace } = useLocationContext();

  useEffect(() => {
    setIsMounted(true);
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  useEffect(() => {
    if (!currentLocation) return;
    const lat = currentLocation.latitude || 29.3909;
    const lng = currentLocation.longitude || 76.9635;

    fetch(`/api/locations/nearby-places?lat=${lat}&lng=${lng}&limit=4`)
      .then((res) => res.json())
      .then((data) => {
        if (data.places && data.places.length > 0) {
          const colors = ['#E8754F', '#F3B562', '#78A88B', '#8FB8D8'];
          const positions: [number, number, number][] = [
            [-2.0, 1.2, -0.8],
            [0, 1.4, 0.5],
            [2.2, 1.0, -1.5],
            [-1.8, 1.0, 1.2],
          ];

          const mapped: LandmarkData[] = data.places.map((p: any, idx: number) => ({
            id: p.id || `poi-${idx}`,
            name: p.name,
            category: p.category ? p.category.toUpperCase() : 'HISTORIC LANDMARK',
            year: 'Historical',
            description: `Verified landmark in ${currentLocation.city} retrieved from OpenStreetMap data.`,
            position: positions[idx % positions.length],
            color: colors[idx % colors.length],
          }));

          setRealLandmarks(mapped);
        } else {
          setRealLandmarks([]);
        }
      })
      .catch(() => setRealLandmarks([]));
  }, [currentLocation]);

  if (!isMounted) {
    return (
      <div className="w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-3xl bg-hub-cream border border-hub-border flex items-center justify-center text-hub-sage">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Compass className="w-5 h-5 text-hub-terracotta animate-spin" />
          <span>Crafting 3D Hometown Diorama...</span>
        </div>
      </div>
    );
  }

  if (!hasWebGL) {
    return <WebGLFallback />;
  }

  const cityName = currentLocation?.city || 'Panipat';
  const activeSlug = currentLocation?.slug?.toLowerCase() || 'panipat';

  const handleSharePlace = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?location=${activeSlug}${selectedPlace ? `&place=${encodeURIComponent(selectedPlace.name)}` : ''}`;
      navigator.clipboard.writeText(url);
      alert(`Shareable link copied to clipboard:\n${url}`);
    }
  };

  return (
    <div id="3d-diorama-section" className="space-y-4">
      <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#E2F1F8] via-hub-cream to-[#F4EFE6] dark:from-[#202A24] dark:via-[#18201C] dark:to-[#27322B] border border-hub-border shadow-md">
        <Canvas camera={{ position: [0, 5, 8], fov: 45 }}>
          <HometownSceneContent
            landmarks={realLandmarks}
            selectedPlace={selectedPlace}
            onSelectLandmark={(lm) => setSelectedLandmark(lm)}
          />
        </Canvas>

        {/* Dynamic Header Badge */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#27322B]/90 border border-hub-border backdrop-blur-md text-xs text-hub-charcoal shadow-sm">
          <SparklesIcon className="w-3.5 h-3.5 text-hub-terracotta animate-pulse" />
          <span className="font-semibold text-hub-charcoal">
            {selectedPlace ? `${selectedPlace.name.toUpperCase()} MINIATURE` : `3D ${cityName} Miniature Diorama`}
          </span>
          <span className="text-hub-sage">• Real OpenStreetMap POIs</span>
        </div>

        {/* Back to City Button when a Place is Selected */}
        {selectedPlace && (
          <button
            onClick={() => setSelectedPlace(null)}
            className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-hub-terracotta text-white font-bold text-xs shadow-md flex items-center gap-1.5 hover:bg-hub-terracottaDark transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {cityName} Miniature</span>
          </button>
        )}

        {/* Selected Landmark Modal (for City Overview POI pin clicks) */}
        {selectedLandmark && !selectedPlace && (
          <div className="absolute bottom-6 left-6 right-6 z-20 max-w-lg mx-auto p-5 rounded-2xl bg-white/95 dark:bg-[#27322B]/95 border border-hub-border backdrop-blur-xl text-hub-charcoal shadow-xl animate-accordion-down">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-hub-terracotta/10 text-hub-terracotta">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-display font-semibold text-lg text-hub-charcoal">{selectedLandmark.name}</h3>
                  <span className="text-xs text-hub-terracotta font-mono font-medium">
                    {selectedLandmark.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLandmark(null)}
                className="p-1.5 rounded-lg hover:bg-hub-stone text-hub-sage hover:text-hub-charcoal transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-3 text-hub-sage text-sm leading-relaxed">{selectedLandmark.description}</p>
            
            <div className="mt-4 pt-3 border-t border-hub-border flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedPlace({
                    id: selectedLandmark.id,
                    name: selectedLandmark.name,
                    latitude: currentLocation?.latitude || 29.3909,
                    longitude: currentLocation?.longitude || 76.9635,
                    category: selectedLandmark.category.toLowerCase(),
                    description: selectedLandmark.description,
                  });
                  setSelectedLandmark(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-hub-terracotta text-white text-xs font-medium flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Focus 3D Miniature Scene</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PLACE INFORMATION PANEL (Rendered when a specific place is selected) */}
      {selectedPlace && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#27322B] border border-hub-border shadow-sm space-y-4 text-hub-charcoal animate-accordion-down">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-hub-terracotta/10 text-hub-terracotta flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-hub-terracotta/10 text-hub-terracotta text-[11px] font-mono font-bold uppercase border border-hub-terracotta/20">
                    {selectedPlace.category}
                  </span>
                  <span className="text-xs text-hub-sage font-mono">
                    {selectedPlace.latitude.toFixed(4)}, {selectedPlace.longitude.toFixed(4)}
                  </span>
                </div>
                <h2 className="text-2xl font-display font-semibold text-hub-charcoal mt-1">{selectedPlace.name}</h2>
                <p className="text-xs text-hub-sage">{selectedPlace.address || `${cityName}, India`}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSharePlace}
                className="px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-hub-charcoal text-xs font-semibold flex items-center gap-1.5 hover:bg-hub-border"
              >
                <Share2 className="w-3.5 h-3.5 text-hub-terracotta" />
                <span>Share Place</span>
              </button>

              <button
                onClick={() => setSelectedPlace(null)}
                className="px-3.5 py-2 rounded-xl bg-hub-terracotta text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Reset to {cityName} View</span>
              </button>
            </div>
          </div>

          <p className="text-sm text-hub-charcoal leading-relaxed bg-hub-cream dark:bg-[#202A24] p-4 rounded-2xl border border-hub-border">
            {selectedPlace.description || `Explore digital memories, heritage stories, and community discussions pinned at ${selectedPlace.name}.`}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-hub-border">
            <div className="flex items-center gap-4 text-hub-sage">
              <span className="flex items-center gap-1 text-hub-terracotta font-semibold">
                <Heart className="w-4 h-4 fill-hub-terracotta" />
                Verified Hometown Place
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/community/${activeSlug}/memory-map`}
                className="px-4 py-2 rounded-xl bg-hub-terracotta text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Memories From This Place</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
