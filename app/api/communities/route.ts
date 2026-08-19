import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  try {
    const dbCommunities = await prisma.community.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
              { state: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      include: {
        _count: {
          select: { memberships: true, memories: true, events: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = dbCommunities.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      city: c.city,
      district: c.district,
      state: c.state,
      country: c.country,
      description: c.description,
      coverUrl: c.coverUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      avatarUrl: c.avatarUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&q=80',
      isVerified: c.isVerified,
      status: c.status,
      memberCount: c._count.memberships,
      memoryCount: c._count.memories,
      eventCount: c._count.events,
      themeAccent: c.slug === 'jaipur' ? '#E8754F' : c.slug === 'amritsar' ? '#F3B562' : '#78A88B',
    }));

    return NextResponse.json({ communities: formatted });
  } catch (err: any) {
    console.error('Error fetching communities:', err);
    return NextResponse.json({ error: 'Failed to load communities from database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required to create a community' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, city, district, state, country, description, rules, coverUrl, avatarUrl } = body;

    if (!name || !city || !state || !description) {
      return NextResponse.json({ error: 'Missing required community fields (name, city, state, description)' }, { status: 400 });
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newCommunity = await prisma.community.create({
      data: {
        slug,
        name,
        city,
        district: district || city,
        state,
        country: country || 'India',
        description,
        coverUrl,
        avatarUrl,
        status: 'PENDING',
        createdById: user.id,
        memberships: {
          create: [{ userId: user.id, role: 'ADMIN', status: 'APPROVED' }],
        },
        rules: rules
          ? {
              create: rules.map((r: string, index: number) => ({
                title: `Rule ${index + 1}`,
                description: r,
                orderIndex: index + 1,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Community submitted successfully! Pending platform admin review.',
      community: newCommunity,
    });
  } catch (err: any) {
    console.error('Error creating community:', err);
    return NextResponse.json({ error: err.message || 'Failed to create community' }, { status: 500 });
  }
}
