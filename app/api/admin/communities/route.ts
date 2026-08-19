import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== 'PLATFORM_ADMIN' && user.role !== 'COMMUNITY_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const communities = await prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { name: true, email: true } },
        _count: { select: { memberships: true, memories: true } },
      },
    });

    return NextResponse.json({ communities });
  } catch (err: any) {
    console.error('Error fetching admin communities:', err);
    return NextResponse.json({ error: 'Failed to load communities queue' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== 'PLATFORM_ADMIN' && user.role !== 'COMMUNITY_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { communityId, action } = body; // action: 'APPROVE' | 'REJECT'

    if (!communityId || !action) {
      return NextResponse.json({ error: 'communityId and action required' }, { status: 400 });
    }

    const updated = await prisma.community.update({
      where: { id: communityId },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        isVerified: action === 'APPROVE',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `COMMUNITY_${action}`,
        entity: 'Community',
        entityId: communityId,
        details: `Community ${updated.name} ${action.toLowerCase()}d by ${user.name}`,
      },
    });

    return NextResponse.json({ success: true, message: `Community ${action.toLowerCase()}d successfully`, community: updated });
  } catch (err: any) {
    console.error('Error updating community status:', err);
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
