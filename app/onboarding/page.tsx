'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocationContext } from '@/lib/LocationContext';
import { Compass, MapPin, ArrowRight, Sparkles, Navigation } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { setLocationBySlug, useMyLocation } = useLocationContext();

  const [step, setStep] = useState(1);
  const [hometownInput, setHometownInput] = useState('');
  const [currentCityInput, setCurrentCityInput] = useState('');

  const handleFinishOnboarding = () => {
    if (hometownInput.trim()) {
      setLocationBySlug(hometownInput.trim().toLowerCase(), 'SAVED_HOMETOWN');
    }
    router.push('/hometown-today');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6 text-hub-charcoal">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-hub-terracotta to-hub-marigold flex items-center justify-center text-white font-bold mx-auto shadow-md">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-display font-bold text-hub-charcoal">FIND YOUR HOMETOWN</h1>
        <p className="text-xs text-hub-sage">Step {step} of 2 • Tell us where your roots are connected</p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-hub-border shadow-sm space-y-6">
        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-hub-charcoal mb-1">What is your original Hometown / Roots City? *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-hub-terracotta absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Panipat, Jaipur, Amritsar..."
                  value={hometownInput}
                  onChange={(e) => setHometownInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />
              </div>
            </div>

            <button
              onClick={useMyLocation}
              className="w-full py-2.5 rounded-xl bg-hub-green/10 hover:bg-hub-green/20 border border-hub-green/30 text-hub-charcoal text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4 text-hub-green" />
              <span>Use My Current Location (GPS)</span>
            </button>

            <button
              onClick={() => setStep(2)}
              disabled={!hometownInput.trim()}
              className="w-full py-3 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Next: Where do you live now?</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-hub-charcoal mb-1">Where do you live currently? (Diaspora City)</label>
              <input
                type="text"
                placeholder="e.g. Delhi, Bengaluru, Mumbai, London..."
                value={currentCityInput}
                onChange={(e) => setCurrentCityInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
              />
            </div>

            <button
              onClick={handleFinishOnboarding}
              className="w-full py-3 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enter My Hometown Hub</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
