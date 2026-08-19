import { NextResponse } from 'next/server';

interface PlacePOI {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  latitude: number;
  longitude: number;
  tags?: Record<string, string>;
  importance: number;
}

// In-memory cache for POI requests
const poiCache = new Map<string, { timestamp: number; places: PlacePOI[] }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusStr = searchParams.get('radius') || '8000';
    const limitStr = searchParams.get('limit') || '8';

    if (!latStr || !lngStr) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const radius = Math.min(Math.max(parseInt(radiusStr), 1000), 25000);
    const limit = Math.min(Math.max(parseInt(limitStr), 1), 15);

    const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}_${radius}`;
    const cached = poiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ places: cached.places.slice(0, limit), source: 'cache' });
    }

    // Overpass API Query for Real POIs (historic, tourism, amenity, leisure, heritage)
    const overpassQuery = `
      [out:json][timeout:10];
      (
        node["historic"](around:${radius},${lat},${lng});
        way["historic"](around:${radius},${lat},${lng});
        node["tourism"~"attraction|museum|monument|viewpoint"](around:${radius},${lat},${lng});
        way["tourism"~"attraction|museum|monument|viewpoint"](around:${radius},${lat},${lng});
        node["amenity"~"place_of_worship|marketplace"](around:${radius},${lat},${lng});
        way["amenity"~"place_of_worship|marketplace"](around:${radius},${lat},${lng});
      );
      out center 20;
    `;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    const response = await fetch(overpassUrl, {
      headers: { 'User-Agent': 'HometownHub/1.0 (Digital Community Platform)' },
    });

    if (!response.ok) {
      throw new Error(`Overpass API responded with ${response.status}`);
    }

    const data = await response.json();
    const rawElements = data.elements || [];

    const places: PlacePOI[] = [];
    const seenNames = new Set<string>();

    for (const elem of rawElements) {
      const tags = elem.tags || {};
      const name = tags.name || tags['name:en'] || tags.official_name;
      if (!name || seenNames.has(name.toLowerCase())) continue;

      seenNames.add(name.toLowerCase());

      const elemLat = elem.lat || (elem.center && elem.center.lat) || lat;
      const elemLng = elem.lon || (elem.center && elem.center.lon) || lng;

      let category = 'landmark';
      let subcategory = 'building';
      let importance = 5;

      if (tags.historic) {
        category = 'heritage';
        subcategory = tags.historic;
        importance = 9;
      } else if (tags.tourism) {
        category = 'tourism';
        subcategory = tags.tourism;
        importance = 8;
      } else if (tags.amenity === 'place_of_worship') {
        category = 'worship';
        subcategory = tags.religion || 'temple';
        importance = 7;
      } else if (tags.amenity === 'marketplace') {
        category = 'market';
        subcategory = 'market';
        importance = 6;
      }

      places.push({
        id: `poi-${elem.type}-${elem.id}`,
        name,
        category,
        subcategory,
        latitude: elemLat,
        longitude: elemLng,
        tags,
        importance,
      });
    }

    // Sort places by importance score
    places.sort((a, b) => b.importance - a.importance);

    poiCache.set(cacheKey, { timestamp: Date.now(), places });

    return NextResponse.json({
      places: places.slice(0, limit),
      count: places.length,
      source: 'overpass_openstreetmap',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        places: [],
        error: error.message || 'Failed to fetch nearby places',
        fallback: true,
      },
      { status: 200 }
    );
  }
}
