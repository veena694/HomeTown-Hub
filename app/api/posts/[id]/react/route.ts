import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id: postId } = params;

  try {
    const existing = await prisma.reaction.findFirst({
      where: {
        userId: user.id,
        postId,
      },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, reacted: false });
    } else {
      await prisma.reaction.create({
        data: {
          userId: user.id,
          postId,
          type: 'LIKE',
        },
      });
      return NextResponse.json({ success: true, reacted: true });
    }
  } catch (err: any) {
    console.error('Error toggling reaction:', err);
    return NextResponse.json({ error: err.message || 'Reaction failed' }, { status: 500 });
  }
}
