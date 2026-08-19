'use client';

import React, { useState } from 'react';
import { Camera, Calendar, MapPin, Sparkles } from 'lucide-react';

interface Props {
  title: string;
  location: string;
  description: string;
  thenImageUrl?: string;
  nowImageUrl?: string;
  thenYear?: string;
  nowYear?: string;
  contributorName?: string;
}

export default function ThenAndNowSlider({
  title,
  location,
  description,
  thenImageUrl = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
  nowImageUrl = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  thenYear = '1975',
  nowYear = '2026',
  contributorName = 'Community Contributor',
}: Props) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className="bg-white border border-hub-border rounded-3xl p-5 space-y-4 shadow-sm text-hub-charcoal">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-hub-terracotta/10 text-hub-terracotta">
            <Camera className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display font-semibold text-lg text-hub-charcoal">{title}</h3>
            <p className="text-xs text-hub-sage flex items-center gap-1">
              <MapPin className="w-3 h-3 text-hub-terracotta" />
              {location}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-hub-terracotta/10 text-hub-terracotta text-xs font-mono font-medium border border-hub-terracotta/20">
          Then & Now Comparison
        </span>
      </div>

      <div className="relative w-full h-80 rounded-2xl overflow-hidden select-none border border-hub-border shadow-2xs">
        {/* NOW Image (Background) */}
        <img
          src={nowImageUrl}
          alt="Now"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-3 right-3 z-10 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-mono font-bold text-hub-charcoal border border-hub-border">
          NOW • {nowYear}
        </div>

        {/* THEN Image (Clipped Foreground) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={thenImageUrl}
            alt="Then"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: '100%', height: '100%' }}
          />
          <div className="absolute bottom-3 left-3 z-10 px-3 py-1 rounded-full bg-hub-terracotta text-white text-[11px] font-mono font-bold border border-hub-terracottaDark">
            THEN • {thenYear}
          </div>
        </div>

        {/* Slider Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-20 cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-hub-terracotta flex items-center justify-center text-hub-terracotta shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Hidden Range Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
        />
      </div>

      <div className="p-3.5 rounded-2xl bg-hub-cream border border-hub-border text-xs text-hub-sage space-y-1">
        <p className="italic text-hub-charcoal">"{description}"</p>
        <div className="pt-2 flex justify-between text-[11px] text-hub-sage font-mono">
          <span>Drag slider horizontally to compare eras</span>
          <span>Preserved by {contributorName}</span>
        </div>
      </div>
    </div>
  );
}
