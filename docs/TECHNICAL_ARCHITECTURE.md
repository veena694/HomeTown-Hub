# Hometown Hub — Technical Architecture & Engineering Specification

## 1. Architectural Overview

Hometown Hub follows a modular full-stack architecture built on Next.js App Router, combining client-side WebGL/3D graphics, Leaflet GIS mapping, and server-side Prisma ORM database services.

```
+-----------------------------------------------------------------------------------+
|                                   BROWSER CLIENT                                  |
|   +-----------------------+   +------------------------+   +-------------------+  |
|   |  Three.js / R3F Scene |   | Leaflet Memory Map™    |   | Next.js App Router|  |
|   |  Miniature Hometown   |   | Then & Now Slider      |   | Responsive UI/UX  |  |
|   +-----------------------+   +------------------------+   +-------------------+  |
+-----------------------------------------|-----------------------------------------+
                                          | HTTP / API Routes
+-----------------------------------------v-----------------------------------------+
|                                 NEXT.JS API SERVER                                |
|   +-----------------------+   +------------------------+   +-------------------+  |
|   | JWT Session Auth      |   | Server-Side RBAC       |   | Analytics Queries |  |
|   +-----------------------+   +------------------------+   +-------------------+  |
+-----------------------------------------|-----------------------------------------+
                                          | Prisma Client
+-----------------------------------------v-----------------------------------------+
|                               POSTGRESQL DATABASE                                 |
|  Users • Communities • Memories • Events • Culture • PanditProfiles • AuditLogs   |
+-----------------------------------------------------------------------------------+
```

## 2. 3D & Performance Strategy

- **Dynamic Canvas Loading**: 3D components check WebGL context capability (`getContext('webgl')`) prior to mounting `<Canvas>`. If WebGL is missing or reduced motion is requested, `<WebGLFallback />` renders smoothly.
- **Framerate & Shadow Limits**: Geometry polycounts are strictly capped under 2,000 vertices per scene; light sources are limited to 1 directional and 1 point light.

## 3. Database & Persistence Layer

- **ORM**: Prisma Client singleton initialized in `lib/prisma.ts`.
- **Relational Integrity**: Foreign key constraints, cascading deletions on user profile data, composite index on memory coordinates `(latitude, longitude)`.
