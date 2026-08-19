import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communitySlug = searchParams.get('communitySlug') || 'panipat';
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    const community = await prisma.community.findUnique({ where: { slug: communitySlug } });

    const memories = await prisma.memory.findMany({
      where: {
        ...(community ? { communityId: community.id } : {}),
        status: 'APPROVED',
        ...(category && category !== 'ALL' ? { category: category as any } : {}),
        ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      },
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
      communitySlug,
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
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required to post memory' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { communitySlug, title, story, category, year, latitude, longitude, address, imageUrl, thenNowThenUrl, thenNowNowUrl } = body;

    if (!title || !story || !latitude || !longitude) {
      return NextResponse.json({ error: 'Missing required fields (title, story, latitude, longitude)' }, { status: 400 });
    }

    const community = await prisma.community.findFirst({
      where: { slug: communitySlug || 'panipat' },
    });

    if (!community) {
      return NextResponse.json({ error: 'Target community not found' }, { status: 404 });
    }

    const newMemory = await prisma.memory.create({
      data: {
        communityId: community.id,
        authorId: user.id,
        title,
        story,
        category: category || 'HERITAGE',
        year: parseInt(year) || 2000,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || 'Community Landmark',
        status: 'APPROVED',
        media: {
          create: [
            ...(imageUrl ? [{ url: imageUrl, caption: title, type: 'PHOTO' }] : []),
            ...(thenNowThenUrl ? [{ url: thenNowThenUrl, caption: 'Historical Photo', type: 'THEN_NOW_THEN', yearLabel: 'Then' }] : []),
            ...(thenNowNowUrl ? [{ url: thenNowNowUrl, caption: 'Modern Photo', type: 'THEN_NOW_NOW', yearLabel: 'Now' }] : []),
          ],
        },
      },
      include: {
        media: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'MEMORY_CREATED',
        title: 'You Preserved a Piece of Home!',
        message: `Your memory "${title}" has been published to the Hometown Memory Map™.`,
        link: `/community/${communitySlug || 'panipat'}/memory-map`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Memory published to Hometown Memory Map™!',
      memory: newMemory,
    });
  } catch (err: any) {
    console.error('Error creating memory:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit memory' }, { status: 500 });
  }
}
