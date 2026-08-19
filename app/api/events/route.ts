import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communitySlug = searchParams.get('communitySlug') || 'panipat';

  try {
    const dbEvents = await prisma.event.findMany({
      where: communitySlug !== 'all' ? { community: { slug: communitySlug } } : {},
      include: {
        organizer: { select: { name: true } },
        _count: { select: { attendees: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    const formatted = dbEvents.map((e) => ({
      id: e.id,
      communitySlug,
      title: e.title,
      description: e.description,
      coverUrl: e.coverUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      category: e.category,
      venue: e.venue,
      location: e.location,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      capacity: e.capacity,
      attendeesCount: e._count.attendees,
      organizerName: e.organizer.name,
      status: e.status,
    }));

    return NextResponse.json({ events: formatted });
  } catch (err: any) {
    console.error('Error fetching events:', err);
    return NextResponse.json({ error: 'Failed to load events from database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required to create event' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { communitySlug, title, description, category, venue, location, startDate, endDate, capacity, coverUrl } = body;

    if (!title || !description || !venue || !startDate) {
      return NextResponse.json({ error: 'Missing required event fields (title, description, venue, startDate)' }, { status: 400 });
    }

    const community = await prisma.community.findFirst({
      where: { slug: communitySlug || 'panipat' },
    });

    if (!community) {
      return NextResponse.json({ error: 'Target community not found' }, { status: 404 });
    }

    const newEvent = await prisma.event.create({
      data: {
        communityId: community.id,
        organizerId: user.id,
        title,
        description,
        category: category || 'Community Gathering',
        venue,
        location: location || 'Community Grounds',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        capacity: parseInt(capacity) || 100,
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Event created successfully!',
      event: newEvent,
    });
  } catch (err: any) {
    console.error('Error creating event:', err);
    return NextResponse.json({ error: err.message || 'Failed to create event' }, { status: 500 });
  }
}
