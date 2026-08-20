'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import { MapPin, Compass, Sparkles, AlertCircle, Share2, Layers, RotateCcw } from 'lucide-react';
import { useLocationContext, PlaceData } from '@/lib/LocationContext';

interface LandmarkData {
  id: string;
  name: string;
  category: string;
  year: string;
  description: string;
  position: [number, number, number];
  color: string;
}

class SceneErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn('WebGL 3D Diorama render error, switching to 2D view:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// -------------------------------------------------------------
// LOW-POLY PROCEDURAL MINIATURE MODELS
// -------------------------------------------------------------

function GroundBase() {
  return (
    <group>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6.2, 0.4, 32]} />
        <meshStandardMaterial color="#88B04B" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[6.2, 6.4, 0.1, 32]} />
        <meshStandardMaterial color="#D9A05B" roughness={0.9} />
      </mesh>
    </group>
  );
}

function River() {
  return (
    <mesh position={[0, -0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[12, 1.8]} />
      <meshStandardMaterial color="#4A90E2" roughness={0.2} metalness={0.1} transparent opacity={0.85} />
    </mesh>
  );
}

function House({ position, color = '#FFF8ED', roofColor = '#E8754F' }: { position: [number, number, number]; color?: string; roofColor?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.6, 0.5, 4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.5, 8]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <dodecahedronGeometry args={[0.35, 1]} />
        <meshStandardMaterial color="#78A88B" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Category-Specific Place Miniatures
function FortMiniature({ color = '#D97706' }: { color?: string }) {
  return (
    <group position={[0, 0.8, 0]}>
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 1.2, 1.8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[-1.1, 1.1].map((x, idx) => (
        <group key={idx} position={[x, 0.4, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.45, 0.45, 1.6, 12]} />
            <meshStandardMaterial color="#B45309" />
          </mesh>
          <mesh position={[0, 1.0, 0]}>
            <coneGeometry args={[0.5, 0.6, 12]} />
            <meshStandardMaterial color="#7C2D12" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function TempleMiniature({ color = '#E8754F' }: { color?: string }) {
  return (
    <group position={[0, 0.6, 0]}>
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[1.6, 0.8, 1.6]} />
        <meshStandardMaterial color="#FFF8ED" />
      </mesh>
      <mesh castShadow position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.9, 1.4, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function PalaceMiniature({ color = '#F59E0B' }: { color?: string }) {
  return (
    <group position={[0, 0.7, 0]}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[2.8, 1.0, 1.5]} />
        <meshStandardMaterial color="#FDF6E2" />
      </mesh>
      {[-1.0, 0, 1.0].map((x, i) => (
        <mesh key={i} castShadow position={[x, 1.2, 0]}>
          <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
          <meshStandardMaterial color={color} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function GenericMiniature({ color = '#78A88B' }: { color?: string }) {
  return (
    <group position={[0, 0.7, 0]}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.8, 1.0, 1.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <octahedronGeometry args={[0.6]} />
        <meshStandardMaterial color="#FFF" roughness={0.3} />
      </mesh>
    </group>
  );
}

function LandmarkBuilding({ landmark, onSelect }: { landmark: LandmarkData; onSelect: () => void }) {
  return (
    <group position={landmark.position} onClick={onSelect}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[0.9, 1.0, 0.9]} />
        <meshStandardMaterial color={landmark.color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.65, 0.7, 4]} />
        <meshStandardMaterial color="#FFF8ED" />
      </mesh>
      <Html position={[0, 1.8, 0]} center distanceFactor={10}>
        <button
          onClick={onSelect}
          className="px-2.5 py-1 rounded-full bg-white/95 dark:bg-[#27322B]/95 text-hub-charcoal border border-hub-terracotta/40 font-bold text-[10px] shadow-md hover:bg-hub-terracotta hover:text-white transition-all whitespace-nowrap flex items-center gap-1 min-h-[32px]"
        >
          <MapPin className="w-3 h-3 text-hub-terracotta" />
          <span>{landmark.name}</span>
        </button>
      </Html>
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
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 15, 10]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-10, 10, -5]} intensity={0.4} color="#B4C6E7" />

      <GroundBase />
      <River />

      {selectedPlace ? (
        /* Render Focused Place Miniature */
        <group>
          {selectedPlace.category?.includes('FORT') || selectedPlace.name?.toLowerCase().includes('fort') ? (
            <FortMiniature color="#D97706" />
          ) : selectedPlace.category?.includes('PALACE') || selectedPlace.name?.toLowerCase().includes('palace') ? (
            <PalaceMiniature color="#F59E0B" />
          ) : selectedPlace.category?.includes('TEMPLE') || selectedPlace.name?.toLowerCase().includes('mandir') ? (
            <TempleMiniature color="#E8754F" />
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
          <Tree position={[-2.5, 0, -1.2]} />
          <Tree position={[2.5, 0, 1.2]} />

          {landmarks.map((lm) => (
            <LandmarkBuilding key={lm.id} landmark={lm} onSelect={() => onSelectLandmark(lm)} />
          ))}
        </group>
      )}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        autoRotate={!selectedPlace}
        autoRotateSpeed={0.8}
      />
    </>
  );
}

function WebGLFallback() {
  const { currentLocation } = useLocationContext();
  const cityName = currentLocation?.city || 'Hometown';

  return (
    <div className="w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-3xl bg-hub-cream border border-hub-border p-6 flex flex-col items-center justify-center text-center space-y-4 text-hub-charcoal">
      <div className="w-16 h-16 rounded-3xl bg-hub-terracotta/10 text-hub-terracotta flex items-center justify-center font-bold">
        <Compass className="w-8 h-8 animate-spin" />
      </div>
      <div>
        <h3 className="font-display font-bold text-xl">{cityName} Hometown Diorama</h3>
        <p className="text-xs text-hub-sage max-w-sm mt-1">
          Interactive 3D WebGL preview unavailable. Exploring real OpenStreetMap landmark details for {cityName}.
        </p>
      </div>
    </div>
  );
}

export default function HometownScene() {
  const { currentLocation, selectedPlace, setSelectedPlace } = useLocationContext();
  const [isMounted, setIsMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [realLandmarks, setRealLandmarks] = useState<LandmarkData[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkData | null>(null);
  const [isLoadingPoi, setIsLoadingPoi] = useState(false);

  const requestIdRef = useRef(0);

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

  // DE-RACER POI FETCHING WITH ABORT CONTROLLER & REQUEST ID VERIFICATION
  useEffect(() => {
    if (!currentLocation) return;

    const currentReqId = ++requestIdRef.current;
    const controller = new AbortController();

    setIsLoadingPoi(true);
    setRealLandmarks([]); // Clear old landmarks immediately on city change

    const lat = currentLocation.latitude || 29.3909;
    const lng = currentLocation.longitude || 76.9635;

    fetch(`/api/locations/nearby-places?lat=${lat}&lng=${lng}&limit=4`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        // IGNORE STALE RESPONSES IF ANOTHER REQUEST WAS LAUNCHED
        if (currentReqId !== requestIdRef.current) return;

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
      .catch((err) => {
        if (err.name !== 'AbortError' && currentReqId === requestIdRef.current) {
          setRealLandmarks([]);
        }
      })
      .finally(() => {
        if (currentReqId === requestIdRef.current) {
          setIsLoadingPoi(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [currentLocation]);

  if (!isMounted) {
    return (
      <div className="w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-3xl bg-hub-cream border border-hub-border flex items-center justify-center text-hub-sage">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Compass className="w-5 h-5 text-hub-terracotta animate-spin" />
          <span>Building 3D Hometown Diorama...</span>
        </div>
      </div>
    );
  }

  if (!hasWebGL) {
    return <WebGLFallback />;
  }

  const cityName = currentLocation?.city || 'Hometown';
  const activeSlug = currentLocation?.slug?.toLowerCase() || 'hometown';

  // Geographic safety validation: Ensure selectedPlace belongs to the active location (within ~50km radius)
  const isPlaceInActiveCity = React.useMemo(() => {
    if (!selectedPlace || !currentLocation) return false;
    if (selectedPlace.latitude && selectedPlace.longitude) {
      const dLat = Math.abs(selectedPlace.latitude - currentLocation.latitude);
      const dLng = Math.abs(selectedPlace.longitude - currentLocation.longitude);
      return dLat < 0.5 && dLng < 0.5;
    }
    return true;
  }, [selectedPlace, currentLocation]);

  const validSelectedPlace = isPlaceInActiveCity ? selectedPlace : null;

  const handleSharePlace = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?location=${activeSlug}${validSelectedPlace ? `&place=${encodeURIComponent(validSelectedPlace.name)}` : ''}`;
      navigator.clipboard.writeText(url);
      alert(`Shareable link copied to clipboard:\n${url}`);
    }
  };

  const sceneKey = `${currentLocation?.latitude}-${currentLocation?.longitude}-${validSelectedPlace?.id || 'overview'}`;

  return (
    <div id="3d-diorama-section" className="space-y-4">
      <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#E2F1F8] via-hub-cream to-[#F4EFE6] dark:from-[#202A24] dark:via-[#18201C] dark:to-[#27322B] border border-hub-border shadow-md">
        {/* DYNAMIC SCENE CANVAS WITH ERROR BOUNDARY */}
        <SceneErrorBoundary fallback={<WebGLFallback />}>
          <Canvas key={sceneKey} camera={{ position: [0, 5, 8], fov: 45 }}>
            <HometownSceneContent
              landmarks={realLandmarks}
              selectedPlace={validSelectedPlace}
              onSelectLandmark={(lm) => setSelectedLandmark(lm)}
            />
          </Canvas>
        </SceneErrorBoundary>

        {/* DIORAMA OVERLAY HEADER BADGE */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white/90 dark:bg-[#27322B]/90 backdrop-blur-md border border-hub-border shadow-sm flex items-center gap-2 text-xs font-semibold text-hub-charcoal pointer-events-auto">
            <Sparkles className="w-4 h-4 text-hub-terracotta" />
            <span className="font-mono font-bold tracking-tight uppercase">
              {validSelectedPlace ? `3D ${validSelectedPlace.name.toUpperCase()} MINIATURE` : `3D ${cityName.toUpperCase()} MINIATURE DIORAMA`}
            </span>
            {isLoadingPoi && <span className="text-[10px] text-hub-terracotta animate-pulse font-mono">(Syncing POIs...)</span>}
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {selectedPlace && (
              <button
                onClick={() => setSelectedPlace(null)}
                className="px-3 py-1.5 rounded-2xl bg-hub-terracotta text-white font-bold text-xs shadow-sm hover:bg-hub-terracottaDark flex items-center gap-1.5 min-h-[36px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Back to City Miniature</span>
              </button>
            )}
            <button
              onClick={handleSharePlace}
              className="p-2 rounded-2xl bg-white/90 dark:bg-[#27322B]/90 backdrop-blur-md border border-hub-border text-hub-sage hover:text-hub-charcoal shadow-sm min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Share 3D View Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PLACE / LANDMARK DETAIL FLOATING PANEL */}
        {(validSelectedPlace || selectedLandmark) && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 p-4 rounded-2xl bg-white/95 dark:bg-[#27322B]/95 backdrop-blur-md border border-hub-border shadow-xl space-y-2.5 text-hub-charcoal animate-accordion-down z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-hub-terracotta bg-hub-terracotta/10 px-2 py-0.5 rounded-full uppercase">
                {validSelectedPlace?.category || selectedLandmark?.category || 'Heritage Site'}
              </span>
              <button
                onClick={() => {
                  setSelectedPlace(null);
                  setSelectedLandmark(null);
                }}
                className="text-hub-sage hover:text-hub-charcoal text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="font-display font-bold text-sm text-hub-charcoal">
                {validSelectedPlace?.name || selectedLandmark?.name}
              </h4>
              <p className="text-xs text-hub-sage mt-1 leading-relaxed">
                {validSelectedPlace?.description || selectedLandmark?.description || `Verified landmark in ${cityName}.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
