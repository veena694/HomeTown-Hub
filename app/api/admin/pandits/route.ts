import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== 'PLATFORM_ADMIN' && user.role !== 'COMMUNITY_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const pandits = await prisma.panditProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ pandits });
  } catch (err: any) {
    console.error('Error fetching pandits queue:', err);
    return NextResponse.json({ error: 'Failed to load pandits queue' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== 'PLATFORM_ADMIN' && user.role !== 'COMMUNITY_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { panditId, action } = body; // action: 'APPROVE' | 'REJECT'

    if (!panditId || !action) {
      return NextResponse.json({ error: 'panditId and action required' }, { status: 400 });
    }

    const pandit = await prisma.panditProfile.findUnique({ where: { id: panditId } });
    if (!pandit) {
      return NextResponse.json({ error: 'Pandit profile not found' }, { status: 404 });
    }

    const updated = await prisma.panditProfile.update({
      where: { id: panditId },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        reviewedBy: user.name,
      },
    });

    if (action === 'APPROVE') {
      await prisma.user.update({
        where: { id: pandit.userId },
        data: { role: 'PANDIT' },
      });

      await prisma.notification.create({
        data: {
          userId: pandit.userId,
          type: 'PANDIT_APPROVED',
          title: 'Application Approved!',
          message: 'Congratulations! You are now a Verified Pandit / Cultural Scholar on Hometown Hub.',
          link: '/cultural-contributor/onboarding',
        },
      });
    }

    return NextResponse.json({ success: true, message: `Pandit application ${action.toLowerCase()}d`, pandit: updated });
  } catch (err: any) {
    console.error('Error updating pandit application:', err);
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
