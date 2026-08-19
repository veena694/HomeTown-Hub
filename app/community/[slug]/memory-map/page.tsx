'use client';

import React from 'react';
import MemoryMap from '@/components/map/MemoryMap';
import { DEMO_MEMORIES } from '@/lib/mockData';
import { useLocationContext } from '@/lib/LocationContext';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function MemoryMapPage({ params }: { params: { slug: string } }) {
  const { currentLocation, setLocationBySlug } = useLocationContext();
  const { slug } = params;

  React.useEffect(() => {
    setLocationBySlug(slug, 'SEARCH');
  }, [slug]);

  const activeCity = currentLocation?.city || slug.toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-hub-charcoal">
      <div className="flex items-center justify-between">
        <Link href={`/community/${slug}`} className="inline-flex items-center gap-1 text-xs text-hub-sage hover:text-hub-charcoal">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {activeCity} Community</span>
        </Link>
        <span className="text-xs font-mono font-bold text-hub-terracotta flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Scrapbook Map Mode</span>
        </span>
      </div>

      <MemoryMap initialMemories={DEMO_MEMORIES} communitySlug={slug} />
    </div>
  );
}
