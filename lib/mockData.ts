// Initial Rich Demo Data Store & Fallback Provider for Hometown Hub

export interface DemoCommunity {
  id: string;
  slug: string;
  name: string;
  city: string;
  district: string;
  state: string;
  country: string;
  description: string;
  coverUrl: string;
  avatarUrl: string;
  isVerified: boolean;
  memberCount: number;
  memoryCount: number;
  eventCount: number;
  initiativeCount: number;
  themeAccent: string; // Dynamic 3D visual theme accent
  story: {
    origin: string;
    milestones: { year: number; title: string; description: string }[];
  };
}

export interface DemoMemory {
  id: string;
  communitySlug: string;
  title: string;
  story: string;
  category: 'HERITAGE' | 'MEMORIES' | 'STORIES' | 'TRADITIONS' | 'FOOD' | 'PEOPLE' | 'INITIATIVES' | 'HISTORIC' | 'FESTIVALS' | 'BUSINESSES' | 'THEN_AND_NOW';
  year: number;
  latitude: number;
  longitude: number;
  address: string;
  authorName: string;
  authorAvatar: string;
  likesCount: number;
  commentsCount: number;
  isVerified: boolean;
  media: {
    url: string;
    caption?: string;
    type: 'PHOTO' | 'THEN_NOW_THEN' | 'THEN_NOW_NOW';
    yearLabel?: string;
  }[];
}

export interface DemoEvent {
  id: string;
  communitySlug: string;
  title: string;
  description: string;
  coverUrl: string;
  category: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  attendeesCount: number;
  organizerName: string;
  status: 'UPCOMING' | 'HAPPENING' | 'COMPLETED';
}

export interface DemoCulture {
  id: string;
  communitySlug: string;
  title: string;
  category: 'FESTIVALS' | 'TRADITIONS' | 'FOOD' | 'STORIES' | 'FOLK_ART' | 'HISTORICAL_PLACES' | 'LANGUAGES' | 'PERSONALITIES';
  summary: string;
  content: string;
  coverUrl: string;
  authorName: string;
  authorRole: string;
  isVerified: boolean;
}

