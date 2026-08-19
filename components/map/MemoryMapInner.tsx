'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DemoMemory } from '@/lib/mockData';
import { MapPin, Plus, Sparkles, Calendar, Heart, X, Upload, Eye } from 'lucide-react';
import ThenAndNowSlider from './ThenAndNowSlider';
import { useLocationContext, PlaceData } from '@/lib/LocationContext';

const createCustomIcon = (color: string, isSelected: boolean = false) => {
  const size = isSelected ? 36 : 28;
  const border = isSelected ? '4px solid #E8754F' : '3px solid white';
  const shadow = isSelected ? '0 0 16px rgba(232, 117, 79, 0.6)' : '0 4px 10px rgba(47, 58, 50, 0.15)';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: ${border}; box-shadow: ${shadow}; display: flex; items-center: center; justify-content: center; transition: all 0.3s ease;">
            <div style="width: ${isSelected ? 12 : 8}px; height: ${isSelected ? 12 : 8}px; background-color: white; border-radius: 50%;"></div>
           </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const CATEGORY_COLORS: Record<string, string> = {
  HERITAGE: '#E8754F',
  MEMORIES: '#8FB8D8',
  STORIES: '#78A88B',
  TRADITIONS: '#C99BB5',
  FOOD: '#F3B562',
  PEOPLE: '#9A7AA0',
  INITIATIVES: '#589A8D',
  HISTORIC: '#D45D36',
  FESTIVALS: '#E68A36',
  THEN_AND_NOW: '#D97706',
};

function MapClickListener({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ChangeMapView({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

interface Props {
  initialMemories: DemoMemory[];
  communitySlug: string;
}

export default function MemoryMapInner({ initialMemories, communitySlug }: Props) {
  const { currentLocation, selectedPlace, setSelectedPlace } = useLocationContext();
  const [memories, setMemories] = useState<DemoMemory[]>(initialMemories);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<number>(2026);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMemory, setActiveMemory] = useState<DemoMemory | null>(null);

  // Contribution Modal State
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStory, setNewStory] = useState('');
  const [newCategory, setNewCategory] = useState('HERITAGE');
  const [newYear, setNewYear] = useState('2000');
  const [newLat, setNewLat] = useState<number | null>(null);
  const [newLng, setNewLng] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const activeCity = currentLocation?.city || 'Panipat';
  const activeSlug = currentLocation?.slug.toLowerCase() || communitySlug.toLowerCase();
  const centerLat = currentLocation?.latitude || 29.3909;
  const centerLng = currentLocation?.longitude || 76.9635;

  useEffect(() => {
    fetch(`/api/memories?communitySlug=${activeSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.memories && data.memories.length > 0) {
          setMemories(data.memories);
        }
      })
      .catch(() => {});
  }, [activeSlug]);

  const filteredMemories = memories.filter((m) => {
    const isMatchingCity =
      m.communitySlug.toLowerCase() === activeSlug ||
      m.address.toLowerCase().includes(activeCity.toLowerCase()) ||
      activeSlug === 'current-location';
    const categoryMatch = selectedCategory === 'ALL' || m.category === selectedCategory;
    const yearMatch = m.year <= yearFilter;
    const searchMatch = !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.story.toLowerCase().includes(searchQuery.toLowerCase());
    return isMatchingCity && categoryMatch && yearMatch && searchMatch;
  });

  const handleSelectMemoryAsPlace = (m: DemoMemory) => {
    setActiveMemory(m);
    const placeObj: PlaceData = {
      id: m.id,
      name: m.title,
      latitude: m.latitude,
      longitude: m.longitude,
      category: m.category ? m.category.toLowerCase() : 'historic',
      address: m.address,
      description: m.story,
    };
    setSelectedPlace(placeObj);

    // Smooth scroll toward 3D Diorama section
    const el = document.getElementById('3d-diorama-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isSubmitOpen) {
      setNewLat(lat);
      setNewLng(lng);
      setNewAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) setNewImageUrl(data.url);
    } catch {
      alert('File upload failed');
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newStory || !newLat || !newLng) {
      setSubmitMessage('Please click on the map to set coordinates and fill out all fields.');
      return;
    }

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communitySlug: activeSlug,
          title: newTitle,
          story: newStory,
          category: newCategory,
          year: newYear,
          latitude: newLat,
          longitude: newLng,
          address: newAddress || `${activeCity} Landmark`,
          imageUrl: newImageUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const created: DemoMemory = {
          id: data.memory?.id || `mem-${Date.now()}`,
          communitySlug: activeSlug,
          title: newTitle,
          story: newStory,
          category: newCategory as any,
          year: parseInt(newYear) || 2000,
          latitude: newLat,
          longitude: newLng,
          address: newAddress || `${activeCity} Map Point`,
          authorName: 'Current User',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
          likesCount: 1,
          commentsCount: 0,
          isVerified: true,
          media: newImageUrl ? [{ url: newImageUrl, type: 'PHOTO' }] : [],
        };
        setMemories([created, ...memories]);
        setIsSubmitOpen(false);
        setSubmitMessage('');
        alert(`Memory preserved for ${activeCity}!`);
      } else {
        setSubmitMessage(data.error || 'Failed to submit memory');
      }
    } catch {
      setSubmitMessage('Submission failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#27322B] rounded-3xl border border-hub-border p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-hub-terracotta/10 text-hub-terracotta">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-display font-semibold text-hub-charcoal">{activeCity.toUpperCase()} HOMETOWN SCRAPBOOK MAP™</h2>
              <p className="text-xs text-hub-sage">Click any map place pin to dynamically trigger its 3D Miniature Diorama below</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Contribute Memory</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {['ALL', 'HERITAGE', 'MEMORIES', 'STORIES', 'TRADITIONS', 'FOOD', 'HISTORIC', 'FESTIVALS', 'THEN_AND_NOW'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-hub-terracotta text-white border-hub-terracotta shadow-xs font-semibold'
                  : 'bg-hub-stone text-hub-sage border-hub-border hover:bg-hub-border'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="pt-3 border-t border-hub-border flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-hub-charcoal">
            <Calendar className="w-4 h-4 text-hub-terracotta" />
            <span>Memory Era Filter: </span>
            <span className="font-mono font-bold text-hub-terracotta text-sm">Up to Year {yearFilter}</span>
          </div>
          <div className="flex-1 max-w-md">
            <input
              type="range"
              min="1950"
              max="2026"
              value={yearFilter}
              onChange={(e) => setYearFilter(parseInt(e.target.value))}
              className="w-full accent-hub-terracotta cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-hub-sage font-mono mt-1">
              <span>1950</span>
              <span>1970</span>
              <span>1990</span>
              <span>2010</span>
              <span>2026</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[380px] sm:h-[460px] md:h-[540px] rounded-3xl overflow-hidden border border-hub-border shadow-sm z-0">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <ChangeMapView lat={centerLat} lng={centerLng} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickListener onLocationSelect={handleMapClick} />

          {filteredMemories.map((m) => {
            const isSelected = selectedPlace?.id === m.id;
            return (
              <Marker
                key={m.id}
                position={[m.latitude, m.longitude]}
                icon={createCustomIcon(CATEGORY_COLORS[m.category] || '#E8754F', isSelected)}
                eventHandlers={{
                  click: () => handleSelectMemoryAsPlace(m),
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1">
                    <span className="text-[10px] font-bold font-mono uppercase text-hub-terracotta">{m.category} • {m.year}</span>
                    <h4 className="font-bold text-sm text-hub-charcoal">{m.title}</h4>
                    <p className="text-xs text-hub-sage line-clamp-2">{m.story}</p>
                    <button
                      onClick={() => handleSelectMemoryAsPlace(m)}
                      className="mt-2 text-xs font-semibold text-white bg-hub-terracotta px-3 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View 3D Miniature Place</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Empty State when no memories exist for selected city */}
      {filteredMemories.length === 0 && (
        <div className="p-8 rounded-3xl bg-hub-cream dark:bg-[#202A24] border border-hub-border text-center space-y-3">
          <MapPin className="w-8 h-8 text-hub-terracotta mx-auto animate-bounce" />
          <h3 className="text-lg font-display font-semibold text-hub-charcoal">{activeCity.toUpperCase()} IS WAITING FOR ITS FIRST MEMORY</h3>
          <p className="text-xs text-hub-sage max-w-md mx-auto">
            Be the pioneer contributor to pin the first oral history, heritage landmark, or Then & Now photo for {activeCity}.
          </p>
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-bold text-xs shadow-md"
          >
            Contribute First Memory for {activeCity}
          </button>
        </div>
      )}

      {/* Memory Card Detail Modal */}
      {activeMemory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#27322B] border border-hub-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-hub-charcoal shadow-2xl animate-accordion-down">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 rounded-full bg-hub-terracotta/10 text-hub-terracotta text-xs font-mono font-medium border border-hub-terracotta/20">
                  {activeMemory.category} • Year {activeMemory.year}
                </span>
                <h3 className="text-2xl font-display font-semibold text-hub-charcoal mt-2">{activeMemory.title}</h3>
                <p className="text-xs text-hub-sage flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-hub-terracotta" />
                  {activeMemory.address}
                </p>
              </div>
              <button
                onClick={() => setActiveMemory(null)}
                className="p-2 rounded-xl bg-hub-stone hover:bg-hub-border text-hub-sage hover:text-hub-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeMemory.category === 'THEN_AND_NOW' ? (
              <ThenAndNowSlider
                title={activeMemory.title}
                location={activeMemory.address}
                description={activeMemory.story}
                contributorName={activeMemory.authorName}
              />
            ) : (
              activeMemory.media && activeMemory.media.length > 0 && (
                <div className="rounded-2xl overflow-hidden max-h-80 border border-hub-border">
                  <img
                    src={activeMemory.media[0].url}
                    alt={activeMemory.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            )}

            <p className="text-sm text-hub-charcoal leading-relaxed bg-hub-cream dark:bg-[#202A24] p-4 rounded-2xl border border-hub-border">
              "{activeMemory.story}"
            </p>

            <div className="flex items-center justify-between pt-2 text-xs text-hub-sage border-t border-hub-border">
              <span>Preserved by {activeMemory.authorName}</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-hub-terracotta font-semibold">
                  <Heart className="w-4 h-4 fill-hub-terracotta" />
                  {activeMemory.likesCount} Likes
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contribute Memory Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#27322B] border border-hub-border rounded-3xl max-w-lg w-full p-6 space-y-4 text-hub-charcoal shadow-2xl">
            <div className="flex items-center justify-between border-b border-hub-border pb-3">
              <div className="flex items-center gap-2 text-hub-terracotta">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-display font-semibold">Preserve a Memory for {activeCity}</h3>
              </div>
              <button onClick={() => setIsSubmitOpen(false)} className="text-hub-sage hover:text-hub-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-hub-charcoal mb-1">Memory Title</label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. Historic ${activeCity} Town Square`}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-hub-charcoal mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
                  >
                    <option value="HERITAGE">HERITAGE</option>
                    <option value="STORIES">STORIES</option>
                    <option value="TRADITIONS">TRADITIONS</option>
                    <option value="FOOD">FOOD</option>
                    <option value="HISTORIC">HISTORIC</option>
                    <option value="THEN_AND_NOW">THEN & NOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-hub-charcoal mb-1">Year</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-hub-charcoal mb-1">Story / Detail</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share the oral story, significance, or personal memory..."
                  value={newStory}
                  onChange={(e) => setNewStory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />
              </div>

              <div className="p-3 rounded-xl bg-hub-cream dark:bg-[#202A24] border border-hub-border text-xs text-hub-sage space-y-1">
                <span className="font-semibold text-hub-terracotta">Map Location Coordinates:</span>
                <p className="text-[11px] text-hub-sage">
                  {newLat ? `Lat: ${newLat.toFixed(4)}, Lng: ${newLng?.toFixed(4)}` : 'Click anywhere on the map background to pinpoint location.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-hub-charcoal mb-1">Upload Photo</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs text-hub-sage file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-hub-stone file:text-hub-charcoal hover:file:bg-hub-border"
                  />
                  {isUploading && <span className="text-xs text-hub-terracotta animate-pulse">Uploading...</span>}
                </div>
                {newImageUrl && <p className="text-[10px] text-hub-green mt-1 font-mono">Image attached ✓</p>}
              </div>

              {submitMessage && <p className="text-xs text-hub-terracotta font-medium">{submitMessage}</p>}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-semibold text-xs shadow-md"
              >
                Publish Memory to {activeCity} Scrapbook Map
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
