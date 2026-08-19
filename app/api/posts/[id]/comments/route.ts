import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required to comment' }, { status: 401 });
  }

  const { id: postId } = params;

  try {
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content cannot be empty' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: user.id,
        content: content.trim(),
      },
      include: {
        author: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
      },
    });

    // Notify post author
    if (post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: 'POST_COMMENT',
          title: 'New Comment',
          message: `${user.name} commented on your post "${post.title.slice(0, 30)}..."`,
          link: `/community/${post.communityId}`,
        },
      });
    }

    return NextResponse.json({ success: true, comment });
  } catch (err: any) {
    console.error('Error creating comment:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit comment' }, { status: 500 });
  }
}
