'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_COMMUNITIES, DemoCommunity } from '@/lib/mockData';

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
  setSelectedPlace: (place: PlaceData | null) => void;
  setLocationBySlug: (slug: string, source?: LocationSource) => void;
  setLocationData: (data: LocationData, source?: LocationSource) => void;
  useMyLocation: () => void;
  setHomeLocation: (loc: LocationData) => void;
  setNowLocation: (loc: LocationData) => void;
  switchToHome: () => void;
  switchToNow: () => void;
}

const COMMUNITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  panipat: { lat: 29.3909, lng: 76.9635 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  amritsar: { lat: 31.634, lng: 74.8723 },
  delhi: { lat: 28.6139, lng: 77.209 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocationState] = useState<LocationData | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource>('DEFAULT');
  const [recentLocations, setRecentLocations] = useState<LocationData[]>([]);
  const [homeLocation, setHomeLocationState] = useState<LocationData | null>(null);
  const [nowLocation, setNowLocationState] = useState<LocationData | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);

  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem('hh_current_location');
      const savedHome = localStorage.getItem('hh_home_location');
      const savedNow = localStorage.getItem('hh_now_location');
      const savedRecent = localStorage.getItem('hh_recent_locations');

      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        setCurrentLocationState(parsed);
        setLocationSource('SAVED_HOMETOWN');
      } else {
        const defaultComm = DEMO_COMMUNITIES[0];
        const coords = COMMUNITY_COORDINATES[defaultComm.slug] || { lat: 29.3909, lng: 76.9635 };
        const locObj: LocationData = {
          id: defaultComm.id,
          slug: defaultComm.slug,
          name: defaultComm.name,
          city: defaultComm.city,
          district: defaultComm.district,
          state: defaultComm.state,
          country: defaultComm.country,
          latitude: coords.lat,
          longitude: coords.lng,
          themeAccent: defaultComm.themeAccent,
        };
        setCurrentLocationState(locObj);
      }

      if (savedHome) setHomeLocationState(JSON.parse(savedHome));
      else {
        const panipat = DEMO_COMMUNITIES[0];
        const homeObj = {
          id: panipat.id,
          slug: panipat.slug,
          name: panipat.name,
          city: panipat.city,
          district: panipat.district,
          state: panipat.state,
          country: panipat.country,
          latitude: 29.3909,
          longitude: 76.9635,
          themeAccent: panipat.themeAccent,
        };
        setHomeLocationState(homeObj);
      }

      if (savedNow) setNowLocationState(JSON.parse(savedNow));
      else {
        const bng = {
          id: 'comm-bng',
          slug: 'bengaluru',
          name: 'Bengaluru Diaspora Hub',
          city: 'Bengaluru',
          district: 'Bengaluru Urban',
          state: 'Karnataka',
          country: 'India',
          latitude: 12.9716,
          longitude: 77.5946,
          themeAccent: '#3B82F6',
        };
        setNowLocationState(bng);
      }

      if (savedRecent) setRecentLocations(JSON.parse(savedRecent));
    } catch {}
  }, []);

  const setLocationData = (loc: LocationData, source: LocationSource = 'SEARCH') => {
    setCurrentLocationState(loc);
    setLocationSource(source);
    setSelectedPlace(null); // Clear selected place on city change

    try {
      localStorage.setItem('hh_current_location', JSON.stringify(loc));
      setRecentLocations((prev) => {
        const filtered = prev.filter((item) => item.slug !== loc.slug);
        const updated = [loc, ...filtered].slice(0, 5);
        localStorage.setItem('hh_recent_locations', JSON.stringify(updated));
        return updated;
      });
    } catch {}
  };

  const setLocationBySlug = (slug: string, source: LocationSource = 'SEARCH') => {
    const foundComm = DEMO_COMMUNITIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
    const coords = COMMUNITY_COORDINATES[slug.toLowerCase()] || { lat: 29.3909, lng: 76.9635 };

    if (foundComm) {
      const loc: LocationData = {
        id: foundComm.id,
        slug: foundComm.slug,
        name: foundComm.name,
        city: foundComm.city,
        district: foundComm.district,
        state: foundComm.state,
        country: foundComm.country,
        latitude: coords.lat,
        longitude: coords.lng,
        themeAccent: foundComm.themeAccent,
      };
      setLocationData(loc, source);
    } else {
      const formattedCity = slug.charAt(0).toUpperCase() + slug.slice(1);
      const loc: LocationData = {
        id: `loc-${slug}`,
        slug: slug.toLowerCase(),
        name: `${formattedCity} Hometown Hub`,
        city: formattedCity,
        district: formattedCity,
        state: 'India',
        country: 'India',
        latitude: coords.lat,
        longitude: coords.lng,
        themeAccent: '#F59E0B',
      };
      setLocationData(loc, source);
    }
  };

  const useMyLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const userLoc: LocationData = {
            id: `loc-geo`,
            slug: 'current-location',
            name: 'Current Nearby Area',
            city: 'My Nearby Location',
            district: 'Local District',
            state: 'Nearby State',
            country: 'India',
            latitude: lat,
            longitude: lng,
            themeAccent: '#10B981',
          };
          setLocationData(userLoc, 'CURRENT_LOCATION');
        },
        () => {
          alert('Geolocation permission denied or unavailable. Please select your location manually.');
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
  };

  const setNowLocation = (loc: LocationData) => {
    setNowLocationState(loc);
    try {
      localStorage.setItem('hh_now_location', JSON.stringify(loc));
    } catch {}
  };

  const switchToHome = () => {
    if (homeLocation) {
      setLocationData(homeLocation, 'SAVED_HOMETOWN');
    }
  };

  const switchToNow = () => {
    if (nowLocation) {
      setLocationData(nowLocation, 'SAVED_HOMETOWN');
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
        setSelectedPlace,
        setLocationBySlug,
        setLocationData,
        useMyLocation,
        setHomeLocation,
        setNowLocation,
        switchToHome,
        switchToNow,
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
