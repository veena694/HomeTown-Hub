'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { DemoMemory } from '@/lib/mockData';
import { MapPin } from 'lucide-react';

const MemoryMapInner = dynamic(() => import('./MemoryMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-3xl bg-slate-900 border border-white/10 flex flex-col items-center justify-center text-slate-400 gap-3">
      <MapPin className="w-8 h-8 text-amber-400 animate-bounce" />
      <span className="text-xs font-mono">Initializing Hometown Memory Map™ tiles...</span>
    </div>
  ),
});

export default function MemoryMap({
  initialMemories,
  communitySlug,
}: {
  initialMemories: DemoMemory[];
  communitySlug: string;
}) {
  return <MemoryMapInner initialMemories={initialMemories} communitySlug={communitySlug} />;
}
