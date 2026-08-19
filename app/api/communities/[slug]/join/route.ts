import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { slug } = params;

  try {
    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const existing = await prisma.communityMembership.findUnique({
      where: {
        userId_communityId: {
          userId: user.id,
          communityId: community.id,
        },
      },
    });

    if (existing) {
      await prisma.communityMembership.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, isMember: false, message: `Left ${community.name}` });
    } else {
      await prisma.communityMembership.create({
        data: {
          userId: user.id,
          communityId: community.id,
          role: 'MEMBER',
          status: 'APPROVED',
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'COMMUNITY_JOIN',
          title: 'Welcome Home!',
          message: `You have joined the ${community.name} community.`,
          link: `/community/${community.slug}`,
        },
      });

      return NextResponse.json({ success: true, isMember: true, message: `Joined ${community.name}` });
    }
  } catch (err: any) {
    console.error('Error in community join/leave:', err);
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
