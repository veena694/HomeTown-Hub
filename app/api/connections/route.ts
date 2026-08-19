import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = await getSessionUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ user1Id: authUser.id }, { user2Id: authUser.id }],
      },
      include: {
        user1: { select: { id: true, name: true, username: true, profile: true } },
        user2: { select: { id: true, name: true, username: true, profile: true } },
      },
    });

    const requests = await prisma.connectionRequest.findMany({
      where: { receiverId: authUser.id, status: 'PENDING' },
      include: {
        sender: { select: { id: true, name: true, username: true, profile: true } },
      },
    });

    return NextResponse.json({ connections, pendingRequests: requests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch connections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getSessionUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId, action } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    if (action === 'ACCEPT') {
      await prisma.connectionRequest.updateMany({
        where: { senderId: targetUserId, receiverId: authUser.id },
        data: { status: 'ACCEPTED' },
      });

      const connection = await prisma.connection.create({
        data: { user1Id: targetUserId, user2Id: authUser.id },
      });

      return NextResponse.json({ success: true, connection, status: 'CONNECTED' });
    }

    if (action === 'DECLINE') {
      await prisma.connectionRequest.updateMany({
        where: { senderId: targetUserId, receiverId: authUser.id },
        data: { status: 'DECLINED' },
      });
      return NextResponse.json({ success: true, status: 'DECLINED' });
    }

    const requestRecord = await prisma.connectionRequest.upsert({
      where: {
        senderId_receiverId: {
          senderId: authUser.id,
          receiverId: targetUserId,
        },
      },
      update: { status: 'PENDING' },
      create: {
        senderId: authUser.id,
        receiverId: targetUserId,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, requestRecord, status: 'REQUESTED' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Connection action failed' }, { status: 500 });
  }
}