export const DEMO_COMMUNITIES: DemoCommunity[] = [
  {
    id: 'comm-1',
    slug: 'panipat',
    name: 'Panipat Heritage & Community Hub',
    city: 'Panipat',
    district: 'Panipat',
    state: 'Haryana',
    country: 'India',
    description: 'The historic City of Weavers and Battles. Reconnect with Panipat’s rich textile legacy, GT Road memories, and vibrant community initiatives.',
    coverUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    memberCount: 3420,
    memoryCount: 184,
    eventCount: 29,
    initiativeCount: 14,
    themeAccent: '#F59E0B',
    story: {
      origin: 'Panipat has been a legendary crossroads of Indian history since the Mahabharata era, known historically as Panduprastha.',
      milestones: [
        { year: 1526, title: 'First Battle of Panipat', description: 'Babur defeated Ibrahim Lodi, establishing the Mughal Empire in India.' },
        { year: 1761, title: 'Third Battle of Panipat', description: 'A monumental conflict that shaped northern Indian history.' },
        { year: 1970, title: 'Industrial Handloom Era', description: 'Panipat emerged as the global Handloom & Textile capital of India.' },
        { year: 2026, title: 'Hometown Hub Digital Preservation', description: 'Community members globally document 500+ years of heritage.' }
      ]
    }
  },
  {
    id: 'comm-2',
    slug: 'jaipur',
    name: 'Jaipur Pink City Collective',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    description: 'Celebrating the royal archways, block prints, food traditions, and vibrant diaspora of Rajasthan’s capital city.',
    coverUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    memberCount: 5210,
    memoryCount: 312,
    eventCount: 45,
    initiativeCount: 22,
    themeAccent: '#EC4899',
    story: {
      origin: 'Founded in 1727 by Maharaja Sawai Jai Singh II as India’s first planned city according to Shilpa Shastra.',
      milestones: [
        { year: 1727, title: 'Founding of Jaipur', description: 'Architect Vidyadhar Bhattacharya designed the grid-style city.' },
        { year: 1876, title: 'Painted Pink for Royalty', description: 'Maharaja Ram Singh painted the entire city pink to welcome the Prince of Wales.' },
        { year: 2019, title: 'UNESCO World Heritage Site', description: 'Recognized globally for urban planning and architecture.' }
      ]
    }
  },
  {
    id: 'comm-3',
    slug: 'amritsar',
    name: 'Amritsar Roots & Heritage',
    city: 'Amritsar',
    district: 'Amritsar',
    state: 'Punjab',
    country: 'India',
    description: 'The spiritual heart of Punjab. Preserving sacred history, Phulkari crafts, culinary legendary spots, and community Seva.',
    coverUrl: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    memberCount: 4180,
    memoryCount: 245,
    eventCount: 38,
    initiativeCount: 19,
    themeAccent: '#EAB308',
    story: {
      origin: 'Founded in 1574 by Guru Ram Das Ji around a sacred holy pool (Amrit Sarovar).',
      milestones: [
        { year: 1589, title: 'Golden Temple Foundation', description: 'Saint Mian Mir laid the foundation stone of Sri Harmandir Sahib.' },
        { year: 1919, title: 'Jallianwala Bagh Legacy', description: 'A sacred monument to freedom and courage.' }
      ]
    }
  },
  {
    id: 'comm-4',
    slug: 'delhi',
    name: 'Old & New Delhi Chronicle',
    city: 'Delhi',
    district: 'Central Delhi',
    state: 'Delhi',
    country: 'India',
    description: 'From Chandni Chowk lanes to Lutyens avenues — sharing stories, food walks, historical monuments, and urban memories.',
    coverUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    memberCount: 8940,
    memoryCount: 620,
    eventCount: 72,
    initiativeCount: 35,
    themeAccent: '#3B82F6',
    story: {
      origin: 'Capital of seven historic empires, home to Indraprastha, Shahjahanabad, and modern New Delhi.',
      milestones: [
        { year: 1648, title: 'Shahjahanabad Established', description: 'Emperor Shah Jahan completed the Red Fort and Jama Masjid.' },
        { year: 1911, title: 'Capital Shift', description: 'British Raj transferred the imperial capital from Calcutta to Delhi.' }
      ]
    }
  },
  {
    id: 'comm-5',
    slug: 'gurgaon',
    name: 'Gurgaon / Gurugram Pioneers',
    city: 'Gurgaon',
    district: 'Gurugram',
    state: 'Haryana',
    country: 'India',
    description: 'Connecting the legendary village of Guru Dronacharya with modern Cyber City, local lakes, and community tree drives.',
    coverUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    memberCount: 3890,
    memoryCount: 142,
    eventCount: 31,
    initiativeCount: 16,
    themeAccent: '#10B981',
    story: {
      origin: 'Traditionally gifted to Guru Dronacharya by the Pandavas in the Mahabharata era.',
      milestones: [
        { year: 1981, title: 'Maruti Suzuki Plant', description: 'Sparked Gurgaon’s transformation into an industrial hub.' },
        { year: 2000, title: 'Cyber City Boom', description: 'Emergence as India’s leading corporate headquarters hub.' }
      ]
    }
  },
  {
    id: 'comm-6',
    slug: 'chandigarh',
    name: 'Chandigarh City Beautiful',
    city: 'Chandigarh',
    district: 'Chandigarh',
    state: 'Chandigarh',
    country: 'India',
    description: 'Celebrating Le Corbusier’s architecture, Rock Garden creations, Sukhna Lake sunsets, and sector life.',
    coverUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    memberCount: 4620,
    memoryCount: 210,
    eventCount: 40,
    initiativeCount: 20,
    themeAccent: '#06B6D4',
    story: {
      origin: 'India’s first master-planned post-independence city designed by Le Corbusier.',
      milestones: [
        { year: 1952, title: 'Foundation Stone', description: 'Jawaharlal Nehru envisioned a city unencumbered by traditions of the past.' },
        { year: 1976, title: 'Nek Chand Rock Garden Unveiling', description: 'World-famous garden built entirely from industrial waste.' }
      ]
    }
  }
];

