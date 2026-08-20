'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, MapPin, Sparkles, User } from 'lucide-react';
import { useLocationContext } from '@/lib/LocationContext';

export default function PeoplePage() {
  const { currentLocation } = useLocationContext();
  const activeCity = currentLocation?.city || 'Hometown';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SAME_HOMETOWN' | 'SAME_NOW'>('ALL');
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/people')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setPeople(data.users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredPeople = people.filter((p) => {
    const matchesSearch = searchQuery
      ? p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.hometownCity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.currentCity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.school?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    if (!matchesSearch) return false;

    if (filterType === 'SAME_HOMETOWN') {
      return p.hometownCity?.toLowerCase() === activeCity.toLowerCase();
    }
    if (filterType === 'SAME_NOW') {
      return p.currentCity?.toLowerCase() === activeCity.toLowerCase();
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-hub-charcoal">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hub-border pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hub-terracotta/10 text-hub-terracotta text-xs font-mono font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>Alumni & Diaspora Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-hub-charcoal">
            RECONNECT WITH {activeCity.toUpperCase()}
          </h1>
          <p className="text-sm text-hub-sage">
            Find school alumni, childhood friends, and fellow hometown members living worldwide.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-hub-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, school, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-[#27322B] border border-hub-border text-xs text-hub-charcoal focus:outline-none focus:border-hub-terracotta w-64 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'ALL'
              ? 'bg-hub-terracotta text-white shadow-xs'
              : 'bg-hub-stone text-hub-sage hover:text-hub-charcoal'
          }`}
        >
          All Members ({people.length})
        </button>
        <button
          onClick={() => setFilterType('SAME_HOMETOWN')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'SAME_HOMETOWN'
              ? 'bg-hub-terracotta text-white shadow-xs'
              : 'bg-hub-stone text-hub-sage hover:text-hub-charcoal'
          }`}
        >
          From {activeCity} ({people.filter((p) => p.hometownCity?.toLowerCase() === activeCity.toLowerCase()).length})
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-hub-sage">
          <Sparkles className="w-6 h-6 text-hub-terracotta mx-auto animate-spin" />
          <p className="mt-2 text-xs font-mono">Loading alumni & hometown members...</p>
        </div>
      ) : filteredPeople.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#27322B] border border-hub-border space-y-2">
          <User className="w-8 h-8 text-hub-sage mx-auto" />
          <h3 className="font-display font-semibold text-base">No members found matching filter</h3>
          <p className="text-xs text-hub-sage">Try searching another name, school, or hometown city.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#27322B] border border-hub-border shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-hub-terracotta text-white font-bold text-lg flex items-center justify-center border border-hub-border flex-shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-hub-charcoal">{p.name}</h3>
                    <p className="text-xs text-hub-terracotta font-medium">{p.profession || 'Community Member'}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-hub-sage border-t border-hub-border pt-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-hub-terracotta flex-shrink-0" />
                    <span>Hometown: <strong>{p.hometownCity || 'Hometown'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-hub-sky flex-shrink-0" />
                    <span>Living in: <strong>{p.currentCity || 'Current City'}</strong></span>
                  </div>
                </div>
              </div>

              <Link
                href={`/profile/${p.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="w-full py-2 rounded-xl bg-hub-stone hover:bg-hub-border text-hub-charcoal text-xs font-semibold text-center block transition-colors"
              >
                View Profile & Connect
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
