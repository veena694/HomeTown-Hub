'use client';

import React from 'react';
import { Compass, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FFFDF7] text-[#2C3531] min-h-screen flex items-center justify-center p-4">
        <div className="p-8 rounded-3xl bg-white border border-[#E2DDD5] shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#E8754F]/10 text-[#E8754F] flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#2C3531]">
              Hometown Hub Status
            </h2>
            <p className="text-xs text-[#5C6862] leading-relaxed">
              A temporary client-side component event occurred. Reloading the view will restore your session state immediately.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full py-3 rounded-xl bg-[#E8754F] hover:bg-[#D6643E] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Application State</span>
          </button>
        </div>
      </body>
    </html>
  );
}
