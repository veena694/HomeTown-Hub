'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, X, Home, Briefcase, Sparkles, Check } from 'lucide-react';
import { useLocationContext, LocationData, getCoordinatesForCity } from '@/lib/LocationContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationEditorModal({ isOpen, onClose }: Props) {
  const { homeLocation, nowLocation, setHomeLocation, setNowLocation, setLocationData, refreshProfileLocations } = useLocationContext();

  const [homeCityInput, setHomeCityInput] = useState('');
  const [homeStateInput, setHomeStateInput] = useState('');
  const [nowCityInput, setNowCityInput] = useState('');
  const [nowStateInput, setNowStateInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (homeLocation) {
      setHomeCityInput(homeLocation.city);
      setHomeStateInput(homeLocation.state);
    }
    if (nowLocation) {
      setNowCityInput(nowLocation.city);
      setNowStateInput(nowLocation.state);
    }
  }, [homeLocation, nowLocation, isOpen]);

  if (!isOpen) return null;

  const handleUseGPSForNow = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setNowCityInput('My Nearby Location');
          setNowStateInput('Nearby Area');
          setMessage('GPS coordinates captured for current residence!');
        },
        () => {
          alert('GPS permission denied or unavailable.');
        }
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeCityInput.trim() || !nowCityInput.trim()) {
      setMessage('Please enter both your Hometown (Home) and Current Residence (Now).');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hometownCity: homeCityInput.trim(),
          hometownState: homeStateInput.trim() || 'India',
          currentCity: nowCityInput.trim(),
          currentState: nowStateInput.trim() || 'India',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const homeCoords = getCoordinatesForCity(homeCityInput);
        const nowCoords = getCoordinatesForCity(nowCityInput);

        const newHomeObj: LocationData = {
          id: `loc-home-${Date.now()}`,
          slug: homeCityInput.toLowerCase().replace(/\s+/g, '-'),
          name: `${homeCityInput} Hometown Hub`,
          city: homeCityInput.trim(),
          district: homeCityInput.trim(),
          state: homeStateInput.trim() || 'India',
          country: 'India',
          latitude: homeCoords.lat,
          longitude: homeCoords.lng,
          themeAccent: '#E8754F',
        };

        const newNowObj: LocationData = {
          id: `loc-now-${Date.now()}`,
          slug: nowCityInput.toLowerCase().replace(/\s+/g, '-'),
          name: `${nowCityInput} Diaspora Hub`,
          city: nowCityInput.trim(),
          district: nowCityInput.trim(),
          state: nowStateInput.trim() || 'India',
          country: 'India',
          latitude: nowCoords.lat,
          longitude: nowCoords.lng,
          themeAccent: '#3B82F6',
        };

        setHomeLocation(newHomeObj);
        setNowLocation(newNowObj);
        setLocationData(newHomeObj, 'PROFILE_HOME');

        await refreshProfileLocations();

        alert('Your Hometown & Current Residence locations were saved to PostgreSQL successfully!');
        onClose();
      } else {
        setMessage(data.error || 'Failed to update locations. Please ensure you are logged in.');
      }
    } catch {
      setMessage('Network error updating locations.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#27322B] border border-hub-border rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-hub-charcoal animate-accordion-down">
        <div className="flex items-center justify-between border-b border-hub-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-hub-terracotta/10 text-hub-terracotta flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-hub-charcoal">Edit Your Profile Locations</h3>
              <p className="text-xs text-hub-sage">Define your Roots (Home) & Current Living City (Now)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-hub-stone hover:bg-hub-border text-hub-sage hover:text-hub-charcoal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* HOME LOCATION SECTION */}
          <div className="p-4 rounded-2xl bg-hub-cream dark:bg-[#202A24] border border-hub-border space-y-3">
            <div className="flex items-center gap-2 text-hub-terracotta font-semibold text-xs font-mono uppercase tracking-wider">
              <Home className="w-4 h-4 text-hub-terracotta" />
              <span>🏡 HOME (Roots / Original Hometown)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-hub-charcoal mb-1">City / Town *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Patna, Amritsar, Jaipur..."
                  value={homeCityInput}
                  onChange={(e) => setHomeCityInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#27322B] border border-hub-border text-xs text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-hub-charcoal mb-1">State / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Bihar, Punjab, Rajasthan..."
                  value={homeStateInput}
                  onChange={(e) => setHomeStateInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#27322B] border border-hub-border text-xs text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />
              </div>
            </div>
          </div>

          {/* NOW LOCATION SECTION */}
          <div className="p-4 rounded-2xl bg-hub-cream dark:bg-[#202A24] border border-hub-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-hub-sky font-semibold text-xs font-mono uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-hub-sky" />
                <span>📍 NOW (Current Living Residence)</span>
              </div>
              <button
                type="button"
                onClick={handleUseGPSForNow}
                className="px-2.5 py-1 rounded-lg bg-hub-green/10 text-hub-green hover:bg-hub-green/20 text-[10px] font-bold flex items-center gap-1 border border-hub-green/30"
              >
                <Navigation className="w-3 h-3" />
                <span>Use GPS</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-hub-charcoal mb-1">City / Town *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gurugram, Bengaluru, Delhi..."
                  value={nowCityInput}
                  onChange={(e) => setNowCityInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#27322B] border border-hub-border text-xs text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-hub-charcoal mb-1">State / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Haryana, Karnataka, Delhi..."
                  value={nowStateInput}
                  onChange={(e) => setNowStateInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#27322B] border border-hub-border text-xs text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />
              </div>
            </div>
          </div>

          {message && <p className="text-xs text-hub-terracotta font-medium">{message}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-hub-stone text-hub-charcoal text-xs font-semibold hover:bg-hub-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Locations...' : 'Save Locations to Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
