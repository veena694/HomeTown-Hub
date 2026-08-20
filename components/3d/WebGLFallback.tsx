'use client';

import React from 'react';
import { MapPin, Sparkles, Compass, ArrowRight } from 'lucide-react';
import { useLocationContext } from '@/lib/LocationContext';
import Link from 'next/link';

export default function WebGLFallback() {
  const { currentLocation } = useLocationContext();
  const cityName = currentLocation?.city || 'Hometown';
  const activeSlug = currentLocation?.slug || 'hometown';

  return (
    <div className="w-full h-[520px] rounded-3xl bg-gradient-to-b from-hub-cream via-hub-stone to-hub-ivory border border-hub-border p-8 flex flex-col items-center justify-center text-center space-y-6 text-hub-charcoal">
      <div className="w-20 h-20 rounded-3xl bg-hub-terracotta/10 text-hub-terracotta flex items-center justify-center font-bold shadow-sm">
        <Compass className="w-10 h-10 animate-spin" />
      </div>

      <div className="space-y-2 max-w-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hub-terracotta/10 text-hub-terracotta text-xs font-mono font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive 2D Landmark View</span>
        </div>
        <h3 className="font-display font-bold text-2xl text-hub-charcoal">{cityName} Hometown Scene</h3>
        <p className="text-xs text-hub-sage leading-relaxed">
          WebGL preview is currently resting. Explore {cityName}’s real OpenStreetMap heritage landmarks, oral histories, and community map pins.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/community/${activeSlug}`}
          className="px-5 py-2.5 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white text-xs font-bold shadow-sm flex items-center gap-2"
        >
          <span>Explore {cityName} Community</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href={`/community/${activeSlug}/memory-map`}
          className="px-5 py-2.5 rounded-xl bg-white border border-hub-border text-hub-charcoal text-xs font-semibold hover:border-hub-terracotta flex items-center gap-2"
        >
          <MapPin className="w-4 h-4 text-hub-terracotta" />
          <span>Open Scrapbook Map</span>
        </Link>
      </div>
    </div>
  );
}
