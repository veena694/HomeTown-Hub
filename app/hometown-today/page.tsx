'use client';

import React, { useState, useEffect } from 'react';
import HometownDashboardWidget from '@/components/3d/HometownDashboardWidget';
import { useLocationContext } from '@/lib/LocationContext';
import { MapPin, Calendar, Users, Sparkles, BookOpen, Clock, Heart, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function HometownTodayPage() {
  const { currentLocation } = useLocationContext();
  const [events, setEvents] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const activeCity = currentLocation?.city || 'Panipat';
  const activeSlug = currentLocation?.slug || 'panipat';

  useEffect(() => {
    fetch(`/api/events?communitySlug=${activeSlug}`)
      .then((res) => res.json())
      .then((data) => setEvents(data.events || []))
      .catch(() => {});

    fetch(`/api/memories?communitySlug=${activeSlug}`)
      .then((res) => res.json())
      .then((data) => setMemories(data.memories || []))
      .catch(() => {});

    fetch(`/api/posts?communitySlug=${activeSlug}`)
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => {});
  }, [activeSlug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-hub-charcoal">
      {/* NEWSPAPER MASTHEAD HEADER */}
      <div className="text-center space-y-3 border-b border-hub-border pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hub-terracotta/10 text-hub-terracotta text-xs font-mono font-bold">
          <Calendar className="w-3.5 h-3.5" />
          <span>DAILY HOMETOWN CHRONICLE • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-hub-charcoal uppercase tracking-tight">
          YOUR {activeCity.toUpperCase()} TODAY
        </h1>
        <p className="text-sm text-hub-sage max-w-xl mx-auto">
          The official daily pulse, historical memory highlights, upcoming gatherings, and community stories for {activeCity}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT EDITORIAL MAIN COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          {/* ANNOUNCEMENT / FEATURED STORY */}
          {posts.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-hub-border shadow-sm space-y-3">
              <span className="px-3 py-1 rounded-full bg-hub-terracotta text-white text-[10px] font-mono font-bold uppercase">
                {posts[0].type || 'ANNOUNCEMENT'}
              </span>
              <h2 className="text-2xl font-display font-semibold text-hub-charcoal">{posts[0].title}</h2>
              <p className="text-sm text-hub-sage leading-relaxed">{posts[0].content}</p>
              <div className="flex items-center justify-between pt-2 text-xs text-hub-sage border-t border-hub-border">
                <span>Posted by {posts[0].author?.name || 'Community Curator'}</span>
                <span className="flex items-center gap-1 text-hub-terracotta">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {posts[0].comments?.length || 0} Replies
                </span>
              </div>
            </div>
          )}

          {/* TODAY'S MEMORY HIGHLIGHTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-semibold text-hub-charcoal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-hub-terracotta" />
                Preserved Memories from {activeCity}
              </h3>
              <Link href={`/community/${activeSlug}/memory-map`} className="text-xs text-hub-terracotta font-semibold hover:underline">
                Explore Scrapbook Map →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {memories.slice(0, 4).map((m: any) => (
                <div key={m.id} className="p-5 rounded-3xl bg-white border border-hub-border shadow-xs hover:shadow-md transition-all space-y-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-hub-cream border border-hub-border text-hub-terracotta text-[10px] font-mono font-bold">
                    {m.category} • Year {m.year}
                  </span>
                  <h4 className="font-display font-semibold text-base text-hub-charcoal">{m.title}</h4>
                  <p className="text-xs text-hub-sage line-clamp-3 leading-relaxed">"{m.story}"</p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-hub-sage border-t border-hub-border">
                    <span>By {m.authorName}</span>
                    <span className="flex items-center gap-1 text-hub-terracotta font-bold">
                      <Heart className="w-3.5 h-3.5 fill-hub-terracotta" />
                      {m.likesCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          {/* 3D DIORAMA WIDGET */}
          <HometownDashboardWidget hometownName={activeCity} />

          {/* UPCOMING COMMUNITY EVENTS */}
          <div className="p-6 rounded-3xl bg-white border border-hub-border shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-lg text-hub-charcoal flex items-center gap-2">
              <Calendar className="w-4 h-4 text-hub-terracotta" />
              Upcoming Gatherings
            </h3>

            <div className="space-y-3">
              {events.slice(0, 3).map((e: any) => (
                <div key={e.id} className="p-3.5 rounded-2xl bg-hub-cream border border-hub-border space-y-1 text-xs">
                  <div className="font-semibold text-hub-charcoal">{e.title}</div>
                  <div className="text-hub-terracotta text-[11px] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {e.venue}
                  </div>
                  <div className="text-hub-sage text-[10px] font-bold">{e.attendeesCount} RSVP Confirmed</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
