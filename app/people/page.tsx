'use client';

import React, { useState, useEffect } from 'react';
import { useLocationContext } from '@/lib/LocationContext';
import { User, MapPin, Search, Briefcase, GraduationCap, Sparkles, Filter } from 'lucide-react';

export default function PeoplePage() {
  const { currentLocation } = useLocationContext();
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const activeCity = currentLocation?.city || 'Panipat';

  useEffect(() => {
    fetch(`/api/people?hometown=${encodeURIComponent(activeCity)}&search=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCity, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-hub-charcoal">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-hub-border pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hub-terracotta/10 text-hub-terracotta text-xs font-mono font-bold">
            <User className="w-3.5 h-3.5" />
            <span>Hometown Alumni & Diaspora Reconnect</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-hub-charcoal">
            PEOPLE FROM {activeCity.toUpperCase()}
          </h1>
          <p className="text-xs sm:text-sm text-hub-sage max-w-xl">
            Discover fellow members who share your roots in {activeCity}, living locally or across global cities.
          </p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-hub-sage absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, profession, or school..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-hub-border text-xs text-hub-charcoal focus:outline-none focus:border-hub-terracotta shadow-2xs"
        />
      </div>

      {/* PEOPLE GRID */}
      {loading ? (
        <div className="p-12 text-center text-hub-sage text-xs font-mono">
          <Sparkles className="w-5 h-5 text-hub-terracotta mx-auto animate-spin mb-2" />
          <span>Searching reconnect directory...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((person) => {
            const p = person.profile || {};
            return (
              <div key={person.id} className="p-6 rounded-3xl bg-white border border-hub-border shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={p.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                    alt={person.name}
                    className="w-14 h-14 rounded-full object-cover border border-hub-border"
                  />
                  <div>
                    <h3 className="font-display font-semibold text-lg text-hub-charcoal">{person.name}</h3>
                    <p className="text-xs text-hub-terracotta font-medium flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {p.profession || 'Community Member'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-hub-sage bg-hub-cream p-3.5 rounded-2xl border border-hub-border">
                  <div className="flex items-center gap-1.5 text-hub-charcoal">
                    <MapPin className="w-3.5 h-3.5 text-hub-terracotta" />
                    <span>Hometown: <strong>{p.hometownCity || 'Panipat'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-hub-sage text-[11px]">
                    <span>Now living in: <strong>{p.currentCity || 'Delhi'}</strong></span>
                  </div>
                  {p.school && (
                    <div className="flex items-center gap-1.5 text-[11px] pt-1 border-t border-hub-border">
                      <GraduationCap className="w-3.5 h-3.5 text-hub-sage" />
                      <span>{p.school} {p.gradYear ? `('${p.gradYear.toString().slice(-2)})` : ''}</span>
                    </div>
                  )}
                </div>

                {p.bio && <p className="text-xs text-hub-sage line-clamp-2 italic">"{p.bio}"</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
