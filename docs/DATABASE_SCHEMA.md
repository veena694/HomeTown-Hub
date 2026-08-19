# Hometown Hub — Database Schema Documentation

## Entity Relationship Overview

### Primary Entities
1. **User**: Standard user model with role-based access control (`USER`, `COMMUNITY_MODERATOR`, `COMMUNITY_ADMIN`, `PLATFORM_ADMIN`, `PANDIT`).
2. **Profile**: Isolated profile entity storing `hometownCity`, `hometownState`, `currentCity`, `currentState`, `profession`, `school`, and privacy settings.
3. **Community**: Hometown hub entity linked to city, district, state, country, creation status (`SUBMITTED`, `PENDING`, `APPROVED`), and rule sets.
4. **Memory**: Core entity for the **Hometown Memory Map™**, containing coordinates (`latitude`, `longitude`), category, historical year, status, and media relations.
5. **MemoryMedia**: Supports single photo uploads as well as dual `THEN_NOW_THEN` / `THEN_NOW_NOW` image pairs for Then & Now comparison.
6. **Event & EventAttendee**: Handles events, capacities, start/end dates, and unique attendee constraints `(eventId, userId)`.
7. **CulturalContent**: High-value cultural articles written by verified Pandits or senior contributors.
8. **PanditProfile**: Onboarding & verification record for cultural scholars.
9. **Report & ModerationAction**: Content abuse reporting and audit trail logging.
