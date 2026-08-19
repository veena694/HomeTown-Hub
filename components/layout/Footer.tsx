import React from 'react';
import Link from 'next/link';
import { Compass, Heart, MapPin, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-hub-cream border-t border-hub-border text-hub-charcoal py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-hub-terracotta flex items-center justify-center text-white font-bold shadow-sm">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-base text-hub-charcoal">HOMETOWN HUB</span>
          </div>
          <p className="text-xs text-hub-sage leading-relaxed">
            Where your roots stay connected. A warm, interactive digital platform preserving local history, memory maps, and community ties.
          </p>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm text-hub-charcoal mb-3">Explore</h4>
          <ul className="space-y-2 text-xs text-hub-sage">
            <li><Link href="/" className="hover:text-hub-terracotta transition-colors">Home Diorama</Link></li>
            <li><Link href="/hometown-today" className="hover:text-hub-terracotta transition-colors">Hometown Today</Link></li>
            <li><Link href="/communities" className="hover:text-hub-terracotta transition-colors">Hometown Communities</Link></li>
            <li><Link href="/people" className="hover:text-hub-terracotta transition-colors">Reconnect Directory</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm text-hub-charcoal mb-3">Preserve & Learn</h4>
          <ul className="space-y-2 text-xs text-hub-sage">
            <li><Link href="/cultural-contributor/onboarding" className="hover:text-hub-terracotta transition-colors">Pandit & Cultural Hub</Link></li>
            <li><Link href="/onboarding" className="hover:text-hub-terracotta transition-colors">Find Your Hometown</Link></li>
            <li><Link href="/notifications" className="hover:text-hub-terracotta transition-colors">Community Updates</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm text-hub-charcoal">Rooted in Tradition</h4>
          <div className="p-3.5 rounded-2xl bg-white border border-hub-border text-xs text-hub-sage space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-hub-terracotta font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Preserving Memory</span>
            </div>
            <p className="text-[11px]">Empowering diaspora members and local residents to record oral histories & photos.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-hub-border flex flex-col sm:flex-row items-center justify-between text-xs text-hub-sage gap-2">
        <p>© 2026 Hometown Hub. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-hub-terracotta fill-hub-terracotta" /> for roots across the globe.
        </p>
      </div>
    </footer>
  );
}
