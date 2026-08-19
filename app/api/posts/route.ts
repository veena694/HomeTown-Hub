import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communitySlug = searchParams.get('communitySlug');

  try {
    const posts = await prisma.post.findMany({
      where: communitySlug ? { community: { slug: communitySlug } } : {},
      include: {
        author: {
          select: { id: true, name: true, role: true, profile: { select: { avatarUrl: true, hometownCity: true } } },
        },
        comments: {
          include: {
            author: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
          },
          orderBy: { createdAt: 'asc' },
        },
        reactions: true,
        media: true,
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ posts });
  } catch (err: any) {
    console.error('Error fetching posts:', err);
    return NextResponse.json({ error: 'Failed to load posts from database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required to post' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { communitySlug, title, content, type, imageUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const community = await prisma.community.findFirst({
      where: { slug: communitySlug || 'panipat' },
    });

    if (!community) {
      return NextResponse.json({ error: 'Target community not found' }, { status: 404 });
    }

    const newPost = await prisma.post.create({
      data: {
        communityId: community.id,
        authorId: user.id,
        title,
        content,
        type: type || 'POST',
        media: imageUrl ? { create: [{ url: imageUrl, type: 'IMAGE' }] } : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true, profile: { select: { avatarUrl: true, hometownCity: true } } },
        },
        comments: true,
        reactions: true,
        media: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Post published!', post: newPost });
  } catch (err: any) {
    console.error('Error creating post:', err);
    return NextResponse.json({ error: err.message || 'Failed to create post' }, { status: 500 });
  }
}
