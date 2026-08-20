import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communitySlug = (searchParams.get('communitySlug') || 'panipat').toLowerCase();
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');

  try {
    const community = await prisma.community.findUnique({ where: { slug: communitySlug } });

    let whereClause: any = {
      status: 'APPROVED',
      ...(category && category !== 'ALL' ? { category: category as any } : {}),
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
    };

    if (community) {
      whereClause.communityId = community.id;
    } else {
      // If no explicit community record exists for this city slug (e.g. Patna, Gurugram, Delhi),
      // match memories by address/title/city containing the requested location name,
      // or by geographic coordinates if provided.
      const cityName = communitySlug.split('-')[0];
      if (latStr && lngStr) {
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        whereClause.AND = [
          { latitude: { gte: lat - 0.5, lte: lat + 0.5 } },
          { longitude: { gte: lng - 0.5, lte: lng + 0.5 } },
        ];
      } else {
        whereClause.OR = [
          { address: { contains: cityName, mode: 'insensitive' } },
          { title: { contains: cityName, mode: 'insensitive' } },
          { story: { contains: cityName, mode: 'insensitive' } },
        ];
      }
    }

    const memories = await prisma.memory.findMany({
      where: whereClause,
      include: {
        author: {
          select: { name: true, profile: { select: { avatarUrl: true } } },
        },
        media: true,
        reactions: true,
        _count: { select: { comments: true, reactions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = memories.map((m) => ({
      id: m.id,
      communitySlug: community ? community.slug : communitySlug,
      title: m.title,
      story: m.story,
      category: m.category,
      year: m.year,
      latitude: m.latitude,
      longitude: m.longitude,
      address: m.address,
      authorName: m.author.name,
      authorAvatar: m.author.profile?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      likesCount: m.likesCount + m._count.reactions,
      commentsCount: m._count.comments,
      isVerified: m.isVerified,
      media: m.media.map((mediaItem) => ({
        url: mediaItem.url,
        caption: mediaItem.caption,
        type: mediaItem.type,
        yearLabel: mediaItem.yearLabel,
      })),
    }));

    return NextResponse.json({ memories: formatted });
  } catch (err: any) {
    console.error('Error fetching memories:', err);
    return NextResponse.json({ error: 'Failed to load memories from database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { communitySlug, title, story, category, year, latitude, longitude, address, imageUrl } = body;

    if (!title || !story) {
      return NextResponse.json({ error: 'Title and story are required' }, { status: 400 });
    }

    const slug = (communitySlug || 'panipat').toLowerCase();
    let community = await prisma.community.findUnique({ where: { slug } });

    if (!community) {
      // Auto-upsert community for new cities so users can contribute memories to any hometown
      const cityName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
      community = await prisma.community.create({
        data: {
          slug,
          name: `${cityName} Community Hub`,
          city: cityName,
          state: 'India',
          district: cityName,
          description: `Hometown memories, heritage, and diaspora community for ${cityName}.`,
          createdById: user.id,
        },
      });
    }

    const memory = await prisma.memory.create({
      data: {
        communityId: community.id,
        authorId: user.id,
        title,
        story,
        category: category || 'HERITAGE',
        year: parseInt(year) || new Date().getFullYear(),
        latitude: parseFloat(latitude) || 20.0,
        longitude: parseFloat(longitude) || 75.0,
        address: address || `${community.city}, India`,
        status: 'APPROVED',
        ...(imageUrl
          ? {
              media: {
                create: {
                  url: imageUrl,
                  type: 'IMAGE',
                  caption: title,
                },
              },
            }
          : {}),
      },
      include: {
        media: true,
      },
    });

    return NextResponse.json({ memory });
  } catch (err: any) {
    console.error('Error creating memory:', err);
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 });
  }
}