export const DEMO_MEMORIES: DemoMemory[] = [
  {
    id: 'mem-1',
    communitySlug: 'panipat',
    title: 'Kabul Bagh Mosque & Babur’s Garden',
    story: 'Built in 1527 by Babur after his victory in the First Battle of Panipat. As a child, my grandfather used to walk us through the ancient red sandstone archways while explaining how GT Road passed right next to it.',
    category: 'HISTORIC',
    year: 1968,
    latitude: 29.3989,
    longitude: 76.9685,
    address: 'Kabul Bagh, Old Panipat, Haryana',
    authorName: 'Ramesh Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    likesCount: 142,
    commentsCount: 24,
    isVerified: true,
    media: [
      {
        url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
        caption: 'Historic Kabul Bagh Gate in autumn sunlight',
        type: 'PHOTO'
      }
    ]
  },
  {
    id: 'mem-2',
    communitySlug: 'panipat',
    title: 'Old Cloth Market & GT Road Market - Then vs Now',
    story: 'In 1984, the market was filled with hand-woven blankets and wooden bullock carts loaded with yarn. Today it is a buzzing modern wholesale textile district supplying blanket quilts across North America & Europe!',
    category: 'THEN_AND_NOW',
    year: 1984,
    latitude: 29.3909,
    longitude: 76.9635,
    address: 'Main Bazaar Road, Panipat',
    authorName: 'Sunita Verma',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    likesCount: 218,
    commentsCount: 39,
    isVerified: true,
    media: [
      {
        url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
        caption: '1984 Handloom Weaving Cart Market',
        type: 'THEN_NOW_THEN',
        yearLabel: '1984'
      },
      {
        url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
        caption: '2026 Modern Textile Hub',
        type: 'THEN_NOW_NOW',
        yearLabel: '2026'
      }
    ]
  },
  {
    id: 'mem-3',
    communitySlug: 'panipat',
    title: 'Salim Shah Tomb & Local Heritage Walk',
    story: 'Every Basant Panchami, local elders gather here to recite poetry and remember the oral folk songs of Haryana. We organized our first youth heritage clean-up drive right around these grounds.',
    category: 'HERITAGE',
    year: 1995,
    latitude: 29.3950,
    longitude: 76.9720,
    address: 'Near Old Fort Grounds, Panipat',
    authorName: 'Vikram Singh',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    likesCount: 96,
    commentsCount: 15,
    isVerified: true,
    media: [
      {
        url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
        caption: 'Monsoons around the heritage grounds',
        type: 'PHOTO'
      }
    ]
  },
  {
    id: 'mem-4',
    communitySlug: 'jaipur',
    title: 'Hawa Mahal Sunrise & Milk Tea Tradition',
    story: 'For generations, sunrise at Hawa Mahal was incomplete without Sahu’s hot spiced chai in clay kulhads. My father used to take me on his scooter before school opened.',
    category: 'FOOD',
    year: 1992,
    latitude: 26.9239,
    longitude: 75.8267,
    address: 'Hawa Mahal Rd, Badi Choupad, Jaipur',
    authorName: 'Priya Rathore',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    likesCount: 310,
    commentsCount: 42,
    isVerified: true,
    media: [
      {
        url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80',
        caption: 'Hawa Mahal glowing at dawn',
        type: 'PHOTO'
      }
    ]
  },
  {
    id: 'mem-5',
    communitySlug: 'amritsar',
    title: 'Golden Temple Night Langar Seva',
    story: 'Serving hot rotis and dal at 2 AM to thousands of visitors with total humility. This sanctuary taught our entire family the true meaning of community service.',
    category: 'TRADITIONS',
    year: 2005,
    latitude: 31.6200,
    longitude: 74.8765,
    address: 'Golden Temple Complex, Amritsar',
    authorName: 'Harpreet Singh',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    likesCount: 480,
    commentsCount: 61,
    isVerified: true,
    media: [
      {
        url: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80',
        caption: 'Golden Temple reflected in sacred waters',
        type: 'PHOTO'
      }
    ]
  }
];

