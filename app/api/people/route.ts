import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hometown = searchParams.get('hometown') || '';
  const currentCity = searchParams.get('currentCity') || '';
  const search = searchParams.get('search') || '';

  try {
    const users = await prisma.user.findMany({
      where: {
        profile: {
          privacy: { in: ['PUBLIC', 'COMMUNITY_ONLY'] },
          ...(hometown ? { hometownCity: { contains: hometown, mode: 'insensitive' } } : {}),
          ...(currentCity ? { currentCity: { contains: currentCity, mode: 'insensitive' } } : {}),
        },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { profile: { profession: { contains: search, mode: 'insensitive' } } },
                { profile: { school: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            avatarUrl: true,
            coverUrl: true,
            hometownCity: true,
            hometownState: true,
            currentCity: true,
            currentState: true,
            profession: true,
            school: true,
            gradYear: true,
            interests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error('Error searching people directory:', err);
    return NextResponse.json({ error: 'Failed to search people directory' }, { status: 500 });
  }
}
