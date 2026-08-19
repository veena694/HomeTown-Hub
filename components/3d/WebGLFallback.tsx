'use client';

import React from 'react';
import { MapPin, Sparkles, Compass } from 'lucide-react';
import { useLocationContext } from '@/lib/LocationContext';
import Link from 'next/link';

export default function WebGLFallback() {
  const { currentLocation } = useLocationContext();
  const cityName = currentLocation?.city || 'Panipat';

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden bg-gradient-to-b from-hub-cream via-hub-stone to-[#EBF4EC] border border-hub-border p-6 flex flex-col justify-between shadow-sm">
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-hub-border text-xs text-hub-charcoal">
          <Compass className="w-3.5 h-3.5 text-hub-terracotta" />
          <span className="font-semibold">{cityName} Illustrated Hometown View</span>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-hub-terracotta/10 text-hub-terracotta border border-hub-terracotta/30 font-medium">
          Simplified Diorama Mode
        </span>
      </div>

      <div className="my-auto text-center space-y-3 max-w-md mx-auto z-10">
        <div className="w-16 h-16 rounded-full bg-hub-terracotta/10 border border-hub-terracotta/30 flex items-center justify-center text-hub-terracotta mx-auto">
          <MapPin className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-display font-semibold text-hub-charcoal">Welcome to {cityName}</h3>
        <p className="text-sm text-hub-sage">
          Explore historical landmarks, oral heritage, and community memories pinned across {cityName}.
        </p>
        <Link
          href={`/community/${currentLocation?.slug || 'panipat'}/memory-map`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white text-xs font-semibold shadow-md transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Open Hometown Memory Map™</span>
        </Link>
      </div>

      <div className="flex items-center justify-between text-xs text-hub-sage border-t border-hub-border pt-4 z-10">
        <span>Simplified layout active for performance</span>
        <span className="font-mono text-hub-terracotta font-medium">WebGL 2D Render</span>
      </div>
    </div>
  );
}
