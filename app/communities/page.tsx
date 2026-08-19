'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocationContext } from '@/lib/LocationContext';
import { Users, MapPin, Plus, Search, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CommunitiesPage() {
  const { currentLocation } = useLocationContext();
  const [communities, setCommunities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCity = currentLocation?.city || 'Panipat';

  useEffect(() => {
    fetch(`/api/communities?search=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => setCommunities(data.communities || []))
      .catch(() => {});
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-hub-charcoal">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-hub-border pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hub-terracotta/10 text-hub-terracotta text-xs font-mono font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>Hometown Communities Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-hub-charcoal">
            EXPLORE HOMETOWN HUBS
          </h1>
          <p className="text-xs sm:text-sm text-hub-sage max-w-xl">
            Connect with local residents, alumni, and diaspora communities across India and global cities.
          </p>
        </div>

        <Link
          href="/communities/create"
          className="px-5 py-2.5 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Hometown Hub</span>
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-hub-sage absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by city, town, state, or community name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-hub-border text-xs text-hub-charcoal focus:outline-none focus:border-hub-terracotta shadow-2xs"
        />
      </div>

      {/* COMMUNITIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((c: any) => {
          const isCurrentActive = c.city.toLowerCase() === activeCity.toLowerCase();
          return (
            <div
              key={c.id}
              className={`p-6 rounded-3xl bg-white border ${
                isCurrentActive ? 'border-hub-terracotta shadow-md' : 'border-hub-border shadow-xs'
              } hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-hub-cream text-hub-terracotta border border-hub-border">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-hub-charcoal">{c.name}</h3>
                      <p className="text-xs text-hub-terracotta font-mono font-medium">{c.city}, {c.state}</p>
                    </div>
                  </div>
                  {c.isVerified && (
                    <span className="p-1 rounded-full bg-hub-green/10 text-hub-green" title="Verified Hometown Hub">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-hub-sage leading-relaxed line-clamp-3">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-hub-border flex items-center justify-between">
                <div className="text-[11px] text-hub-sage font-mono">
                  <span className="font-bold text-hub-charcoal">{c.memberCount || 0}</span> Members •{' '}
                  <span className="font-bold text-hub-charcoal">{c.memoryCount || 0}</span> Memories
                </div>

                <Link
                  href={`/community/${c.slug}`}
                  className="px-3.5 py-1.5 rounded-xl bg-hub-cream hover:bg-hub-stone text-hub-charcoal text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Enter Hub</span>
                  <ArrowRight className="w-3.5 h-3.5 text-hub-terracotta" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
