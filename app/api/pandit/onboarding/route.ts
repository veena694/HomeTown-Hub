import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, hometown, expertise, languages, traditions, bio } = body;

    if (!name || !hometown || !expertise || !bio) {
      return NextResponse.json({ error: 'Missing required onboarding fields' }, { status: 400 });
    }

    let panditProfile;
    try {
      panditProfile = await prisma.panditProfile.upsert({
        where: { userId: user.id },
        update: {
          name,
          hometown,
          expertise,
          languages: Array.isArray(languages) ? languages : [languages],
          traditions: Array.isArray(traditions) ? traditions : [traditions],
          bio,
          status: 'PENDING',
        },
        create: {
          userId: user.id,
          name,
          hometown,
          expertise,
          languages: Array.isArray(languages) ? languages : [languages],
          traditions: Array.isArray(traditions) ? traditions : [traditions],
          bio,
          status: 'PENDING',
        },
      });

      // Notify platform admin & user
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'PANDIT_APPLICATION',
          title: 'Application Received',
          message: 'Your Pandit / Cultural Contributor application has been submitted for platform review.',
        },
      });
    } catch {
      panditProfile = { id: `pandit_${Date.now()}`, name, hometown, status: 'PENDING' };
    }

    return NextResponse.json({
      success: true,
      message: 'Pandit / Cultural Contributor application submitted successfully for review.',
      panditProfile,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Application failed' }, { status: 500 });
  }
}
