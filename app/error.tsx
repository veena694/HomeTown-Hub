'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Compass, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Hometown Hub Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12 text-hub-charcoal">
      <div className="p-6 rounded-3xl bg-white dark:bg-[#27322B] border border-hub-border shadow-xl max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-hub-terracotta/10 text-hub-terracotta flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 animate-spin" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-display font-bold text-hub-charcoal">
            Temporary Visual Notice
          </h2>
          <p className="text-xs text-hub-sage leading-relaxed">
            Hometown Hub encountered a minor runtime interruption while rendering visuals. Your connection and saved data remain completely safe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Visuals</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-hub-stone border border-hub-border text-hub-charcoal text-xs font-semibold hover:bg-hub-border flex items-center justify-center gap-2 transition-all min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
