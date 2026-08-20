import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required to update profile' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      bio,
      avatarUrl,
      coverUrl,
      hometownCity,
      hometownState,
      currentCity,
      currentState,
      profession,
      school,
      gradYear,
      interests,
      privacy,
    } = body;

    if (name && name.trim()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        ...(bio !== undefined ? { bio } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(coverUrl !== undefined ? { coverUrl } : {}),
        ...(hometownCity !== undefined ? { hometownCity } : {}),
        ...(hometownState !== undefined ? { hometownState } : {}),
        ...(currentCity !== undefined ? { currentCity } : {}),
        ...(currentState !== undefined ? { currentState } : {}),
        ...(profession !== undefined ? { profession } : {}),
        ...(school !== undefined ? { school } : {}),
        ...(gradYear !== undefined ? { gradYear: parseInt(gradYear) || null } : {}),
        ...(interests !== undefined ? { interests: Array.isArray(interests) ? interests : [interests] } : {}),
        ...(privacy !== undefined ? { privacy } : {}),
      },
      create: {
        userId: user.id,
        bio: bio || 'Hometown Hub member',
        avatarUrl,
        coverUrl,
        hometownCity: hometownCity || '',
        hometownState: hometownState || '',
        currentCity: currentCity || '',
        currentState: currentState || '',
        profession,
        school,
        gradYear: parseInt(gradYear) || null,
        interests: Array.isArray(interests) ? interests : [],
        privacy: privacy || 'PUBLIC',
      },
    });

    return NextResponse.json({ success: true, message: 'Profile updated successfully!', profile: updatedProfile });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 500 });
  }
}