export const DEMO_EVENTS: DemoEvent[] = [
  {
    id: 'evt-1',
    communitySlug: 'panipat',
    title: 'Annual Panipat Weavers & Heritage Festival 2026',
    description: 'Join us for a 3-day celebration of Panipat handlooms, live artisan demonstrations, traditional Haryana folk music, and a historic food bazaar!',
    coverUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    category: 'Cultural Festival',
    venue: 'Sector 12 Craft Fair Grounds',
    location: 'Panipat, Haryana',
    startDate: '2026-09-10T10:00:00Z',
    endDate: '2026-09-12T20:00:00Z',
    capacity: 500,
    attendeesCount: 342,
    organizerName: 'Panipat Cultural Association',
    status: 'UPCOMING'
  },
  {
    id: 'evt-2',
    communitySlug: 'panipat',
    title: 'GT Road Memory Walk & Photo Workshop',
    description: 'A guided morning walk capturing historical buildings, vintage storefronts, and storytelling with senior citizens of Panipat.',
    coverUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    category: 'Heritage Walk',
    venue: 'Old Subzi Mandi Chowk',
    location: 'Panipat, Haryana',
    startDate: '2026-08-28T06:30:00Z',
    endDate: '2026-08-28T10:00:00Z',
    capacity: 60,
    attendeesCount: 48,
    organizerName: 'Priya Sharma (Pandit/Cultural Guide)',
    status: 'UPCOMING'
  },
  {
    id: 'evt-3',
    communitySlug: 'jaipur',
    title: 'Teej Cultural Procession & Ghewar Workshop',
    description: 'Experience the traditional Rajasthani swings, folk dance, and sweet making heritage with master halwais.',
    coverUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    category: 'Traditional Festival',
    venue: 'City Palace Courtyard',
    location: 'Jaipur, Rajasthan',
    startDate: '2026-09-01T15:00:00Z',
    endDate: '2026-09-01T21:00:00Z',
    capacity: 300,
    attendeesCount: 285,
    organizerName: 'Jaipur Royal Heritage Trust',
    status: 'UPCOMING'
  }
];

export const DEMO_CULTURE: DemoCulture[] = [
  {
    id: 'cult-1',
    communitySlug: 'panipat',
    title: 'The Art of Panipat Khes & Durrie Weaving',
    category: 'FOLK_ART',
    summary: 'Discover how traditional double-layer cotton blankets (Khes) were woven on pit looms across villages in Panipat.',
    content: 'Panipat has held the title of "Textile City" for over a century. The traditional Khes is a woven cotton bedcover featuring geometric patterns created using a specialized Jacquard handloom technique. Master weavers pass down intricate mathematical counting patterns through oral memory from generation to generation.',
    coverUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    authorName: 'Pandit Devrat Sharma',
    authorRole: 'Verified Cultural Historian',
    isVerified: true
  },
  {
    id: 'cult-2',
    communitySlug: 'panipat',
    title: 'Stories of GT Road Sarai & Traveler Hospices',
    category: 'STORIES',
    summary: 'How Sher Shah Suri’s imperial road shaped hospitality and community food traditions in Panipat.',
    content: 'The Grand Trunk Road is one of Asia’s oldest and longest major roads. Panipat was a crucial stopping point for caravans traveling between Kabul, Delhi, and Bengal. Special sarais provided free food, fresh water wells, and resting quarters for travelers of all faiths.',
    coverUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    authorName: 'Anita Shastri',
    authorRole: 'Senior Cultural Contributor',
    isVerified: true
  }
];
