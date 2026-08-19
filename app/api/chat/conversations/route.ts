import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = await getSessionUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: authUser.id },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                profile: {
                  select: {
                    avatarUrl: true,
                    hometownCity: true,
                    currentCity: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ conversations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getSessionUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { participants: { some: { userId: authUser.id } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    if (existing) {
      return NextResponse.json({ conversation: existing, existing: true });
    }

    const conversation = await prisma.conversation.create({
      data: {
        type: 'DIRECT',
        participants: {
          create: [
            { userId: authUser.id },
            { userId: targetUserId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ conversation, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create conversation' }, { status: 500 });
  }
}
