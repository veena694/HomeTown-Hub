import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const city = searchParams.get('city') || '';

  if (!query && !city) {
    return NextResponse.json({ communities: [], memories: [], events: [], posts: [], people: [], culture: [] });
  }

  const searchTerm = query.toLowerCase().trim();

  try {
    const communities = await prisma.community.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { city: { contains: searchTerm || city, mode: 'insensitive' } },
          { state: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    const memories = await prisma.memory.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { story: { contains: searchTerm, mode: 'insensitive' } },
          { address: { contains: searchTerm || city, mode: 'insensitive' } },
        ],
      },
      include: { author: { select: { name: true } } },
      take: 5,
    });

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { venue: { contains: searchTerm || city, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: { author: { select: { name: true } } },
      take: 5,
    });

    const people = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { profile: { hometownCity: { contains: searchTerm || city, mode: 'insensitive' } } },
          { profile: { currentCity: { contains: searchTerm, mode: 'insensitive' } } },
          { profile: { profession: { contains: searchTerm, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        name: true,
        profile: { select: { hometownCity: true, currentCity: true, profession: true, avatarUrl: true } },
      },
      take: 5,
    });

    const culture = await prisma.culturalContent.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { summary: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    return NextResponse.json({
      communities,
      memories,
      events,
      posts,
      people,
      culture,
    });
  } catch (err: any) {
    console.error('Error in unified search:', err);
    return NextResponse.json({ error: 'Search query failed' }, { status: 500 });
  }
}
