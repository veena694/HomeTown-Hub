'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import HometownScene from '@/components/3d/HometownScene';
import HeroFloatingWorld from '@/components/3d/HeroFloatingWorld';
import MemoryMap from '@/components/map/MemoryMap';
import { DEMO_MEMORIES } from '@/lib/mockData';
import { useLocationContext } from '@/lib/LocationContext';
import { Compass, MapPin, Users, Heart, Sparkles, Navigation, Search, ArrowRight, BookOpen, Calendar, ShieldCheck, User } from 'lucide-react';

export default function HomePage() {
  const { currentLocation, useMyLocation, setLocationBySlug } = useLocationContext();
  const [searchCityInput, setSearchCityInput] = useState('');

  const activeCity = currentLocation?.city || 'Hometown';

  const handleSearchCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCityInput.trim()) {
      setLocationBySlug(searchCityInput.trim().toLowerCase(), 'SEARCH');
      setSearchCityInput('');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* EDITORIAL HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-hub-cream via-hub-ivory to-hub-stone dark:from-[#202A24] dark:via-[#18201C] dark:to-[#27322B] border-b border-hub-border pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#27322B] border border-hub-terracotta/30 text-hub-terracotta text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-hub-terracotta" />
              <span>3D Digital Community Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-hub-charcoal leading-tight tracking-tight">
              Where your roots <br />
              <span className="text-hub-terracotta italic font-normal">stay connected.</span>
            </h1>

            <p className="text-base sm:text-lg text-hub-sage max-w-2xl leading-relaxed">
              Discover the people, oral histories, heritage landmarks, and living traditions that make <span className="font-semibold text-hub-charcoal">{activeCity}</span> home.
            </p>

            {/* HOMETOWN SEARCH BAR */}
            <form onSubmit={handleSearchCitySubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-hub-terracotta absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search your city, village, or hometown..."
                  value={searchCityInput}
                  onChange={(e) => setSearchCityInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#27322B] border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta shadow-xs"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Find Hometown</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={useMyLocation}
                className="px-3.5 py-1.5 rounded-full bg-hub-green/10 hover:bg-hub-green/20 border border-hub-green/30 text-hub-charcoal text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-hub-green" />
                <span>Use My Location (GPS)</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-hub-sage">
                <span>Popular:</span>
                {['Panipat', 'Jaipur', 'Amritsar', 'Delhi'].map((city) => (
                  <button
                    key={city}
                    onClick={() => setLocationBySlug(city.toLowerCase(), 'SEARCH')}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-[#27322B] border border-hub-border text-hub-charcoal hover:border-hub-terracotta text-[11px] font-medium"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* HERO QUICK DASHBOARD & FLOATING 3D HERO WORLD CARD */}
          <div className="lg:col-span-5 space-y-4">
            <HeroFloatingWorld />

            <div className="p-6 rounded-3xl bg-white dark:bg-[#27322B] border border-hub-border shadow-lg space-y-5 text-hub-charcoal">
              <div className="flex items-center justify-between border-b border-hub-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-hub-terracotta/10 text-hub-terracotta">
                    <Compass className="w-4 h-4" />
                  </span>
                  <h3 className="font-display font-semibold text-base">{activeCity} Quick Hub</h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-hub-terracotta bg-hub-terracotta/10 px-2.5 py-0.5 rounded-full">
                  Verified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-hub-cream border border-hub-border">
                  <div className="font-mono text-xl font-bold text-hub-terracotta">1,284</div>
                  <div className="text-[11px] text-hub-sage">Hometown Members</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-hub-cream border border-hub-border">
                  <div className="font-mono text-xl font-bold text-hub-terracotta">342</div>
                  <div className="text-[11px] text-hub-sage">Memories Preserved</div>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href={`/community/${currentLocation?.slug || 'panipat'}`}
                  className="w-full py-2.5 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Enter {activeCity} Community</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/community/${currentLocation?.slug || 'panipat'}/memory-map`}
                  className="w-full py-2.5 rounded-xl bg-hub-stone hover:bg-hub-border text-hub-charcoal font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-hub-terracotta" />
                  <span>Open {activeCity} Scrapbook Map</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 3D HANDCRAFTED DIORAMA SECTION */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-hub-terracotta font-bold uppercase tracking-wider">3D Exploration</span>
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-hub-charcoal">
                {activeCity.toUpperCase()} IN MINIATURE
              </h2>
            </div>
            <p className="text-xs text-hub-sage max-w-md">
              Orbit, zoom, and inspect stylized landmarks derived from real OpenStreetMap location data.
            </p>
          </div>

          <HometownScene />
        </section>

        {/* SCRAPBOOK MEMORY MAP PREVIEW SECTION */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-hub-terracotta font-bold uppercase tracking-wider">Living History</span>
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-hub-charcoal">
                {activeCity.toUpperCase()} SCRAPBOOK MAP™
              </h2>
            </div>
            <Link
              href={`/community/${currentLocation?.slug || 'panipat'}/memory-map`}
              className="text-xs text-hub-terracotta font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Fullscreen Scrapbook Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <MemoryMap initialMemories={DEMO_MEMORIES} communitySlug={currentLocation?.slug || 'panipat'} />
        </section>

        {/* HOMETOWN PEOPLE & RECONNECT PREVIEW */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-hub-terracotta font-bold uppercase tracking-wider">Hometown Network</span>
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-hub-charcoal">
                PEOPLE FROM {activeCity.toUpperCase()}
              </h2>
            </div>
            <Link
              href="/people"
              className="px-4 py-2 rounded-xl bg-hub-stone hover:bg-hub-border text-hub-charcoal text-xs font-semibold"
            >
              View All Alumni & Members
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Vikramaditya Rao', role: 'Cultural Architect', city: 'Panipat', lives: 'Delhi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
              { name: 'Priya Rathore', role: 'UI Designer & Writer', city: 'Jaipur', lives: 'Bengaluru', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
              { name: 'Pandit Devrat Sharma', role: 'Heritage Scholar', city: 'Panipat', lives: 'Panipat', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
            ].map((person, idx) => (
              <div key={idx} className="p-5 rounded-3xl bg-white dark:bg-[#27322B] border border-hub-border shadow-xs hover:shadow-md transition-all flex items-start gap-4">
                <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full object-cover border border-hub-border" />
                <div className="space-y-1">
                  <h4 className="font-display font-semibold text-base text-hub-charcoal">{person.name}</h4>
                  <p className="text-xs text-hub-terracotta font-medium">{person.role}</p>
                  <p className="text-[11px] text-hub-sage">Roots in {person.city} • Now in {person.lives}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CULTURAL PRESERVATION CALLOUT */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-hub-cream via-hub-stone to-hub-cream dark:from-[#202A24] dark:via-[#303C34] dark:to-[#202A24] border border-hub-border text-hub-charcoal flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-hub-terracotta font-bold text-xs uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Pandit & Cultural Scholar Network</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-semibold">Are you a keeper of local traditions?</h3>
            <p className="text-sm text-hub-sage leading-relaxed">
              Apply for a verified Pandit / Cultural Scholar badge to document oral histories, folk rituals, and heritage lore for future generations.
            </p>
          </div>

          <Link
            href="/cultural-contributor/onboarding"
            className="px-6 py-3 rounded-2xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-bold text-xs shadow-md whitespace-nowrap"
          >
            Apply for Verified Scholar Badge
          </Link>
        </section>
      </div>
    </div>
  );
}
