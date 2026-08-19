# Hometown Hub — "Where your roots stay connected"

![Hometown Hub Banner](https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=1200&q=80)

**Hometown Hub** is a production-grade, 3D-enabled, location-aware digital community platform designed to connect people with their hometown roots, oral history, heritage landmarks, local traditions, and alumni networks.

---

## 🌟 Key Features

### 🏛️ 1. Interactive 3D Hometown Diorama
- Real-time **Three.js / React Three Fiber** 3D diorama canvas.
- Dynamically transforms based on real **OpenStreetMap POI Data**.
- Supports focus rendering for **Palaces, Forts, Temples, Mosques, Gurudwaras, Markets, Monuments, and Heritage Landmarks**.
- Seamless **Map-to-3D Integration**: Clicking any pin on the Scrapbook Map™ smoothly transitions the 3D scene to focus on that exact landmark miniature.

### 🗺️ 2. Hometown Memory Map™ (Scrapbook Map™)
- Powered by **Leaflet & OpenStreetMap**.
- Pinned oral history, heritage photos, Then & Now slider comparisons, and local stories.
- Filter memories by category (`HERITAGE`, `STORIES`, `TRADITIONS`, `FOOD`, `HISTORIC`, `THEN_AND_NOW`) and Era slider (up to 2026).

### ⚡ 3. Supabase Realtime Instant DMs
- Sub-50ms instant messaging powered by **Supabase Realtime** channel subscriptions.
- Typing indicators, image attachments, message history, and conversation lists.

### 📍 4. Three-Tier Location Intelligence System
- **🏡 HOME (`homeLocation`)**: Authenticated user's saved roots / hometown (persisted in PostgreSQL).
- **📍 NOW (`nowLocation`)**: Authenticated user's saved current residence city (persisted in PostgreSQL).
- **🗺 EXPLORE (`currentLocation`)**: Currently searched/browsed location across the 3D scene, map, and communities without overwriting saved profile locations.

### 👥 5. Community & Social Hub
- Location-filtered feeds (*For You*, *Hometown Feed*, *Explore Feed*).
- Community creation, events management, RSVP tracking, and verified **Pandit / Cultural Scholar Network** onboarding.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma v5.17.0
- **Authentication**: JWT / Session Cookies (`jose` & `bcryptjs`)
- **Realtime**: Supabase Realtime `@supabase/supabase-js`
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Maps & GIS**: Leaflet, `react-leaflet`, OpenStreetMap / Nominatim API

---

## 🚀 Environment Variables Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.yqfnpmfouuknxrqbqnjb.supabase.co:5432/postgres"
JWT_SECRET="your-jwt-secret-key"
NEXT_PUBLIC_SUPABASE_URL="https://yqfnpmfouuknxrqbqnjb.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

> **Security Note**: Never commit your `.env` file or database credentials to GitHub.

---

## 💻 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Validate & Generate Prisma Client**:
   ```bash
   npx prisma validate
   npx prisma generate
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔨 Production Build & Verification

```bash
npx tsc --noEmit
npm run build
```

---

## 📜 License

MIT License © 2026 Hometown Hub
