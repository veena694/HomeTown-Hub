import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required to RSVP' }, { status: 401 });
  }

  const { id: eventId } = params;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { attendees: true } } },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const existing = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: { eventId, userId: user.id },
      },
    });

    if (existing) {
      await prisma.eventAttendee.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, isAttending: false, message: 'RSVP cancelled' });
    } else {
      if (event._count.attendees >= event.capacity) {
        return NextResponse.json({ error: 'Event capacity reached' }, { status: 400 });
      }

      await prisma.eventAttendee.create({
        data: { eventId, userId: user.id, status: 'GOING' },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'EVENT_RSVP',
          title: 'See You There!',
          message: `You are confirmed for "${event.title}".`,
          link: `/community/${event.communityId}`,
        },
      });

      return NextResponse.json({ success: true, isAttending: true, message: 'RSVP confirmed!' });
    }
  } catch (err: any) {
    console.error('Error in event RSVP:', err);
    return NextResponse.json({ error: err.message || 'RSVP operation failed' }, { status: 500 });
  }
}
