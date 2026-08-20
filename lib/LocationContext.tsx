'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { DEMO_COMMUNITIES } from '@/lib/mockData';

export interface LocationData {
  id: string;
  slug: string;
  name: string;
  city: string;
  district: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  themeAccent: string;
}

export interface PlaceData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  type?: string;
  address?: string;
  description?: string;
  osmId?: string | number;
  tags?: any;
}

export type LocationSource = 'CURRENT_LOCATION' | 'SEARCH' | 'SAVED_HOMETOWN' | 'PROFILE_HOME' | 'PROFILE_NOW' | 'DEFAULT';

interface LocationContextType {
  currentLocation: LocationData | null;
  locationSource: LocationSource;
  recentLocations: LocationData[];
  homeLocation: LocationData | null;
  nowLocation: LocationData | null;
  selectedPlace: PlaceData | null;
  profileLoading: boolean;
  user: any;
  setSelectedPlace: (place: PlaceData | null) => void;
  setLocationBySlug: (slug: string, source?: LocationSource) => void;
  setLocationData: (data: LocationData, source?: LocationSource) => void;
  useMyLocation: () => void;
  setHomeLocation: (loc: LocationData) => void;
  setNowLocation: (loc: LocationData) => void;
  switchToHome: () => void;
  switchToNow: () => void;
  refreshProfileLocations: () => Promise<void>;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  panipat: { lat: 29.3909, lng: 76.9635 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  amritsar: { lat: 31.634, lng: 74.8723 },
  delhi: { lat: 28.6139, lng: 77.209 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  patna: { lat: 25.5941, lng: 85.1376 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
};

export function getCoordinatesForCity(cityName: string): { lat: number; lng: number } {
  const normalized = cityName.trim().toLowerCase();
  if (CITY_COORDINATES[normalized]) {
    return CITY_COORDINATES[normalized];
  }
  // Deterministic pseudo-coordinates for non-preset cities so they map accurately
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lat = 20 + Math.abs((hash % 1200) / 100);
  const lng = 73 + Math.abs(((hash >> 3) % 1500) / 100);
  return { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) };
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocationState] = useState<LocationData | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource>('DEFAULT');
  const [recentLocations, setRecentLocations] = useState<LocationData[]>([]);
  const [homeLocation, setHomeLocationState] = useState<LocationData | null>(null);
  const [nowLocation, setNowLocationState] = useState<LocationData | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const createLocationObj = useCallback((city: string, state: string = 'India', type: 'HOME' | 'NOW' | 'EXPLORE' = 'EXPLORE'): LocationData => {
    const cleanCity = city.trim();
    const cleanState = state.trim() || 'India';
    const slug = cleanCity.toLowerCase().replace(/\s+/g, '-');
    const coords = getCoordinatesForCity(cleanCity);
    const accent = type === 'HOME' ? '#E8754F' : type === 'NOW' ? '#3B82F6' : '#F59E0B';

    return {
      id: `loc-${type.toLowerCase()}-${slug}`,
      slug,
      name: `${cleanCity} Hometown Hub`,
      city: cleanCity,
      district: cleanCity,
      state: cleanState,
      country: 'India',
      latitude: coords.lat,
      longitude: coords.lng,
      themeAccent: accent,
    };
  }, []);

  const refreshProfileLocations = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();

      if (data.user) {
        setUser(data.user);
        const p = data.user.profile;

        if (p && p.hometownCity) {
          const homeObj = createLocationObj(p.hometownCity, p.hometownState || 'India', 'HOME');
          setHomeLocationState(homeObj);
          try {
            localStorage.setItem('hh_home_location', JSON.stringify(homeObj));
          } catch {}

          // If no explore location set yet, set home as default explore location for logged in user
          setCurrentLocationState((prev) => {
            if (!prev || locationSource === 'DEFAULT' || locationSource === 'PROFILE_HOME') {
              setLocationSource('PROFILE_HOME');
              return homeObj;
            }
            return prev;
          });
        }

        if (p && p.currentCity) {
          const nowObj = createLocationObj(p.currentCity, p.currentState || 'India', 'NOW');
          setNowLocationState(nowObj);
          try {
            localStorage.setItem('hh_now_location', JSON.stringify(nowObj));
          } catch {}
        }
      } else {
        setUser(null);
        // Guest mode fallback initialization
        const savedLoc = localStorage.getItem('hh_current_location');
        if (savedLoc) {
          try {
            setCurrentLocationState(JSON.parse(savedLoc));
            setLocationSource('SAVED_HOMETOWN');
          } catch {}
        } else {
          const demoComm = DEMO_COMMUNITIES[0];
          setCurrentLocationState(createLocationObj(demoComm.city, demoComm.state, 'EXPLORE'));
        }
      }
    } catch {
    } finally {
      setProfileLoading(false);
    }
  }, [createLocationObj, locationSource]);

  useEffect(() => {
    // 1. Initial Auth & Profile Fetch
    refreshProfileLocations();

    // 2. Setup BroadcastChannel for Multi-Tab Sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('hh_location_sync');
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'LOCATION_UPDATED') {
          refreshProfileLocations();
        }
      };
    }

    // 3. Setup localStorage Storage Event Listener (Fallback cross-tab listener)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hh_location_update_event') {
        refreshProfileLocations();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 4. Setup Tab Visibility & Focus Listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshProfileLocations();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshProfileLocations]);

  const notifyOtherTabs = () => {
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'LOCATION_UPDATED', timestamp: Date.now() });
    }
    try {
      localStorage.setItem('hh_location_update_event', Date.now().toString());
    } catch {}
  };

  const setLocationData = (loc: LocationData, source: LocationSource = 'SEARCH') => {
    setCurrentLocationState(loc);
    setLocationSource(source);
    setSelectedPlace(null); // Reset place selection when switching cities

    try {
      localStorage.setItem('hh_current_location', JSON.stringify(loc));
      setRecentLocations((prev) => {
        const filtered = prev.filter((item) => item.city.toLowerCase() !== loc.city.toLowerCase());
        const updated = [loc, ...filtered].slice(0, 5);
        localStorage.setItem('hh_recent_locations', JSON.stringify(updated));
        return updated;
      });
    } catch {}
  };

  const setLocationBySlug = (slug: string, source: LocationSource = 'SEARCH') => {
    const foundComm = DEMO_COMMUNITIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase() || c.city.toLowerCase() === slug.toLowerCase());
    if (foundComm) {
      const loc = createLocationObj(foundComm.city, foundComm.state, 'EXPLORE');
      setLocationData(loc, source);
    } else {
      const formattedCity = slug.charAt(0).toUpperCase() + slug.slice(1);
      const loc = createLocationObj(formattedCity, 'India', 'EXPLORE');
      setLocationData(loc, source);
    }
  };

  const useMyLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(4));
          const lng = Number(position.coords.longitude.toFixed(4));
          const userLoc: LocationData = {
            id: `loc-geo-${Date.now()}`,
            slug: 'current-location',
            name: 'Current GPS Location',
            city: 'My Nearby Location',
            district: 'Local Area',
            state: 'Nearby Region',
            country: 'India',
            latitude: lat,
            longitude: lng,
            themeAccent: '#10B981',
          };
          setLocationData(userLoc, 'CURRENT_LOCATION');
        },
        () => {
          alert('Geolocation permission denied or unavailable. Please enter your location manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const setHomeLocation = (loc: LocationData) => {
    setHomeLocationState(loc);
    try {
      localStorage.setItem('hh_home_location', JSON.stringify(loc));
    } catch {}
    notifyOtherTabs();
  };

  const setNowLocation = (loc: LocationData) => {
    setNowLocationState(loc);
    try {
      localStorage.setItem('hh_now_location', JSON.stringify(loc));
    } catch {}
    notifyOtherTabs();
  };

  const switchToHome = () => {
    if (homeLocation) {
      setLocationData(homeLocation, 'PROFILE_HOME');
    }
  };

  const switchToNow = () => {
    if (nowLocation) {
      setLocationData(nowLocation, 'PROFILE_NOW');
    }
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        locationSource,
        recentLocations,
        homeLocation,
        nowLocation,
        selectedPlace,
        profileLoading,
        user,
        setSelectedPlace,
        setLocationBySlug,
        setLocationData,
        useMyLocation,
        setHomeLocation,
        setNowLocation,
        switchToHome,
        switchToNow,
        refreshProfileLocations,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
