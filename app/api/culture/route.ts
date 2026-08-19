import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communitySlug = searchParams.get('communitySlug');
  const category = searchParams.get('category');

  try {
    const articles = await prisma.culturalContent.findMany({
      where: {
        ...(communitySlug ? { community: { slug: communitySlug } } : {}),
        ...(category && category !== 'ALL' ? { category: category as any } : {}),
      },
      include: {
        author: { select: { id: true, name: true, role: true, profile: { select: { avatarUrl: true } } } },
        community: { select: { name: true, slug: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ articles });
  } catch (err: any) {
    console.error('Error fetching cultural content:', err);
    return NextResponse.json({ error: 'Failed to load cultural content' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { communitySlug, title, category, summary, content, coverUrl } = body;

    if (!title || !summary || !content) {
      return NextResponse.json({ error: 'Missing required article fields (title, summary, content)' }, { status: 400 });
    }

    const community = await prisma.community.findFirst({
      where: { slug: communitySlug || 'panipat' },
    });

    if (!community) {
      return NextResponse.json({ error: 'Target community not found' }, { status: 404 });
    }

    const isVerifiedUser = user.role === 'PANDIT' || user.role === 'PLATFORM_ADMIN' || user.role === 'COMMUNITY_ADMIN';

    const article = await prisma.culturalContent.create({
      data: {
        communityId: community.id,
        authorId: user.id,
        title,
        category: category || 'TRADITIONS',
        summary,
        content,
        coverUrl,
        isVerified: isVerifiedUser,
      },
      include: {
        author: { select: { name: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, message: 'Cultural article published!', article });
  } catch (err: any) {
    console.error('Error publishing cultural article:', err);
    return NextResponse.json({ error: err.message || 'Failed to publish article' }, { status: 500 });
  }
}
